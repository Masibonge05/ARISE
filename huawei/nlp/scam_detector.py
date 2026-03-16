"""
huawei/nlp/scam_detector.py
============================
Job posting safety scanner using Huawei NLP + rules engine.

Detects: job scams, human trafficking red flags, misleading offers.
Used by: safety router, job submission flow, background monitoring.
"""
import re, logging
from typing import List, Tuple
from huawei.nlp.config import ENDPOINTS_NLP, MAX_TEXT_LENGTH
from backend.config.huawei import hw_post, is_huawei_configured

logger = logging.getLogger("arise.nlp.scam_detector")

# ─── Rules Engine Patterns ────────────────────────────────────────────────────
# Level 1: Critical — block immediately
CRITICAL_PATTERNS = [
    r"\bupfront\s+(fee|payment|deposit)\b",
    r"\bregistration\s+fee\b",
    r"\btraining\s+fee\b",
    r"\bpay\s+(for|your)\s+(uniform|equipment|starter\s+kit|tools)\b",
    r"\bescort\b", r"\bcompanion\s+services?\b",
    r"\bsend\s+id\s+(before|prior|first)\b",
    r"\btravel\s+(abroad|overseas|internationally).{0,40}(domestic|cleaning|nanny|child\s*care)\b",
]

# Level 2: High risk — flag for review
HIGH_PATTERNS = [
    r"\bwhatsapp\s+only\b", r"\bno\s+cv\s+needed\b",
    r"\bno\s+experience.{0,30}earn.{0,20}r\s*[3-9]\d{4,}\b",
    r"\bwork\s+from\s+home.{0,30}earn.{0,20}r\s*\d{5,}\b",
    r"\bmodelling.{0,50}(no\s+experience|any\s+age|18\+)\b",
]

# Level 3: Medium — informational flag
MEDIUM_PATTERNS = [
    r"\bno\s+interview\s+needed\b",
    r"\bimmediate\s+start.{0,30}cash\s+in\s+hand\b",
    r"\bunlimited\s+earnings?\b",
]

COMPILED = {
    "critical": [re.compile(p, re.IGNORECASE) for p in CRITICAL_PATTERNS],
    "high":     [re.compile(p, re.IGNORECASE) for p in HIGH_PATTERNS],
    "medium":   [re.compile(p, re.IGNORECASE) for p in MEDIUM_PATTERNS],
}


async def scan_job_content(title: str, description: str) -> dict:
    """
    Full safety scan: rules engine + Huawei NLP.
    Returns recommendation: approve / flag_for_review / manual_review / block
    """
    text = f"{title} {description}"[:MAX_TEXT_LENGTH]
    flags = _rules_scan(text)

    # Enhance with Huawei NLP if available
    if is_huawei_configured():
        nlp_flags = await _nlp_scan(text)
        flags.extend(nlp_flags)

    severities = [f["severity"] for f in flags]
    if "critical" in severities:
        risk, action = "critical", "block"
    elif "high" in severities:
        risk, action = "high", "manual_review"
    elif flags:
        risk, action = "medium", "flag_for_review"
    else:
        risk, action = "low", "approve"

    return {
        "passed": action in ("approve", "flag_for_review"),
        "flags": flags,
        "risk_level": risk,
        "recommendation": action,
        "scan_engine": "huawei_nlp+rules" if is_huawei_configured() else "rules_only",
    }


def _rules_scan(text: str) -> List[dict]:
    flags = []
    for severity, patterns in COMPILED.items():
        for pattern in patterns:
            if pattern.search(text):
                flags.append({
                    "severity": severity,
                    "type": "pattern_match",
                    "pattern": pattern.pattern[:60],
                })
    return flags


async def _nlp_scan(text: str) -> List[dict]:
    """Calls Huawei NLP text classification for semantic safety analysis."""
    result = await hw_post(ENDPOINTS_NLP["text_classification"],
                           {"text": text[:1000], "language": "en"})
    if not result:
        return []

    flags = []
    for cat in result.get("categories", []):
        if cat.get("label") in ("spam", "fraud", "adult", "illegal") and cat.get("score", 0) > 0.65:
            flags.append({
                "severity": "high",
                "type": "nlp_classification",
                "category": cat["label"],
                "confidence": cat["score"],
            })
    return flags


async def scan_message(text: str) -> dict:
    """Scans an in-platform message for safety concerns."""
    warnings = [
        "pay upfront", "send money first", "western union", "bank transfer first",
        "whatsapp me only", "outside arise", "my personal number", "telegram only",
    ]
    found = [w for w in warnings if w in text.lower()]
    return {
        "safe": not found,
        "warnings": found,
        "action": "warn_user" if found else "allow",
    }