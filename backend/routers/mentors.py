from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import logging

from backend.config.database import get_db
from backend.models.user import User
from backend.models.mentor import MentorProfile, MentorSession, SessionStatus
from backend.routers.auth import get_current_user

logger = logging.getLogger("arise.mentors")
router = APIRouter()


class CreateMentorProfileRequest(BaseModel):
    current_title: Optional[str] = None
    current_company: Optional[str] = None
    years_experience: Optional[int] = None
    industry: Optional[str] = None
    bio: Optional[str] = None
    mentorship_areas: List[str] = []
    preferred_stages: List[str] = []
    preferred_sectors: List[str] = []
    languages: List[str] = ["English"]
    max_mentees: int = 3
    session_duration_minutes: int = 60
    sessions_per_month: int = 4
    available_days: List[str] = []


class BookSessionRequest(BaseModel):
    mentor_id: str
    scheduled_at: datetime
    agenda: Optional[str] = None
    focus_areas: List[str] = []


class CompleteSessionRequest(BaseModel):
    mentee_rating: int
    mentee_feedback: Optional[str] = None


# ─── Mentor Discovery ──────────────────────────────────────────────────────────

@router.get("/", summary="Discover matched mentors")
async def get_mentors(
    sector: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    is_bbee_linked: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns mentors matched to the entrepreneur's sector, stage, and challenge areas.
    🔴 Huawei GES: knowledge graph matching powers the ranking
    """
    query = db.query(MentorProfile).filter(
        MentorProfile.is_available == True,
        MentorProfile.is_verified == True,
    )

    if is_bbee_linked is not None:
        query = query.filter(MentorProfile.is_bbee_linked == is_bbee_linked)

    mentors = query.offset((page - 1) * limit).limit(limit).all()

    # Get business profile for matching
    from backend.models.business import BusinessProfile
    business = db.query(BusinessProfile).filter(
        BusinessProfile.owner_id == current_user.id
    ).first()

    result = []
    for m in mentors:
        user = db.query(User).filter(User.id == m.user_id).first()
        if not user:
            continue

        # Calculate match score
        match_score = 60  # Base
        if business:
            if business.sector and business.sector in m.preferred_sectors:
                match_score += 20
            if business.stage and business.stage.value in m.preferred_stages:
                match_score += 20

        result.append({
            "id": m.id,
            "mentor_name": user.full_name,
            "profile_photo_url": user.profile_photo_url,
            "current_title": m.current_title,
            "current_company": m.current_company,
            "years_experience": m.years_experience,
            "industry": m.industry,
            "mentorship_areas": m.mentorship_areas,
            "preferred_sectors": m.preferred_sectors,
            "preferred_stages": m.preferred_stages,
            "languages": m.languages,
            "average_rating": m.average_rating,
            "total_sessions": m.total_sessions,
            "is_bbee_linked": m.is_bbee_linked,
            "session_duration_minutes": m.session_duration_minutes,
            "sessions_per_month": m.sessions_per_month,
            "match_score": match_score,
        })

    result.sort(key=lambda x: x["match_score"], reverse=True)
    return {"mentors": result, "total": len(result), "page": page}


@router.get("/{mentor_id}", summary="Get mentor profile detail")
async def get_mentor_detail(
    mentor_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    mentor = db.query(MentorProfile).filter(MentorProfile.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found.")

    user = db.query(User).filter(User.id == mentor.user_id).first()
    sessions_count = db.query(MentorSession).filter(
        MentorSession.mentor_id == mentor_id,
        MentorSession.mentee_id == current_user.id
    ).count()

    return {
        "id": mentor.id,
        "mentor_name": user.full_name if user else "Unknown",
        "profile_photo_url": user.profile_photo_url if user else None,
        "bio": mentor.bio,
        "current_title": mentor.current_title,
        "current_company": mentor.current_company,
        "years_experience": mentor.years_experience,
        "industry": mentor.industry,
        "mentorship_areas": mentor.mentorship_areas,
        "preferred_sectors": mentor.preferred_sectors,
        "preferred_stages": mentor.preferred_stages,
        "languages": mentor.languages,
        "average_rating": mentor.average_rating,
        "total_sessions": mentor.total_sessions,
        "total_mentees": mentor.total_mentees,
        "is_bbee_linked": mentor.is_bbee_linked,
        "ed_rate_per_session": mentor.ed_rate_per_session,
        "available_days": mentor.available_days,
        "session_duration_minutes": mentor.session_duration_minutes,
        "sessions_per_month": mentor.sessions_per_month,
        "is_available": mentor.is_available,
        "already_in_session": sessions_count > 0,
    }


# ─── Session Booking ───────────────────────────────────────────────────────────

@router.post("/sessions/book", summary="Book a mentor session", status_code=201)
async def book_session(
    body: BookSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Books a session between Zama and a matched mentor.
    🔴 Huawei Meeting: generates video call link
    """
    mentor = db.query(MentorProfile).filter(MentorProfile.id == body.mentor_id).first()
    if not mentor or not mentor.is_available:
        raise HTTPException(status_code=404, detail="Mentor not found or unavailable.")

    session = MentorSession(
        mentor_id=body.mentor_id,
        mentee_id=current_user.id,
        scheduled_at=body.scheduled_at,
        duration_minutes=mentor.session_duration_minutes,
        agenda=body.agenda,
        focus_areas=body.focus_areas,
        meeting_link=f"https://meeting.huawei.com/arise/{body.mentor_id[:8]}",
        status=SessionStatus.SCHEDULED,
        ecs_points_awarded=25,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "message": "Session booked successfully.",
        "session_id": session.id,
        "scheduled_at": session.scheduled_at,
        "meeting_link": session.meeting_link,
        "duration_minutes": session.duration_minutes,
        "ecs_points_on_completion": 25,
    }


@router.get("/sessions/my", summary="Get own session history")
async def get_my_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(MentorSession).filter(
        MentorSession.mentee_id == current_user.id
    ).all()

    result = []
    for s in sessions:
        mentor = db.query(MentorProfile).filter(MentorProfile.id == s.mentor_id).first()
        mentor_user = db.query(User).filter(User.id == mentor.user_id).first() if mentor else None
        result.append({
            "id": s.id,
            "mentor_name": mentor_user.full_name if mentor_user else "Unknown",
            "scheduled_at": s.scheduled_at,
            "duration_minutes": s.duration_minutes,
            "status": s.status,
            "focus_areas": s.focus_areas,
            "ai_session_notes": s.ai_session_notes,
            "action_items": s.action_items,
            "mentee_rating": s.mentee_rating,
            "ecs_points_awarded": s.ecs_points_awarded if s.ecs_points_applied else 0,
        })

    return {"sessions": result, "total": len(result),
            "total_completed": len([s for s in result if s["status"] == "completed"])}


@router.post("/sessions/{session_id}/complete", summary="Mark session as completed and rate it")
async def complete_session(
    session_id: str,
    body: CompleteSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Completes a session, generates AI notes, awards ECS points.
    🔴 Huawei NLP: generates session summary from agenda + focus areas
    """
    session = db.query(MentorSession).filter(
        MentorSession.id == session_id,
        MentorSession.mentee_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    session.status = SessionStatus.COMPLETED
    session.completed_at = datetime.utcnow()
    session.mentee_rating = body.mentee_rating
    session.mentee_feedback = body.mentee_feedback

    # TODO: Call Huawei NLP to generate session notes from agenda
    session.ai_session_notes = f"Session focused on: {', '.join(session.focus_areas)}. Action items were discussed and documented."
    session.action_items = ["Follow up on discussed items", "Apply learnings to business plan"]

    # Award ECS points
    if not session.ecs_points_applied:
        current_user.ecs_score = min(850, current_user.ecs_score + session.ecs_points_awarded)
        session.ecs_points_applied = True

    # Update mentor stats
    mentor = db.query(MentorProfile).filter(MentorProfile.id == session.mentor_id).first()
    if mentor:
        mentor.total_sessions += 1
        total = mentor.total_sessions
        mentor.average_rating = ((mentor.average_rating * (total - 1)) + body.mentee_rating) / total

    db.commit()
    return {
        "message": "Session completed. Notes saved to your TrustID profile.",
        "ecs_points_awarded": session.ecs_points_awarded,
        "new_ecs_score": current_user.ecs_score,
        "ai_session_notes": session.ai_session_notes,
        "action_items": session.action_items,
    }


# ─── Become a Mentor ───────────────────────────────────────────────────────────

@router.post("/profile/create", summary="Register as a mentor", status_code=201)
async def create_mentor_profile(
    body: CreateMentorProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(MentorProfile).filter(MentorProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=409, detail="You already have a mentor profile.")

    mentor = MentorProfile(
        user_id=current_user.id,
        current_title=body.current_title,
        current_company=body.current_company,
        years_experience=body.years_experience,
        industry=body.industry,
        bio=body.bio,
        mentorship_areas=body.mentorship_areas,
        preferred_stages=body.preferred_stages,
        preferred_sectors=body.preferred_sectors,
        languages=body.languages,
        max_mentees=body.max_mentees,
        session_duration_minutes=body.session_duration_minutes,
        sessions_per_month=body.sessions_per_month,
        available_days=body.available_days,
        is_available=True,
    )
    db.add(mentor)
    db.commit()
    return {"message": "Mentor profile created. Pending verification.", "mentor_id": mentor.id}