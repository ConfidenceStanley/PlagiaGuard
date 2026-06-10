# backend/app/utils/file_handler.py

import cloudinary
import cloudinary.uploader
import os
from app.core.config import settings


def configure_cloudinary():
    """Configure Cloudinary with credentials from settings"""
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )


def upload_file_to_cloudinary(
    file_bytes: bytes,
    filename: str,
    user_id: str
) -> dict:
    """
    Upload a file to Cloudinary and return URL info.
    
    Returns:
        {
            "url": "https://res.cloudinary.com/...",
            "public_id": "plagiarguard/user_id/filename",
            "bytes": 12345
        }
    """
    configure_cloudinary()
    
    # Create a clean folder path per user
    folder = f"plagiarguard/documents/{user_id}"
    
    # Remove extension for public_id
    name_without_ext = os.path.splitext(filename)[0]
    # Clean the name (remove spaces, special chars)
    clean_name = "".join(
        c if c.isalnum() or c in "-_" else "_" 
        for c in name_without_ext
    )
    
    # Upload to Cloudinary as raw file (not image)
    result = cloudinary.uploader.upload(
        file_bytes,
        folder=folder,
        public_id=clean_name,
        resource_type="raw",    # Important: treats as file, not image
        overwrite=False,
        unique_filename=True
    )
    
    return {
        "url": result["secure_url"],
        "public_id": result["public_id"],
        "bytes": result["bytes"]
    }


def delete_file_from_cloudinary(public_id: str) -> bool:
    """
    Delete a file from Cloudinary.
    
    Returns:
        True if deleted successfully, False otherwise
    """
    configure_cloudinary()
    
    try:
        result = cloudinary.uploader.destroy(
            public_id,
            resource_type="raw"
        )
        return result.get("result") == "ok"
    except Exception:
        return False


def format_file_size(size_bytes: int) -> str:
    """
    Convert bytes to human-readable size.
    
    Examples:
        1024 → "1.0 KB"
        1048576 → "1.0 MB"
    """
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"