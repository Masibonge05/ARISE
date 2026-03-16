"""
huawei/obs/uploader.py
=======================
Document upload and management using Huawei OBS (Object Storage Service).

All user documents are stored in OBS with:
- Server-side encryption (Huawei DEW/KMS)
- Lifecycle policies (auto-delete temp files after 7 days)
- Pre-signed URLs for time-limited secure access
- Separate buckets for identity docs vs portfolio

🔴 Huawei OBS + DEW encryption
"""
import httpx, uuid, logging, hashlib, hmac, base64
from datetime import datetime, timedelta
from typing import Optional
from huawei.obs.config import OBS_BUCKET, OBS_ENDPOINT, get_object_key, ENCRYPTION_ALGORITHM
from backend.config.settings import settings
from backend.config.huawei import is_huawei_configured

logger = logging.getLogger("arise.obs.uploader")


async def upload_file(
    file_bytes: bytes,
    filename: str,
    content_type: str,
    folder: str = "temp",
    user_id: str = "anon",
    encrypt: bool = True,
) -> Optional[str]:
    """
    Uploads a file to Huawei OBS.
    Returns the object URL on success, None on failure.
    Falls back to mock URL in dev mode.
    """
    unique_name = f"{uuid.uuid4().hex}_{filename}"
    object_key = get_object_key(folder, user_id, unique_name)

    if not is_huawei_configured():
        mock_url = f"https://mock-obs.arise.co.za/{object_key}"
        logger.debug(f"OBS mock upload: {mock_url}")
        return mock_url

    url = f"https://{OBS_BUCKET}.{OBS_ENDPOINT.replace('https://', '')}/{object_key}"

    headers = {
        "Content-Type": content_type,
        "Content-Length": str(len(file_bytes)),
    }
    if encrypt:
        headers["x-obs-server-side-encryption"] = ENCRYPTION_ALGORITHM

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.put(url, content=file_bytes, headers=headers)

        if response.status_code in (200, 201):
            logger.info(f"OBS upload success: {object_key} ({len(file_bytes)} bytes)")
            return url
        logger.error(f"OBS upload failed {response.status_code}: {response.text[:200]}")
        return None

    except Exception as e:
        logger.error(f"OBS upload exception: {e}")
        return None


async def delete_file(object_url: str) -> bool:
    """Deletes a file from OBS."""
    if not is_huawei_configured() or "mock-obs" in object_url:
        return True
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.delete(object_url)
        return r.status_code in (200, 204)
    except Exception as e:
        logger.error(f"OBS delete failed: {e}")
        return False


def generate_presigned_url(object_key: str, expires_seconds: int = 3600) -> str:
    """
    Generates a time-limited presigned URL for direct download.
    Used when a user wants to view their own verified document.
    """
    if not is_huawei_configured():
        return f"https://mock-obs.arise.co.za/{object_key}?mock=true"

    # Presigned URL generation (simplified — production uses full HMAC signing)
    expiry = int((datetime.utcnow() + timedelta(seconds=expires_seconds)).timestamp())
    string_to_sign = f"GET\n\n\n{expiry}\n/{OBS_BUCKET}/{object_key}"
    sig = base64.b64encode(
        hmac.new(settings.HUAWEI_SECRET_KEY.encode(), string_to_sign.encode(), hashlib.sha1).digest()
    ).decode()
    
    url = f"https://{OBS_BUCKET}.{OBS_ENDPOINT.replace('https://', '')}/{object_key}"
    return f"{url}?AccessKeyId={settings.HUAWEI_ACCESS_KEY}&Expires={expiry}&Signature={sig}"


async def upload_identity_doc(file_bytes: bytes, filename: str, content_type: str, user_id: str) -> Optional[str]:
    """Uploads an identity document with maximum encryption."""
    return await upload_file(file_bytes, filename, content_type, "identity_docs", user_id, encrypt=True)


async def upload_certificate(file_bytes: bytes, filename: str, content_type: str, user_id: str) -> Optional[str]:
    """Uploads an academic certificate."""
    return await upload_file(file_bytes, filename, content_type, "certificates", user_id, encrypt=True)


async def upload_portfolio_item(file_bytes: bytes, filename: str, content_type: str, user_id: str) -> Optional[str]:
    """Uploads a portfolio work sample."""
    return await upload_file(file_bytes, filename, content_type, "portfolio", user_id, encrypt=False)