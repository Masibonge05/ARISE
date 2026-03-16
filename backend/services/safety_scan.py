"""Safety scan service — wraps Huawei NLP for content moderation"""
import logging
from backend.services.huawei_nlp import scan_job_posting

logger = logging.getLogger("arise.safety_scan")

async def scan_before_publish(title: str, description: str) -> tuple[bool, dict]:
    """
    Scans content before publishing. Returns (should_publish, scan_result).
    Called automatically when a job is submitted.
    """
    result = await scan_job_posting(title, description)
    should_publish = result.get("recommendation") in ("approve", "flag_for_review")
    if result.get("recommendation") == "block":
        logger.warning(f"Content blocked by safety scan: {title}")
        should_publish = False
    return should_publish, result

async def scan_message(text: str) -> dict:
    """Scans a message for safety concerns"""
    WARNING_PHRASES = [
        "pay upfront", "send money", "western union", "bank transfer first",
        "whatsapp me only", "my personal number", "outside arise"
    ]
    flags = [p for p in WARNING_PHRASES if p.lower() in text.lower()]
    return {
        "safe": len(flags) == 0,
        "flags": flags,
        "action": "warn_user" if flags else "allow",
    }