# backend/app/models/document.py

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ─────────────────────────────────────────
# ENUMS
# ─────────────────────────────────────────

class FileType(str, Enum):
    PDF = "pdf"
    DOCX = "docx"
    TXT = "txt"


class DocumentStatus(str, Enum):
    PENDING = "pending"        # Just uploaded, not processed
    PROCESSING = "processing"  # Detection running
    COMPLETED = "completed"    # Detection done
    FAILED = "failed"          # Something went wrong


# ─────────────────────────────────────────
# REQUEST MODELS (what frontend sends)
# ─────────────────────────────────────────

class DocumentUploadMeta(BaseModel):
    """Metadata sent alongside the file upload"""
    title: str = Field(..., min_length=3, max_length=200)
    course: Optional[str] = Field(None, max_length=100)
    academic_year: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = Field(None, max_length=500)


# ─────────────────────────────────────────
# RESPONSE MODELS (what backend returns)
# ─────────────────────────────────────────

class DocumentResponse(BaseModel):
    """Returned when listing or fetching documents"""
    id: str
    title: str
    filename: str
    file_type: str
    file_size: int
    file_size_readable: str
    word_count: int
    course: Optional[str]
    academic_year: Optional[str]
    status: str
    submitted_at: datetime
    processed_at: Optional[datetime]
    has_result: bool


class DocumentUploadResponse(BaseModel):
    """Returned immediately after successful upload"""
    success: bool
    message: str
    document_id: str
    title: str
    filename: str
    word_count: int
    file_size_readable: str
    status: str
    submitted_at: datetime


class DocumentDetailResponse(BaseModel):
    """Full document details including extracted text preview"""
    id: str
    title: str
    filename: str
    file_url: str
    file_type: str
    file_size: int
    file_size_readable: str
    word_count: int
    course: Optional[str]
    academic_year: Optional[str]
    description: Optional[str]
    status: str
    text_preview: str          # First 500 chars of extracted text
    submitted_at: datetime
    processed_at: Optional[datetime]
    has_result: bool


class DocumentListResponse(BaseModel):
    """Paginated list of user documents"""
    success: bool
    documents: List[DocumentResponse]
    total: int
    page: int
    per_page: int
    total_pages: int