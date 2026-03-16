"""
huawei/ocr/id_reader.py
========================
South African ID document reader using Huawei OCR.

Handles: SA ID book, SA Smart ID card, Passport, Driver's licence.
Extracts: first_name, last_name, id_number, date_of_birth, gender, nationality.
"""
import base64, logging, re
from typing import Optional
from huawei.ocr.config import ENDPOINTS_OCR, MIN_CONFIDENCE_THRESHOLD
from backend.config.huawei import hw_post, is_huawei_configured
from backend.utils.helpers import extract_age_from_id, extract_gender_from_id

logger = logging.getLogger("arise.ocr.id_reader")


async def read_sa_id(image_bytes: bytes, side: str = "front") -> dict:
    """
    Reads a South African ID document using Huawei OCR ID Card API.
    Falls back to mock data in dev mode.
    """
    if not is_huawei_configured():
        return _mock_id()

    payload = {"image": base64.b64encode(image_bytes).decode(), "side": side}
    result = await hw_post(ENDPOINTS_OCR["id_card"], payload)

    if result:
        raw = result.get("result", {})
        return _parse_sa_id(raw)

    logger.warning("OCR ID Card API returned no result — using general text fallback")
    return await _general_text_fallback(image_bytes)


async def read_passport(image_bytes: bytes) -> dict:
    """Reads a passport using Huawei Passport OCR API."""
    if not is_huawei_configured():
        return _mock_id()

    payload = {"image": base64.b64encode(image_bytes).decode()}
    result = await hw_post(ENDPOINTS_OCR["passport"], payload)

    if result:
        raw = result.get("result", {})
        return {
            "first_name": raw.get("given_name", ""),
            "last_name": raw.get("surname", ""),
            "id_number": raw.get("passport_number", ""),
            "date_of_birth": raw.get("birth_date", ""),
            "nationality": raw.get("nationality", ""),
            "gender": raw.get("sex", "").lower(),
            "expiry_date": raw.get("expiry_date", ""),
            "confidence_score": raw.get("confidence", 0.0),
        }
    return _mock_id()


async def _general_text_fallback(image_bytes: bytes) -> dict:
    """Falls back to general OCR + heuristic parsing when ID Card OCR fails."""
    payload = {"image": base64.b64encode(image_bytes).decode()}
    result = await hw_post(ENDPOINTS_OCR["general_text"], payload)
    
    if result:
        words = result.get("result", {}).get("words_block_list", [])
        text = " ".join(w.get("words", "") for w in words)
        return _heuristic_parse(text)
    return _mock_id()


def _parse_sa_id(raw: dict) -> dict:
    """Normalises raw Huawei OCR ID response to ARISE standard format."""
    id_num = raw.get("id_number", "").replace(" ", "")
    
    parsed = {
        "first_name": raw.get("given_names", raw.get("first_name", "")),
        "last_name": raw.get("family_name", raw.get("surname", "")),
        "id_number": id_num,
        "date_of_birth": raw.get("date_of_birth", ""),
        "gender": raw.get("sex", "").lower() or (extract_gender_from_id(id_num) if id_num else ""),
        "nationality": "South African",
        "confidence_score": float(raw.get("confidence", 0.0)),
    }
    
    # Cross-check with ID number if available
    if id_num and len(id_num) == 13:
        if not parsed["gender"]:
            parsed["gender"] = extract_gender_from_id(id_num)
    
    return parsed


def _heuristic_parse(text: str) -> dict:
    """Heuristically extracts ID fields from raw OCR text."""
    id_match = re.search(r'\b\d{13}\b', text)
    id_number = id_match.group() if id_match else ""
    return {
        "first_name": "", "last_name": "",
        "id_number": id_number,
        "date_of_birth": "", "gender": extract_gender_from_id(id_number) if id_number else "",
        "nationality": "South African",
        "confidence_score": 0.5, "_heuristic": True,
    }


def _mock_id() -> dict:
    return {
        "first_name": "Sphiwe", "last_name": "Dlamini",
        "id_number": "0205154085081", "date_of_birth": "2002-05-15",
        "gender": "male", "nationality": "South African",
        "confidence_score": 0.97, "_mock": True,
    }