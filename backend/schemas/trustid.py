"""Pydantic schemas for TrustID verification flows."""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class OCRDocumentRequest(BaseModel):
    document_type: str          # id / certificate / cipc
    file_base64: str

class OCRIDResponse(BaseModel):
    verified: bool
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    id_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    nationality: Optional[str] = None
    confidence_score: float = 0.0
    ecs_awarded: Optional[int] = None
    new_ecs_score: Optional[int] = None

class VerifyReferenceRequest(BaseModel):
    token: str

class SkillAssessmentRequest(BaseModel):
    skill_name: str
    answers: List[int]          # 0-3 per question

class SkillAssessmentResponse(BaseModel):
    passed: bool
    score: float
    level: str
    ecs_awarded: Optional[int] = None
    new_ecs_score: Optional[int] = None

class TrustIDStatusResponse(BaseModel):
    trust_completion_score: float
    ecs_score: int
    is_identity_verified: bool
    checklist: List[dict]
    completed_items: int
    total_items: int
    potential_ecs_gain: int

class BadgeResponse(BaseModel):
    id: str
    label: str
    color: str
    icon: str