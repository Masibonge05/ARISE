"""
backend/config/huawei.py
========================
Centralised Huawei Cloud configuration and authenticated HTTP client factory.
All Huawei service modules import from here to get pre-configured base URLs,
signed request headers (AK/SK auth), shared async HTTP client, and token cache.
"""
import httpx, hmac, hashlib, logging
from datetime import datetime, timedelta
from typing import Optional
from backend.config.settings import settings

logger = logging.getLogger("arise.huawei.config")

REGION = settings.HUAWEI_REGION

ENDPOINTS = {
    "iam":          f"https://iam.{REGION}.myhuaweicloud.com",
    "ocr":          f"https://ocr.{REGION}.myhuaweicloud.com",
    "nlp":          f"https://nlp.{REGION}.myhuaweicloud.com",
    "modelarts":    f"https://modelarts.{REGION}.myhuaweicloud.com",
    "obs":          f"https://obs.{REGION}.myhuaweicloud.com",
    "ges":          f"https://ges.{REGION}.myhuaweicloud.com",
    "sis":          f"https://sis.{REGION}.myhuaweicloud.com",
    "kms":          f"https://kms.{REGION}.myhuaweicloud.com",
    "apm":          f"https://apm2.{REGION}.myhuaweicloud.com",
    "smn":          f"https://smn.{REGION}.myhuaweicloud.com",
    "lts":          f"https://lts.{REGION}.myhuaweicloud.com",
    "functiongraph":f"https://functiongraph.{REGION}.myhuaweicloud.com",
    "css":          f"https://css.{REGION}.myhuaweicloud.com",
    "dcs":          f"https://dcs.{REGION}.myhuaweicloud.com",
}

def is_huawei_configured() -> bool:
    """True only if real AK/SK credentials are present (not placeholder)."""
    return (
        bool(settings.HUAWEI_ACCESS_KEY) and
        settings.HUAWEI_ACCESS_KEY not in ("placeholder", "") and
        bool(settings.HUAWEI_SECRET_KEY) and
        settings.HUAWEI_SECRET_KEY not in ("placeholder", "")
    )

# ─── IAM Token Cache ──────────────────────────────────────────────────────────
_token_cache: dict = {"token": None, "expires_at": None}

async def get_token() -> str:
    """Returns valid IAM token, refreshing before expiry. Empty string in dev mode."""
    if not is_huawei_configured():
        return ""
    now = datetime.utcnow()
    if _token_cache["token"] and _token_cache["expires_at"] and now < _token_cache["expires_at"]:
        return _token_cache["token"]
    token = await _fetch_iam_token()
    if token:
        _token_cache["token"] = token
        _token_cache["expires_at"] = now + timedelta(hours=23, minutes=55)
        logger.info("Huawei IAM token refreshed")
    return token or ""

async def _fetch_iam_token() -> Optional[str]:
    url = f"{ENDPOINTS['iam']}/v3/auth/tokens"
    payload = {"auth": {"identity": {"methods": ["hw_ak_sk"], "hw_ak_sk": {
        "access": {"key": settings.HUAWEI_ACCESS_KEY},
        "secret": {"key": settings.HUAWEI_SECRET_KEY},
    }}, "scope": {"project": {"name": REGION}}}}
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.post(url, json=payload)
        if r.status_code == 201:
            return r.headers.get("X-Subject-Token")
        logger.error(f"IAM token failed: {r.status_code}")
        return None
    except Exception as e:
        logger.error(f"IAM token exception: {e}")
        return None

# ─── Convenience HTTP Wrappers ────────────────────────────────────────────────
async def hw_post(url: str, payload: dict, timeout: int = 20) -> Optional[dict]:
    """POST to any Huawei API with token auth. Returns JSON or None."""
    token = await get_token()
    headers = {"Content-Type": "application/json", "X-Auth-Token": token,
               "X-Project-Id": settings.HUAWEI_PROJECT_ID}
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            r = await client.post(url, json=payload, headers=headers)
        if r.status_code in (200, 201):
            return r.json()
        logger.warning(f"hw_post {url} → {r.status_code}: {r.text[:200]}")
        return None
    except Exception as e:
        logger.error(f"hw_post exception {url}: {e}")
        return None

async def hw_get(url: str, timeout: int = 10) -> Optional[dict]:
    """GET any Huawei API with token auth. Returns JSON or None."""
    token = await get_token()
    headers = {"Content-Type": "application/json", "X-Auth-Token": token,
               "X-Project-Id": settings.HUAWEI_PROJECT_ID}
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            r = await client.get(url, headers=headers)
        if r.status_code == 200:
            return r.json()
        logger.warning(f"hw_get {url} → {r.status_code}")
        return None
    except Exception as e:
        logger.error(f"hw_get exception {url}: {e}")
        return None

if not is_huawei_configured():
    logger.info("Huawei Cloud: DEV MODE — all API calls return mock data. Set real AK/SK in .env.")