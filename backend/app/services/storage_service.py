import os
import uuid
import httpx
from app.core.config import settings

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_signed_upload_url(bucket: str, path: str, expires_in: int = 3600) -> str:
    # Returns a local upload endpoint URL instead of Supabase signed URL
    token = str(uuid.uuid4())
    return f"http://localhost:8000/api/storage/upload/{token}?path={path}"


def get_signed_download_url(bucket: str, path: str, expires_in: int = 3600) -> str:
    return f"http://localhost:8000/api/storage/download?path={path}"


def save_file_locally(path: str, content: bytes) -> str:
    full_path = os.path.join(UPLOAD_DIR, path.replace("/", os.sep))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "wb") as f:
        f.write(content)
    return full_path


def get_local_path(storage_path: str) -> str:
    return os.path.join(UPLOAD_DIR, storage_path.replace("/", os.sep))


def store_file(path: str, content: bytes, content_type: str = "application/octet-stream") -> str:
    """Store through the backend; use Supabase Storage when configured, local disk otherwise."""
    if settings.supabase_url and settings.supabase_service_key:
        url = f"{settings.supabase_url.rstrip('/')}/storage/v1/object/{settings.supabase_storage_bucket}/{path}"
        response = httpx.put(
            url,
            content=content,
            headers={
                "Authorization": f"Bearer {settings.supabase_service_key}",
                "apikey": settings.supabase_service_key,
                "Content-Type": content_type,
                "x-upsert": "false",
            },
            timeout=60,
        )
        response.raise_for_status()
        return path
    save_file_locally(path, content)
    return path


def download_file(path: str) -> bytes:
    if settings.supabase_url and settings.supabase_service_key:
        url = f"{settings.supabase_url.rstrip('/')}/storage/v1/object/{settings.supabase_storage_bucket}/{path}"
        response = httpx.get(url, headers={
            "Authorization": f"Bearer {settings.supabase_service_key}",
            "apikey": settings.supabase_service_key,
        }, timeout=60)
        response.raise_for_status()
        return response.content
    with open(get_local_path(path), "rb") as file:
        return file.read()


def delete_file(path: str) -> None:
    if settings.supabase_url and settings.supabase_service_key:
        url = f"{settings.supabase_url.rstrip('/')}/storage/v1/object/{settings.supabase_storage_bucket}"
        response = httpx.delete(url, json={"prefixes": [path]}, headers={
            "Authorization": f"Bearer {settings.supabase_service_key}",
            "apikey": settings.supabase_service_key,
        }, timeout=60)
        response.raise_for_status()
        return
    local_path = get_local_path(path)
    if os.path.exists(local_path):
        os.remove(local_path)
