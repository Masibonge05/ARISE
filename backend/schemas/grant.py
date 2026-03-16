"""Pydantic schemas for grant applications and FundMatch."""
from pydantic import BaseModel
from typing import Optional, List, Dict

class GrantMatchRequest(BaseModel):
    sector: Optional[str] = None
    province: Optional[str] = None
    stage: Optional[str] = None
    amount_needed: Optional[float] = None
    limit: int = 20

class GrantMatchResponse(BaseModel):
    id: str
    name: str
    funder: str
    type: str
    max_amount: float
    eligibility_score: float
    is_eligible: bool
    eligibility_reasons: List[str]
    disqualifiers: List[str]
    description: Optional[str] = None
    criteria: Optional[List[str]] = None
    application_url: Optional[str] = None
    application_draft: Optional[Dict] = None

class StartApplicationRequest(BaseModel):
    grant_program_id: str
    grant_program_name: str
    funder_name: str
    amount_requested: Optional[float] = None
    application_data: Optional[Dict] = None

class SubmitApplicationRequest(BaseModel):
    application_id: str
    application_data: Dict