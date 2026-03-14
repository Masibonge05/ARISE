from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
import logging

from backend.config.database import get_db
from backend.models.user import User
from backend.models.ecs import ECSHistory, ECSFactorSnapshot, MicroLender
from backend.routers.auth import get_current_user

logger = logging.getLogger("arise.ecs")
router = APIRouter()


def _calculate_full_ecs(user: User, db: Session) -> dict:
    """
    Calculates ECS score across all 5 factors.
    🔴 Huawei ModelArts: plugs in as inference layer in production
    Max score: 850
    """
    from backend.models.user import VerificationStatus, SkillVerificationSource
    from backend.models.mentor import MentorSession, SessionStatus
    from backend.models.business import BusinessProfile

    # ── Factor 1: Formalization (max 200) ─────────────
    formalization = 0
    if user.is_email_verified:              formalization += 25
    if user.is_identity_verified:           formalization += 50
    if user.profile_photo_url:              formalization += 10
    if user.bio:                            formalization += 10

    verified_quals = [q for q in user.qualifications if q.verification_status == VerificationStatus.VERIFIED]
    formalization += min(50, len(verified_quals) * 25)

    business = db.query(BusinessProfile).filter(BusinessProfile.owner_id == user.id).first()
    if business:
        if business.cipc_number:            formalization += 30
        if business.verification_status.value == "verified": formalization += 25
    formalization = min(200, formalization)

    # ── Factor 2: Mentorship (max 150) ────────────────
    mentorship = 0
    completed_sessions = db.query(MentorSession).filter(
        MentorSession.mentee_id == user.id,
        MentorSession.status == SessionStatus.COMPLETED
    ).count()
    mentorship = min(150, completed_sessions * 25)

    # ── Factor 3: Grant Compliance (max 150) ──────────
    grant_compliance = 0
    # TODO: Track grant applications and compliance
    # Placeholder: gives points for having FundMatch profile
    if business:                            grant_compliance += 30
    grant_compliance = min(150, grant_compliance)

    # ── Factor 4: Revenue (max 200) ───────────────────
    revenue = 0
    from backend.models.user import FreelancerProfile
    freelancer = db.query(FreelancerProfile).filter(FreelancerProfile.user_id == user.id).first()
    if freelancer:
        revenue += min(100, freelancer.total_projects_completed * 10)
        if freelancer.total_earnings > 0:   revenue += 50
        if freelancer.total_earnings > 10000: revenue += 50
    revenue = min(200, revenue)

    # ── Factor 5: Community (max 150) ─────────────────
    community = 0
    verified_skills = [s for s in user.skills if s.verification_source.value != "self_claimed"]
    community += min(75, len(verified_skills) * 15)
    if freelancer and freelancer.average_rating >= 4.0: community += 50
    if freelancer and freelancer.is_top_freelancer:     community += 25
    community = min(150, community)

    total = formalization + mentorship + grant_compliance + revenue + community

    return {
        "total": total,
        "factors": {
            "formalization": {"score": formalization, "max": 200, "label": "Business Formalization"},
            "mentorship": {"score": mentorship, "max": 150, "label": "Mentorship Participation"},
            "grant_compliance": {"score": grant_compliance, "max": 150, "label": "Grant Compliance"},
            "revenue": {"score": revenue, "max": 200, "label": "Revenue Activity"},
            "community": {"score": community, "max": 150, "label": "Community Reputation"},
        }
    }


def _get_next_milestones(score: int, factors: dict) -> list:
    """Returns personalized actions to increase ECS score"""
    tips = []
    if not factors["formalization"]["score"] >= 100:
        tips.append({"action": "Verify your identity via ID upload", "points": 50, "category": "formalization"})
    if factors["mentorship"]["score"] < 50:
        tips.append({"action": "Complete your first mentorship session", "points": 25, "category": "mentorship"})
    if factors["revenue"]["score"] < 50:
        tips.append({"action": "Complete a freelance project on ARISE", "points": 30, "category": "revenue"})
    if factors["grant_compliance"]["score"] < 50:
        tips.append({"action": "Apply for a matched grant through FundMatch", "points": 30, "category": "grants"})
    if factors["community"]["score"] < 50:
        tips.append({"action": "Pass a skills assessment to verify a claimed skill", "points": 15, "category": "community"})
    return tips[:3]


# ─── Routes ────────────────────────────────────────────────────────────────────

@router.get("/", summary="Get full ECS dashboard")
async def get_ecs_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the complete ECS score breakdown, history, and recommendations.
    This is the data powering the animated ECS dashboard page.
    """
    ecs_data = _calculate_full_ecs(current_user, db)

    # Update user's stored score
    current_user.ecs_score = ecs_data["total"]
    db.commit()

    # Score history for chart
    history = db.query(ECSHistory).filter(
        ECSHistory.user_id == current_user.id
    ).order_by(ECSHistory.created_at).limit(30).all()

    # Eligible lenders
    eligible_lenders = db.query(MicroLender).filter(
        MicroLender.min_ecs_score <= ecs_data["total"],
        MicroLender.is_active == True
    ).all()

    return {
        "score": ecs_data["total"],
        "max_score": 850,
        "score_band": _get_score_band(ecs_data["total"]),
        "factors": ecs_data["factors"],
        "history": [
            {
                "date": h.created_at,
                "score": h.score_after,
                "event": h.event_description,
                "points_change": h.points_delta,
            }
            for h in history
        ],
        "next_milestones": _get_next_milestones(ecs_data["total"], ecs_data["factors"]),
        "eligible_lenders": [
            {
                "id": l.id,
                "name": l.name,
                "description": l.description,
                "max_loan": l.max_loan_amount,
                "min_ecs": l.min_ecs_score,
                "website": l.website,
            }
            for l in eligible_lenders
        ],
        "profile_tip": "Add more verified skills to boost your Community score" if ecs_data["factors"]["community"]["score"] < 75 else None,
    }


@router.get("/history", summary="Get ECS score change history")
async def get_ecs_history(
    limit: int = Query(50, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    history = db.query(ECSHistory).filter(
        ECSHistory.user_id == current_user.id
    ).order_by(ECSHistory.created_at.desc()).limit(limit).all()

    return {
        "history": [
            {
                "id": h.id,
                "event_type": h.event_type,
                "description": h.event_description,
                "points_delta": h.points_delta,
                "score_before": h.score_before,
                "score_after": h.score_after,
                "date": h.created_at,
            }
            for h in history
        ]
    }


@router.get("/lenders", summary="Get eligible micro-lenders for current ECS score")
async def get_eligible_lenders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lenders = db.query(MicroLender).filter(
        MicroLender.min_ecs_score <= current_user.ecs_score,
        MicroLender.is_active == True
    ).all()

    return {
        "current_ecs_score": current_user.ecs_score,
        "eligible_lenders": [
            {
                "id": l.id, "name": l.name, "description": l.description,
                "min_loan": l.min_loan_amount, "max_loan": l.max_loan_amount,
                "interest_rate_min": l.interest_rate_min,
                "interest_rate_max": l.interest_rate_max,
                "min_ecs_required": l.min_ecs_score, "website": l.website,
            }
            for l in lenders
        ],
        "locked_lenders_count": db.query(MicroLender).filter(
            MicroLender.min_ecs_score > current_user.ecs_score
        ).count(),
    }


def _get_score_band(score: int) -> dict:
    if score < 300:
        return {"band": "Building", "color": "#FF6B35", "message": "Keep growing your profile to unlock more opportunities"}
    elif score < 500:
        return {"band": "Developing", "color": "#FFD93D", "message": "Good progress! You're unlocking more opportunities"}
    elif score < 650:
        return {"band": "Established", "color": "#4ECDC4", "message": "Strong profile. Investors and lenders are noticing you"}
    elif score < 750:
        return {"band": "Thriving", "color": "#A8E6CF", "message": "Excellent standing. Premium opportunities unlocked"}
    else:
        return {"band": "Elite", "color": "#FF6B35", "message": "Top tier. You have access to all ARISE opportunities"}