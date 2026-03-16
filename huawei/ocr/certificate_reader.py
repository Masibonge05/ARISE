"""
huawei/ocr/certificate_reader.py
==================================
Academic certificate and CIPC registration reader using Huawei OCR.
"""
import base64, logging, re
from typing import Optional
from huawei.ocr.config import ENDPOINTS_OCR
from backend.config.huawei import hw_post, is_huawei_configured

logger = logging.getLogger("arise.ocr.certificate_reader")

SA_INSTITUTIONS = [
    "university of johannesburg", "university of the witwatersrand",
    "university of cape town", "university of pretoria",
    "stellenbosch university", "university of kwazulu-natal",
    "nelson mandela university", "university of the free state",
    "north-west university", "unisa", "durban university of technology",
    "cape peninsula university", "tshwane university",
    "walter sisulu university", "central university of technology",
]

QUALIFICATION_KEYWORDS = ["bachelor", "baccalaureus", "diploma", "certificate",
                           "honours", "hons", "master", "doctor", "phd", "degree"]


async def read_academic_certificate(image_bytes: bytes) -> dict:
    """Extracts qualification details from an academic certificate image."""
    if not is_huawei_configured():
        return _mock_certificate()

    payload = {"image": base64.b64encode(image_bytes).decode()}
    result = await hw_post(ENDPOINTS_OCR["general_text"], payload)

    if result:
        words = result.get("result", {}).get("words_block_list", [])
        text = " ".join(w.get("words", "") for w in words)
        return _parse_certificate_text(text)
    return _mock_certificate()


async def read_cipc_certificate(image_bytes: bytes) -> dict:
    """Extracts company registration details from a CIPC certificate."""
    if not is_huawei_configured():
        return _mock_cipc()

    payload = {"image": base64.b64encode(image_bytes).decode()}
    result = await hw_post(ENDPOINTS_OCR["general_text"], payload)

    if result:
        words = result.get("result", {}).get("words_block_list", [])
        text = " ".join(w.get("words", "") for w in words)
        return _parse_cipc_text(text)
    return _mock_cipc()


def _parse_certificate_text(text: str) -> dict:
    text_l = text.lower()
    institution = next((i.title() for i in SA_INSTITUTIONS if i in text_l), "")
    qualification = next((k.title() for k in QUALIFICATION_KEYWORDS if k in text_l), "Qualification")
    year_match = re.search(r'\b(19|20)\d{2}\b', text)
    year = year_match.group() if year_match else ""
    return {
        "institution_name": institution or "Institution (from document)",
        "qualification_title": qualification,
        "year_completed": year,
        "full_text_preview": text[:300],
        "confidence_score": 0.82 if institution else 0.55,
    }


def _parse_cipc_text(text: str) -> dict:
    reg_match = re.search(r'\b(\d{4}/\d{6}/\d{2})\b', text)
    pty_match = "pty" in text.lower() or "ltd" in text.lower()
    return {
        "registration_number": reg_match.group(1) if reg_match else "",
        "company_name": "Extracted from document",
        "business_type": "Private Company (PTY) Ltd" if pty_match else "Sole Proprietor",
        "confidence_score": 0.92 if reg_match else 0.4,
        "full_text_preview": text[:200],
    }


def _mock_certificate() -> dict:
    return {"institution_name": "University of Johannesburg",
            "qualification_title": "Bachelor of Engineering", "year_completed": "2026",
            "confidence_score": 0.89, "_mock": True}

def _mock_cipc() -> dict:
    return {"registration_number": "2024/234567/07",
            "company_name": "Zama Fashion Studio (PTY) Ltd",
            "business_type": "Private Company (PTY) Ltd",
            "confidence_score": 0.94, "_mock": True}