"""huawei/obs/config.py — Object Storage Service configuration."""
from backend.config.settings import settings
from backend.config.huawei import ENDPOINTS

OBS_ENDPOINT = settings.HUAWEI_OBS_ENDPOINT or f"https://obs.{settings.HUAWEI_REGION}.myhuaweicloud.com"
OBS_BUCKET = settings.HUAWEI_OBS_BUCKET or "arise-documents"

FOLDER_STRUCTURE = {
    "identity_docs":     "users/{user_id}/identity/",
    "certificates":      "users/{user_id}/certificates/",
    "portfolio":         "users/{user_id}/portfolio/",
    "business_docs":     "businesses/{business_id}/docs/",
    "cipc_certificates": "businesses/{business_id}/cipc/",
    "grant_docs":        "grants/{application_id}/",
    "temp":              "temp/",
}

ALLOWED_CONTENT_TYPES = {
    "image/jpeg", "image/png", "image/webp",
    "application/pdf", "image/bmp",
}
MAX_FILE_SIZE_MB = 10
ENCRYPTION_ALGORITHM = "aws:kms"   # Huawei OBS server-side encryption

def get_object_key(folder: str, user_id: str, filename: str, **kwargs) -> str:
    template = FOLDER_STRUCTURE.get(folder, "misc/")
    path = template.format(user_id=user_id, **kwargs)
    return f"{path}{filename}"

def get_object_url(object_key: str) -> str:
    return f"https://{OBS_BUCKET}.{OBS_ENDPOINT.replace('https://', '')}/{object_key}"