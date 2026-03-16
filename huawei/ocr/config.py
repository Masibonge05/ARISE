"""huawei/ocr/config.py — OCR service configuration."""
from backend.config.settings import settings
from backend.config.huawei import ENDPOINTS, is_huawei_configured

OCR_BASE = ENDPOINTS["ocr"]
PROJECT_ID = settings.HUAWEI_PROJECT_ID

ENDPOINTS_OCR = {
    "id_card":       f"{OCR_BASE}/v2/{PROJECT_ID}/ocr/id-card",
    "passport":      f"{OCR_BASE}/v2/{PROJECT_ID}/ocr/passport",
    "general_text":  f"{OCR_BASE}/v2/{PROJECT_ID}/ocr/general-text",
    "table":         f"{OCR_BASE}/v2/{PROJECT_ID}/ocr/table",
    "invoice":       f"{OCR_BASE}/v2/{PROJECT_ID}/ocr/vat-invoice",
}

SUPPORTED_FORMATS = ["image/jpeg", "image/png", "image/bmp", "application/pdf"]
MAX_IMAGE_SIZE_MB = 10
MIN_CONFIDENCE_THRESHOLD = 0.7