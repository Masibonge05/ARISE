"""
Huawei IAM (Identity and Access Management)
============================================
Centralized token management for all Huawei Cloud API calls.

Provides:
- get_token()         — cached IAM token (refreshes automatically)
- sign_request()      — AK/SK HMAC-SHA256 request signing for OBS
- is_configured()     — checks if real credentials are present
- get_project_token() — scoped project token for specific services

All other Huawei service modules should import get_token() from here.

Docs: https://support.huaweicloud.com/api-iam/iam_30_0001.html
"""
import hmac
import hashlib
import base64
import logging
from datetime import datetime, timedelta
from typing import Optional
import httpx

from backend.config.settings import settings

logger = logging.getLogger("arise.huawei.iam")

# ─── Token Cache ──────────────────────────────────────────────────────────────
_cache: dict = {"token": None, "expires_at": None}

IAM_BASE = f"https://iam.{settings.HUAWEI_REGION}.myhuaweicloud.com"


def is_configured() -> bool:
    """Returns True if real Huawei AK/SK credentials are set."""
    return (
        bool(settings.HUAWEI_ACCESS_KEY) and
        settings.HUAWEI_ACCESS_KEY not in ("placeholder", "") and
        bool(settings.HUAWEI_SECRET_KEY) and
        settings.HUAWEI_SECRET_KEY not in ("placeholder", "")
    )


async def get_token() -> str:
    """
    Returns a valid IAM token, refreshing if expired.
    Tokens last 24h — we refresh 5 minutes early.
    Returns empty string in dev mode (no credentials).
    """
    if not is_configured():
        return ""

    now = datetime.utcnow()
    if _cache["token"] and _cache["expires_at"] and now < _cache["expires_at"]:
        return _cache["token"]

    token = await _fetch_token()
    if token:
        _cache["token"] = token
        _cache["expires_at"] = now + timedelta(hours=23, minutes=55)
        logger.info("Huawei IAM token refreshed successfully")
    return token or ""


async def _fetch_token() -> Optional[str]:
    """Fetches a fresh token from Huawei IAM using AK/SK."""
    url = f"{IAM_BASE}/v3/auth/tokens"
    payload = {
        "auth": {
            "identity": {
                "methods": ["hw_ak_sk"],
                "hw_ak_sk": {
                    "access": {"key": settings.HUAWEI_ACCESS_KEY},
                    "secret": {"key": settings.HUAWEI_SECRET_KEY},
                }
            },
            "scope": {"project": {"name": settings.HUAWEI_REGION}}
        }
    }
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.post(url, json=payload)
        if r.status_code == 201:
            return r.headers.get("X-Subject-Token")
        logger.error(f"IAM token fetch failed: {r.status_code} — {r.text[:200]}")
        return None
    except Exception as e:
        logger.error(f"IAM token exception: {e}")
        return None


def sign_request(method: str, url: str, body: str = "", content_type: str = "application/json") -> dict:
    """
    Generates HMAC-SHA256 signed headers for OBS and services
    that require AK/SK signing rather than token auth.
    Returns headers dict to merge into request.
    """
    if not is_configured():
        return {}

    from urllib.parse import urlparse
    parsed = urlparse(url)
    host = parsed.netloc
    path = parsed.path or "/"
    query = parsed.query or ""
    timestamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")

    body_hash = hashlib.sha256(body.encode()).hexdigest()
    canonical_headers = f"content-type:{content_type}\nhost:{host}\nx-sdk-date:{timestamp}\n"
    signed_headers = "content-type;host;x-sdk-date"
    canonical_request = f"{method}\n{path}\n{query}\n{canonical_headers}\n{signed_headers}\n{body_hash}"

    cr_hash = hashlib.sha256(canonical_request.encode()).hexdigest()
    string_to_sign = f"SDK-HMAC-SHA256\n{timestamp}\n{cr_hash}"
    signature = hmac.new(
        settings.HUAWEI_SECRET_KEY.encode(),
        string_to_sign.encode(),
        hashlib.sha256
    ).hexdigest()

    return {
        "Authorization": f"SDK-HMAC-SHA256 Access={settings.HUAWEI_ACCESS_KEY}, SignedHeaders={signed_headers}, Signature={signature}",
        "X-Sdk-Date": timestamp,
        "Content-Type": content_type,
        "Host": host,
    }


async def get_project_token(service_name: str) -> str:
    """
    Returns a project-scoped token for a specific Huawei service.
    Used for services that require project-level auth.
    """
    # For most services the standard IAM token works
    # This function exists for future agency token support
    return await get_token()


def invalidate_token():
    """Forces token refresh on next call. Call after credential rotation."""
    _cache["token"] = None
    _cache["expires_at"] = None
    logger.info("IAM token cache invalidated")