from supabase import create_client, Client
from app.core.config import settings

_client: Client = None


def get_supabase() -> Client:
    global _client
    if _client is None:
        _client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return _client


def get_signed_upload_url(bucket: str, path: str, expires_in: int = 3600) -> str:
    sb = get_supabase()
    res = sb.storage.from_(bucket).create_signed_upload_url(path)
    return res["signedURL"]


def get_signed_download_url(bucket: str, path: str, expires_in: int = 3600) -> str:
    sb = get_supabase()
    res = sb.storage.from_(bucket).create_signed_url(path, expires_in)
    return res["signedURL"]
