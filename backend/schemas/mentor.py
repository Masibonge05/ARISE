"""Pydantic schemas for mentors and sessions."""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class BookSessionRequest(BaseModel):
    mentor_id: str
    scheduled_at: datetime
    focus_areas: List[str] = []
    agenda: Optional[str] = None

class CompleteSessionRequest(BaseModel):
    session_id: str
    duration_minutes: int = 60
    session_notes: Optional[str] = None
    mentee_rating: Optional[int] = None
    mentee_review: Optional[str] = None

class RateMentorRequest(BaseModel):
    session_id: str
    rating: int             # 1–5
    review: Optional[str] = None
    would_rebook: bool = True

class MentorDiscoveryFilters(BaseModel):
    sector: Optional[str] = None
    stage: Optional[str] = None
    is_bbee_linked: Optional[bool] = None
    language: Optional[str] = None
    limit: int = 20

class MentorProfileResponse(BaseModel):
    id: str
    mentor_name: str
    current_title: Optional[str] = None
    current_company: Optional[str] = None
    industry: Optional[str] = None
    mentorship_areas: List[str] = []
    average_rating: Optional[float] = None
    total_sessions: int = 0
    is_bbee_linked: bool = False
    match_score: Optional[int] = None
    is_available: bool = True