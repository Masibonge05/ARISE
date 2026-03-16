from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import base64
import logging

from backend.config.database import get_db
from backend.models.user import User, WorkExperience, Qualification, VerificationStatus
from backend.routers.auth import get_current_user
from backend.services.ecs_engine import award_ecs_event

logger = logging.getLogger("arise.trustid")
router = APIRouter()

class VerifyReferenceRequest(BaseModel):
    token: str

class OCRDocumentRequest(BaseModel):
    document_type: str   # id / certificate / cipc
    file_base64: str

@router.get("/status", summary="Get full TrustID verification status")
async def get_verification_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from backend.models.user import SkillVerificationSource
    skills_verified = len([s for s in current_user.skills if s.verification_source != SkillVerificationSource.SELF_CLAIMED])
    quals_verified = len([q for q in current_user.qualifications if q.verification_status == VerificationStatus.VERIFIED])
    quals_pending = len([q for q in current_user.qualifications if q.verification_status == VerificationStatus.PENDING])
    work_verified = len([w for w in current_user.work_experiences if w.verification_status == VerificationStatus.VERIFIED])

    checklist = [
        {"id": "email", "label": "Email verified", "done": current_user.is_email_verified, "ecs": 25, "action": "/settings"},
        {"id": "identity", "label": "Identity document verified", "done": current_user.is_identity_verified, "ecs": 50, "action": "/onboarding/identity"},
        {"id": "photo", "label": "Profile photo added", "done": bool(current_user.profile_photo_url), "ecs": 10, "action": "/profile"},
        {"id": "bio", "label": "Bio written", "done": bool(current_user.bio), "ecs": 10, "action": "/profile"},
        {"id": "qualification", "label": "Qualification verified", "done": quals_verified > 0, "ecs": 25, "action": "/profile"},
        {"id": "skill", "label": "Skill assessed", "done": skills_verified > 0, "ecs": 15, "action": "/skills"},
        {"id": "work", "label": "Work experience verified", "done": work_verified > 0, "ecs": 20, "action": "/profile"},
    ]

    completed = sum(1 for c in checklist if c["done"])
    total_possible_ecs = sum(c["ecs"] for c in checklist if not c["done"])

    return {
        "trust_completion_score": current_user.trust_completion_score,
        "ecs_score": current_user.ecs_score,
        "is_identity_verified": current_user.is_identity_verified,
        "identity_status": current_user.identity_verification_status,
        "checklist": checklist,
        "completed_items": completed,
        "total_items": len(checklist),
        "potential_ecs_gain": total_possible_ecs,
        "qualifications": {
            "total": len(current_user.qualifications),
            "verified": quals_verified,
            "pending": quals_pending,
        },
        "skills": {
            "total": len(current_user.skills),
            "verified": skills_verified,
            "self_claimed": len(current_user.skills) - skills_verified,
        },
        "work_experience": {
            "total": len(current_user.work_experiences),
            "verified": work_verified,
            "pending": len([w for w in current_user.work_experiences if w.verification_status == VerificationStatus.PENDING]),
        },
    }

@router.post("/ocr/id", summary="Submit ID document for Huawei OCR verification")
async def ocr_id_document(
    body: OCRDocumentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """🔴 Huawei OCR: reads SA ID, passport, or drivers licence"""
    from backend.services.huawei_ocr import read_id_document
    try:
        image_bytes = base64.b64decode(body.file_base64)
        result = await read_id_document(image_bytes)

        if result.get("id_number"):
            current_user.id_number = result["id_number"]
            current_user.is_identity_verified = True
            current_user.identity_verification_status = VerificationStatus.VERIFIED
            if result.get("date_of_birth"):
                try:
                    current_user.date_of_birth = datetime.strptime(result["date_of_birth"], "%Y-%m-%d")
                except Exception:
                    pass
            if result.get("gender"):
                current_user.gender = result["gender"]

            new_score = award_ecs_event(current_user, "identity_verified", db)
            db.commit()

            return {
                "verified": True,
                "extracted": result,
                "ecs_awarded": 50,
                "new_ecs_score": new_score,
            }

        return {"verified": False, "extracted": result, "message": "Could not extract ID number. Please try a clearer image."}

    except Exception as e:
        logger.error(f"OCR ID error: {e}")
        raise HTTPException(status_code=400, detail=f"Document processing failed: {str(e)}")

@router.post("/ocr/certificate", summary="Submit certificate for Huawei OCR verification")
async def ocr_certificate(
    body: OCRDocumentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """🔴 Huawei OCR: reads academic certificates and extracts qualification details"""
    from backend.services.huawei_ocr import read_certificate
    try:
        image_bytes = base64.b64decode(body.file_base64)
        result = await read_certificate(image_bytes)
        return {"extracted": result, "message": "Certificate scanned. Please confirm the extracted details."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Certificate scan failed: {str(e)}")

@router.post("/ocr/cipc", summary="Submit CIPC certificate for verification")
async def ocr_cipc(
    body: OCRDocumentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """🔴 Huawei OCR: reads CIPC registration certificate"""
    from backend.services.huawei_ocr import read_cipc_certificate
    from backend.models.business import BusinessProfile, BusinessVerificationStatus
    try:
        image_bytes = base64.b64decode(body.file_base64)
        result = await read_cipc_certificate(image_bytes)

        business = db.query(BusinessProfile).filter(BusinessProfile.owner_id == current_user.id).first()
        if business and result.get("registration_number"):
            business.cipc_number = result["registration_number"]
            business.verification_status = BusinessVerificationStatus.PENDING
            new_score = award_ecs_event(current_user, "business_registered", db)
            db.commit()
            return {"extracted": result, "cipc_saved": True, "ecs_awarded": 30, "new_ecs_score": new_score}

        return {"extracted": result, "cipc_saved": False}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CIPC scan failed: {str(e)}")

@router.post("/verify-reference", summary="Verify work experience via reference email")
async def verify_work_reference(
    body: VerifyReferenceRequest,
    db: Session = Depends(get_db)
):
    """Called when a reference clicks the verification link in their email"""
    exp = db.query(WorkExperience).filter(WorkExperience.verification_token == body.token).first()
    if not exp:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token.")

    exp.verification_status = VerificationStatus.VERIFIED
    exp.verification_token = None
    exp.verified_at = datetime.utcnow()

    user = db.query(User).filter(User.id == exp.user_id).first()
    if user:
        award_ecs_event(user, "work_verified", db)

    db.commit()
    return {"message": "Work experience verified. The user has been notified and their ECS score updated. Thank you!"}

@router.post("/skills/assess", summary="Record skill assessment result")
async def record_skill_assessment(
    skill_id: str,
    score: float,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Records a passed skills assessment and upgrades verification source"""
    from backend.models.user import UserSkill, SkillVerificationSource
    skill = db.query(UserSkill).filter(
        UserSkill.id == skill_id,
        UserSkill.user_id == current_user.id
    ).first()

    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found.")
    if score < 50:
        return {"passed": False, "score": score, "message": "Assessment not passed. Score must be 50% or higher."}

    skill.verification_source = SkillVerificationSource.PLATFORM_ASSESSED
    skill.assessment_score = score
    skill.assessment_passed = True
    skill.assessed_at = datetime.utcnow()

    new_score = award_ecs_event(current_user, "skill_assessed", db)
    db.commit()

    return {"passed": True, "score": score, "ecs_awarded": 15, "new_ecs_score": new_score,
            "message": f"Skill verified! Your TrustID now shows this skill as Platform Assessed."}

@router.get("/badges", summary="Get all TrustID verification badges for user")
async def get_badges(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from backend.models.user import SkillVerificationSource
    badges = []
    if current_user.is_identity_verified:
        badges.append({"id": "identity", "label": "Identity Verified", "color": "#4ECDC4", "icon": "🪪"})
    if current_user.is_email_verified:
        badges.append({"id": "email", "label": "Email Verified", "color": "#4ECDC4", "icon": "✉️"})
    verified_quals = [q for q in current_user.qualifications if q.verification_status == VerificationStatus.VERIFIED]
    if verified_quals:
        badges.append({"id": "education", "label": f"{len(verified_quals)} Qualification(s) Verified", "color": "#FFD93D", "icon": "🎓"})
    assessed_skills = [s for s in current_user.skills if s.verification_source == SkillVerificationSource.PLATFORM_ASSESSED]
    if assessed_skills:
        badges.append({"id": "skills", "label": f"{len(assessed_skills)} Skill(s) Assessed", "color": "#FF6B35", "icon": "⚡"})
    from backend.models.user import FreelancerProfile
    fp = db.query(FreelancerProfile).filter(FreelancerProfile.user_id == current_user.id).first()
    if fp and fp.is_top_freelancer:
        badges.append({"id": "top_freelancer", "label": "Top Verified Freelancer", "color": "#A8E6CF", "icon": "🏆"})
    return {"badges": badges, "total": len(badges)}