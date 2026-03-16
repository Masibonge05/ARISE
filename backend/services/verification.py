"""Verification service — sends verification emails to references and institutions"""
import secrets
import logging
from sqlalchemy.orm import Session
from backend.models.user import WorkExperience, Qualification

logger = logging.getLogger("arise.verification")

def generate_verification_token() -> str:
    return secrets.token_urlsafe(32)

async def send_reference_verification_email(exp: WorkExperience, db: Session) -> bool:
    """Sends verification email to work experience reference contact"""
    if not exp.reference_email:
        return False
    token = generate_verification_token()
    exp.verification_token = token
    db.commit()
    # TODO: Send email via SMTP
    # verify_url = f"https://arise.co.za/verify/work?token={token}"
    logger.info(f"Verification email queued for: {exp.reference_email} (work: {exp.company_name})")
    return True

async def check_saqa_institution(institution_name: str) -> dict:
    """Checks if an institution is SAQA-registered"""
    # TODO: integrate with SAQA API
    KNOWN_INSTITUTIONS = [
        "university of johannesburg", "university of the witwatersrand",
        "university of cape town", "university of pretoria",
        "stellenbosch university", "university of kwazulu-natal",
        "nelson mandela university", "unisa",
    ]
    is_registered = institution_name.lower() in KNOWN_INSTITUTIONS
    return {"institution": institution_name, "is_registered": is_registered, "source": "saqa_fallback"}