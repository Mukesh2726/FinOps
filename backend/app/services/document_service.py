import io
import pdfplumber
import pikepdf
from typing import List, Dict, Optional
from app.core.logging import get_logger

logger = get_logger(__name__)


def extract_text_from_pdf(file_bytes: bytes, password: Optional[str] = None) -> str:
    """Extract text from PDF, decrypting if password provided."""
    try:
        if password:
            with pikepdf.open(io.BytesIO(file_bytes), password=password) as pdf:
                out = io.BytesIO()
                pdf.save(out)
                file_bytes = out.getvalue()

        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            pages = [page.extract_text() or "" for page in pdf.pages]
            return "\n".join(pages)
    except pikepdf.PasswordError:
        raise ValueError("incorrect_password")
    except Exception as e:
        logger.error("pdf_extraction_failed", error=str(e))
        raise


def is_pdf_encrypted(file_bytes: bytes) -> bool:
    try:
        with pikepdf.open(io.BytesIO(file_bytes)) as _:
            return False
    except pikepdf.PasswordError:
        return True
    except Exception:
        return False


def extract_text_from_image(file_bytes: bytes) -> str:
    """Basic placeholder — extend with pytesseract if needed."""
    return ""
