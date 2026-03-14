from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import logging

from backend.config.database import get_db
from backend.models.user import (
    User, UserSkill, Qualification, WorkExperience,
    PortfolioItem, SkillVerificationSource, VerificationStatus
)
from backend.routers.auth import get_current_user, get_current_verified_user

logger = logging.getLogger("arise.users")
router = APIRouter()


# ─── Schemas ───────────────────────────────────────────────────────────────────

class UpdateProfileRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    province: Optional[str] = None
    city: Optional[str] = None
    preferred_language: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    is_available: Optional[bool] = None
    is_visible_to_investors: Optional[bool] = None
    is_visible_to_employers: Optional[bool] = None


class AddSkillRequest(BaseModel):
    skill_name: str
    category: Optional[str] = None
    level: str = "intermediate"
    years_experience: Optional[float] = None
    is_language: bool = False


class AddQualificationRequest(BaseModel):
    institution_name: str
    qualification_title: str
    field_of_study: Optional[str] = None
    year_completed: Optional[int] = None
    is_current: bool = False


class AddWorkExperienceRequest(BaseModel):
    company_name: str
    job_title: str
    start_date: datetime
    end_date: Optional[datetime] = None
    is_current: bool = False
    description: Optional[str] = None
    reference_email: Optional[str] = None


# ─── Profile Routes ────────────────────────────────────────────────────────────

@router.get("/me", summary="Get own full profile")
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns the current user's complete TrustID profile including skills, qualifications, work history"""
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "primary_persona": current_user.primary_persona,
        "secondary_personas": current_user.secondary_personas,
        "bio": current_user.bio,
        "province": current_user.province,
        "city": current_user.city,
        "profile_photo_url": current_user.profile_photo_url,
        "trust_completion_score": current_user.trust_completion_score,
        "ecs_score": current_user.ecs_score,
        "is_identity_verified": current_user.is_identity_verified,
        "is_available": current_user.is_available,
        "skills": [
            {
                "id": s.id,
                "skill_name": s.skill_name,
                "category": s.category,
                "level": s.level,
                "verification_source": s.verification_source,
                "assessment_score": s.assessment_score,
                "is_language": s.is_language,
            }
            for s in current_user.skills
        ],
        "qualifications": [
            {
                "id": q.id,
                "institution_name": q.institution_name,
                "qualification_title": q.qualification_title,
                "field_of_study": q.field_of_study,
                "year_completed": q.year_completed,
                "verification_status": q.verification_status,
            }
            for q in current_user.qualifications
        ],
        "work_experiences": [
            {
                "id": w.id,
                "company_name": w.company_name,
                "job_title": w.job_title,
                "start_date": w.start_date,
                "end_date": w.end_date,
                "is_current": w.is_current,
                "description": w.description,
                "verification_status": w.verification_status,
            }
            for w in current_user.work_experiences
        ],
        "portfolio_items": [
            {
                "id": p.id,
                "title": p.title,
                "category": p.category,
                "thumbnail_url": p.thumbnail_url,
                "is_client_verified": p.is_client_verified,
                "client_rating": p.client_rating,
            }
            for p in current_user.portfolio_items
        ],
        "created_at": current_user.created_at,
    }


@router.get("/{user_id}", summary="View another user's public TrustID profile")
async def get_user_profile(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Public profile view — respects privacy settings"""
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Check investor visibility
    if current_user.primary_persona == "investor" and not user.is_visible_to_investors:
        raise HTTPException(
            status_code=403,
            detail="This entrepreneur has not enabled investor visibility."
        )

    return {
        "id": user.id,
        "full_name": user.full_name,
        "primary_persona": user.primary_persona,
        "bio": user.bio,
        "province": user.province,
        "city": user.city,
        "profile_photo_url": user.profile_photo_url,
        "trust_completion_score": user.trust_completion_score,
        "ecs_score": user.ecs_score,
        "is_identity_verified": user.is_identity_verified,
        "is_available": user.is_available,
        "skills": [
            {
                "skill_name": s.skill_name,
                "category": s.category,
                "level": s.level,
                "verification_source": s.verification_source,
                "is_language": s.is_language,
            }
            for s in user.skills
        ],
        "qualifications": [
            {
                "institution_name": q.institution_name,
                "qualification_title": q.qualification_title,
                "year_completed": q.year_completed,
                "verification_status": q.verification_status,
            }
            for q in user.qualifications
        ],
        "work_experiences": [
            {
                "company_name": w.company_name,
                "job_title": w.job_title,
                "start_date": w.start_date,
                "end_date": w.end_date,
                "is_current": w.is_current,
                "verification_status": w.verification_status,
            }
            for w in user.work_experiences
        ],
    }


@router.patch("/me", summary="Update own profile")
async def update_profile(
    body: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    update_data = body.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

    # Recalculate trust completion score
    current_user.trust_completion_score = _calculate_trust_score(current_user)
    db.commit()
    db.refresh(current_user)

    return {"message": "Profile updated successfully.", "trust_score": current_user.trust_completion_score}


# ─── Skills Routes ─────────────────────────────────────────────────────────────

@router.post("/me/skills", summary="Add a skill to TrustID", status_code=201)
async def add_skill(
    body: AddSkillRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check for duplicate
    existing = db.query(UserSkill).filter(
        UserSkill.user_id == current_user.id,
        UserSkill.skill_name == body.skill_name
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="This skill is already on your profile.")

    skill = UserSkill(
        user_id=current_user.id,
        skill_name=body.skill_name,
        category=body.category,
        level=body.level,
        years_experience=body.years_experience,
        is_language=body.is_language,
        verification_source=SkillVerificationSource.SELF_CLAIMED,
    )
    db.add(skill)
    current_user.trust_completion_score = _calculate_trust_score(current_user)
    db.commit()

    return {"message": f"Skill '{body.skill_name}' added. Complete an assessment to verify it.", "skill_id": skill.id}


@router.delete("/me/skills/{skill_id}", summary="Remove a skill")
async def remove_skill(
    skill_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skill = db.query(UserSkill).filter(
        UserSkill.id == skill_id,
        UserSkill.user_id == current_user.id
    ).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found.")
    db.delete(skill)
    db.commit()
    return {"message": "Skill removed."}


# ─── Qualifications Routes ─────────────────────────────────────────────────────

@router.post("/me/qualifications", summary="Add a qualification", status_code=201)
async def add_qualification(
    body: AddQualificationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    qual = Qualification(
        user_id=current_user.id,
        institution_name=body.institution_name,
        qualification_title=body.qualification_title,
        field_of_study=body.field_of_study,
        year_completed=body.year_completed,
        is_current=body.is_current,
        verification_status=VerificationStatus.PENDING,
    )
    db.add(qual)
    current_user.trust_completion_score = _calculate_trust_score(current_user)
    db.commit()

    return {
        "message": "Qualification added. Upload your certificate to begin verification.",
        "qualification_id": qual.id
    }


# ─── Work Experience Routes ────────────────────────────────────────────────────

@router.post("/me/work-experience", summary="Add work experience", status_code=201)
async def add_work_experience(
    body: AddWorkExperienceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exp = WorkExperience(
        user_id=current_user.id,
        company_name=body.company_name,
        job_title=body.job_title,
        start_date=body.start_date,
        end_date=body.end_date,
        is_current=body.is_current,
        description=body.description,
        reference_email=body.reference_email,
        verification_status=VerificationStatus.PENDING,
    )
    db.add(exp)
    current_user.trust_completion_score = _calculate_trust_score(current_user)
    db.commit()

    msg = "Work experience added."
    if body.reference_email:
        msg += f" A verification email has been sent to {body.reference_email}."

    return {"message": msg, "experience_id": exp.id}


# ─── Trust Score Calculator ────────────────────────────────────────────────────

def _calculate_trust_score(user: User) -> float:
    """
    Calculates the TrustID completion percentage (0-100).
    Called every time profile data changes.
    """
    score = 0.0

    # Identity (20 points)
    if user.is_email_verified:         score += 5
    if user.is_identity_verified:      score += 15

    # Personal info (10 points)
    if user.bio:                        score += 3
    if user.profile_photo_url:          score += 4
    if user.province and user.city:     score += 3

    # Qualifications (20 points)
    verified_quals = [q for q in user.qualifications if q.verification_status == VerificationStatus.VERIFIED]
    pending_quals = [q for q in user.qualifications if q.verification_status == VerificationStatus.PENDING]
    score += min(20, len(verified_quals) * 10 + len(pending_quals) * 3)

    # Skills (20 points)
    verified_skills = [s for s in user.skills if s.verification_source != SkillVerificationSource.SELF_CLAIMED]
    claimed_skills = [s for s in user.skills if s.verification_source == SkillVerificationSource.SELF_CLAIMED]
    score += min(20, len(verified_skills) * 4 + len(claimed_skills) * 1)

    # Work experience (20 points)
    verified_exp = [w for w in user.work_experiences if w.verification_status == VerificationStatus.VERIFIED]
    pending_exp = [w for w in user.work_experiences if w.verification_status == VerificationStatus.PENDING]
    score += min(20, len(verified_exp) * 8 + len(pending_exp) * 3)

    # Portfolio (10 points)
    verified_portfolio = [p for p in user.portfolio_items if p.is_client_verified]
    score += min(10, len(verified_portfolio) * 3)

    return min(100.0, round(score, 1))