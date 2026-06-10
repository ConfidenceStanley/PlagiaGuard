# backend/app/routers/documents.py

import os
import math
from datetime import datetime, timezone
from typing import Optional
from bson import ObjectId
from fastapi import (
    APIRouter, 
    Depends, 
    File, 
    UploadFile, 
    Form, 
    HTTPException, 
    status,
    Query
)

from app.core.dependencies import get_current_user, require_student
from app.core.config import settings
from app.database.connection import get_documents_collection, get_notifications_collection
from app.models.document import (
    DocumentUploadResponse,
    DocumentListResponse,
    DocumentDetailResponse,
    DocumentResponse
)
from app.services.text_extractor import extract_text
from app.services.preprocessor import process_document
from app.services.fingerprint import generate_fingerprint
from app.utils.file_handler import (
    upload_file_to_cloudinary,
    delete_file_from_cloudinary,
    format_file_size
)


router = APIRouter(prefix="/api/documents", tags=["Documents"])


# ─────────────────────────────────────────────────────────
# HELPER: Convert MongoDB doc to response format
# ─────────────────────────────────────────────────────────

def format_document_response(doc: dict) -> dict:
    """Convert a MongoDB document dict to a clean response dict."""
    return {
        "id": str(doc["_id"]),
        "title": doc.get("title", ""),
        "filename": doc.get("filename", ""),
        "file_type": doc.get("file_type", ""),
        "file_size": doc.get("file_size", 0),
        "file_size_readable": format_file_size(doc.get("file_size", 0)),
        "word_count": doc.get("word_count", 0),
        "course": doc.get("course"),
        "academic_year": doc.get("academic_year"),
        "status": doc.get("status", "pending"),
        "submitted_at": doc.get("submitted_at"),
        "processed_at": doc.get("processed_at"),
        "has_result": doc.get("has_result", False)
    }


# ─────────────────────────────────────────────────────────
# ROUTE 1: Upload Document
# POST /api/documents/upload
# ─────────────────────────────────────────────────────────

@router.post(
    "/upload",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED
)
async def upload_document(
    file: UploadFile = File(..., description="PDF, DOCX, or TXT file"),
    title: str = Form(..., min_length=3, max_length=200),
    course: Optional[str] = Form(None),
    academic_year: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload a document for plagiarism detection.
    
    - Validates file type and size
    - Extracts text from PDF/DOCX/TXT
    - Preprocesses the text
    - Generates document fingerprint
    - Uploads file to Cloudinary
    - Saves everything to MongoDB
    """
    
    # ── 1. VALIDATE FILE TYPE ──────────────────────────────
    original_filename = file.filename or "unknown"
    file_extension = original_filename.rsplit(".", 1)[-1].lower()
    
    if file_extension not in settings.ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '.{file_extension}' is not allowed. "
                   f"Accepted types: {', '.join(settings.ALLOWED_FILE_TYPES)}"
        )
    
    # ── 2. READ FILE BYTES ─────────────────────────────────
    file_bytes = await file.read()
    file_size = len(file_bytes)
    
    # ── 3. VALIDATE FILE SIZE ──────────────────────────────
    max_size_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if file_size > max_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum allowed size is "
                   f"{settings.MAX_FILE_SIZE_MB}MB. "
                   f"Your file is {format_file_size(file_size)}."
        )
    
    # ── 4. CHECK FILE IS NOT EMPTY ─────────────────────────
    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )
    
    # ── 5. EXTRACT TEXT FROM DOCUMENT ─────────────────────
    try:
        extraction_result = extract_text(file_bytes, file_extension)
        raw_text = extraction_result["text"]
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not extract text: {str(e)}"
        )
    
    # ── 6. VALIDATE EXTRACTED TEXT ─────────────────────────
    if not raw_text or len(raw_text.strip()) < 50:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Document appears to be empty or contains too little text. "
                   "Please upload a document with meaningful content."
        )
    
    # ── 7. PREPROCESS THE TEXT ─────────────────────────────
    processed = process_document(raw_text)
    word_count = processed["stats"]["word_count"]
    
    # ── 8. GENERATE FINGERPRINT ────────────────────────────
    fingerprint = generate_fingerprint(processed["detection_text"])
    
    # ── 9. UPLOAD FILE TO CLOUDINARY ──────────────────────
    user_id = str(current_user["_id"])
    
    try:
        upload_result = upload_file_to_cloudinary(
            file_bytes=file_bytes,
            filename=original_filename,
            user_id=user_id
        )
        file_url = upload_result["url"]
        cloudinary_public_id = upload_result["public_id"]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"File storage service unavailable: {str(e)}"
        )
    
    # ── 10. SAVE TO MONGODB ────────────────────────────────
    documents_collection = get_documents_collection()
    now = datetime.now(timezone.utc)
    
    document_record = {
        "user_id": ObjectId(user_id),
        "title": title.strip(),
        "filename": original_filename,
        "file_url": file_url,
        "cloudinary_public_id": cloudinary_public_id,
        "file_type": file_extension,
        "file_size": file_size,
        "word_count": word_count,
        "sentence_count": processed["stats"]["sentence_count"],
        "char_count": processed["stats"]["char_count"],
        "course": course.strip() if course else None,
        "academic_year": academic_year.strip() if academic_year else None,
        "description": description.strip() if description else None,
        "extracted_text": raw_text,
        "clean_text": processed["clean_text"],
        "detection_text": processed["detection_text"],
        "sentences": processed["sentences"],
        "fingerprint": fingerprint,
        "status": "pending",
        "has_result": False,
        "submitted_at": now,
        "processed_at": None
    }
    
    insert_result = documents_collection.insert_one(document_record)
    document_id = str(insert_result.inserted_id)
    
    # ── 11. CREATE NOTIFICATION ────────────────────────────
    notifications_collection = get_notifications_collection()
    notifications_collection.insert_one({
        "user_id": ObjectId(user_id),
        "title": "Document Uploaded Successfully",
        "message": f"Your document '{title}' has been uploaded and is ready for analysis.",
        "type": "info",
        "is_read": False,
        "related_doc_id": insert_result.inserted_id,
        "created_at": now
    })
    
    # ── 12. RETURN RESPONSE ────────────────────────────────
    return DocumentUploadResponse(
        success=True,
        message="Document uploaded and processed successfully. Ready for plagiarism detection.",
        document_id=document_id,
        title=title,
        filename=original_filename,
        word_count=word_count,
        file_size_readable=format_file_size(file_size),
        status="pending",
        submitted_at=now
    )


# ─────────────────────────────────────────────────────────
# ROUTE 2: Get All User Documents
# GET /api/documents/
# ─────────────────────────────────────────────────────────

@router.get("/", response_model=DocumentListResponse)
async def get_user_documents(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=50, description="Items per page"),
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all documents uploaded by the current user.
    Supports pagination and status filtering.
    """
    documents_collection = get_documents_collection()
    user_id = current_user["_id"]
    
    # Build query filter
    query = {"user_id": ObjectId(str(user_id))}
    if status_filter and status_filter in ["pending", "processing", "completed", "failed"]:
        query["status"] = status_filter
    
    # Count total documents
    total = documents_collection.count_documents(query)
    
    # Calculate pagination
    skip = (page - 1) * per_page
    total_pages = math.ceil(total / per_page) if total > 0 else 1
    
    # Fetch documents (newest first, exclude large text fields)
    cursor = documents_collection.find(
        query,
        {
            "extracted_text": 0,    # Exclude (too large)
            "clean_text": 0,        # Exclude (too large)
            "detection_text": 0,    # Exclude (too large)
            "sentences": 0,         # Exclude (too large)
            "fingerprint": 0        # Exclude (too large)
        }
    ).sort("submitted_at", -1).skip(skip).limit(per_page)
    
    documents = [format_document_response(doc) for doc in cursor]
    
    return DocumentListResponse(
        success=True,
        documents=[DocumentResponse(**doc) for doc in documents],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages
    )


# ─────────────────────────────────────────────────────────
# ROUTE 3: Get Single Document Detail
# GET /api/documents/{document_id}
# ─────────────────────────────────────────────────────────

@router.get("/{document_id}", response_model=DocumentDetailResponse)
async def get_document(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get detailed information about a specific document.
    Users can only access their own documents.
    """
    documents_collection = get_documents_collection()
    
    # Validate the document_id format
    try:
        doc_object_id = ObjectId(document_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid document ID format."
        )
    
    # Find document
    document = documents_collection.find_one({"_id": doc_object_id})
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found."
        )
    
    # Security check: ensure document belongs to current user
    # (Admins and lecturers can bypass this check)
    user_role = current_user.get("role", "student")
    if user_role == "student":
        if str(document["user_id"]) != str(current_user["_id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to view this document."
            )
    
    # Get text preview (first 500 characters)
    raw_text = document.get("extracted_text", "")
    text_preview = raw_text[:500] + "..." if len(raw_text) > 500 else raw_text
    
    return DocumentDetailResponse(
        id=str(document["_id"]),
        title=document.get("title", ""),
        filename=document.get("filename", ""),
        file_url=document.get("file_url", ""),
        file_type=document.get("file_type", ""),
        file_size=document.get("file_size", 0),
        file_size_readable=format_file_size(document.get("file_size", 0)),
        word_count=document.get("word_count", 0),
        course=document.get("course"),
        academic_year=document.get("academic_year"),
        description=document.get("description"),
        status=document.get("status", "pending"),
        text_preview=text_preview,
        submitted_at=document.get("submitted_at"),
        processed_at=document.get("processed_at"),
        has_result=document.get("has_result", False)
    )


# ─────────────────────────────────────────────────────────
# ROUTE 4: Delete Document
# DELETE /api/documents/{document_id}
# ─────────────────────────────────────────────────────────

@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a document and its associated file from storage.
    Only the document owner (or admin) can delete.
    """
    documents_collection = get_documents_collection()
    
    # Validate ID format
    try:
        doc_object_id = ObjectId(document_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid document ID format."
        )
    
    # Find the document
    document = documents_collection.find_one({"_id": doc_object_id})
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found."
        )
    
    # Security check
    user_role = current_user.get("role", "student")
    if user_role == "student":
        if str(document["user_id"]) != str(current_user["_id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to delete this document."
            )
    
    # Check if document is currently being processed
    if document.get("status") == "processing":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete document while it is being processed. Please wait."
        )
    
    # Delete from Cloudinary
    cloudinary_id = document.get("cloudinary_public_id")
    if cloudinary_id:
        delete_file_from_cloudinary(cloudinary_id)
    
    # Delete from MongoDB
    documents_collection.delete_one({"_id": doc_object_id})
    
    return {
        "success": True,
        "message": f"Document '{document.get('title', 'Unknown')}' deleted successfully."
    }


# ─────────────────────────────────────────────────────────
# ROUTE 5: Get Extracted Text
# GET /api/documents/{document_id}/text
# ─────────────────────────────────────────────────────────

@router.get("/{document_id}/text")
async def get_document_text(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get the full extracted text of a document.
    Useful for display in the results view.
    """
    documents_collection = get_documents_collection()
    
    try:
        doc_object_id = ObjectId(document_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid document ID format."
        )
    
    document = documents_collection.find_one(
        {"_id": doc_object_id},
        {"extracted_text": 1, "clean_text": 1, "user_id": 1, "title": 1}
    )
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found."
        )
    
    # Security check
    user_role = current_user.get("role", "student")
    if user_role == "student":
        if str(document["user_id"]) != str(current_user["_id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied."
            )
    
    return {
        "success": True,
        "document_id": document_id,
        "title": document.get("title", ""),
        "extracted_text": document.get("extracted_text", ""),
        "clean_text": document.get("clean_text", "")
    }