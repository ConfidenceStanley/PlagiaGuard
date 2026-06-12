# backend/app/services/text_extractor.py

import fitz        # PyMuPDF  → handles PDF files
import docx        # python-docx → handles DOCX files
import io
from typing import Tuple


def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, int]:
    """
    Extract all text from a PDF file.

    Args:
        file_bytes: Raw PDF file content as bytes

    Returns:
        Tuple of (full_text, page_count)

    Raises:
        ValueError: If PDF cannot be read
    """
    try:
        # Open PDF directly from bytes (no temp file needed)
        pdf_document = fitz.open(stream=file_bytes, filetype="pdf")

        text_parts = []
        page_count = len(pdf_document)

        for page_num in range(page_count):
            page = pdf_document[page_num]
            page_text = page.get_text("text")

            if page_text.strip():
                text_parts.append(page_text)

        pdf_document.close()

        # Join all pages with spacing
        full_text = "\n\n".join(text_parts)
        return full_text, page_count

    except Exception as e:
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")


def extract_text_from_docx(file_bytes: bytes) -> Tuple[str, int]:
    """
    Extract all text from a DOCX file.

    Args:
        file_bytes: Raw DOCX file content as bytes

    Returns:
        Tuple of (full_text, paragraph_count)

    Raises:
        ValueError: If DOCX cannot be read
    """
    try:
        file_stream = io.BytesIO(file_bytes)
        doc = docx.Document(file_stream)

        text_parts = []

        # Extract from paragraphs
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text_parts.append(paragraph.text)

        # Extract from tables (content sometimes lives here)
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    if cell.text.strip():
                        text_parts.append(cell.text)

        paragraph_count = len(text_parts)
        full_text = "\n\n".join(text_parts)

        return full_text, paragraph_count

    except Exception as e:
        raise ValueError(f"Failed to extract text from DOCX: {str(e)}")


def extract_text_from_txt(file_bytes: bytes) -> Tuple[str, int]:
    """
    Extract all text from a plain TXT file.

    Args:
        file_bytes: Raw TXT file content as bytes

    Returns:
        Tuple of (full_text, line_count)

    Raises:
        ValueError: If file cannot be decoded
    """
    try:
        # Try UTF-8 first (most common)
        try:
            text = file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            # Fall back to latin-1 (handles most other encodings)
            text = file_bytes.decode("latin-1")

        lines = [line for line in text.splitlines() if line.strip()]
        line_count = len(lines)

        return text, line_count

    except Exception as e:
        raise ValueError(f"Failed to extract text from TXT: {str(e)}")


def extract_text(file_bytes: bytes, file_type: str) -> dict:
    """
    Main entry point for text extraction.
    Automatically routes to correct extractor based on file type.

    Args:
        file_bytes: Raw file content as bytes
        file_type:  File extension string → "pdf", "docx", or "txt"

    Returns:
        Dictionary containing:
        {
            "text":           "full extracted text...",
            "char_count":     12450,
            "page_count":     5,      ← PDF only
            "paragraph_count": 42,    ← DOCX only
            "line_count":     200,    ← TXT only
        }

    Raises:
        ValueError: If file type unsupported or extraction fails
    """
    file_type = file_type.lower().strip().lstrip(".")

    if file_type == "pdf":
        text, page_count = extract_text_from_pdf(file_bytes)
        return {
            "text": text,
            "char_count": len(text),
            "page_count": page_count,
        }

    elif file_type == "docx":
        text, paragraph_count = extract_text_from_docx(file_bytes)
        return {
            "text": text,
            "char_count": len(text),
            "paragraph_count": paragraph_count,
        }

    elif file_type == "txt":
        text, line_count = extract_text_from_txt(file_bytes)
        return {
            "text": text,
            "char_count": len(text),
            "line_count": line_count,
        }

    else:
        raise ValueError(
            f"Unsupported file type: '{file_type}'. "
            f"Accepted types: pdf, docx, txt"
        )