"""Pydantic schemas for freelance projects and proposals."""
from pydantic import BaseModel
from typing import Optional, List

class CreateProjectRequest(BaseModel):
    title: str
    description: str
    category: str
    budget_min: float
    budget_max: float
    deadline_days: int
    required_skills: List[str] = []
    province: Optional[str] = None
    is_remote: bool = True

class UpdateProjectRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    status: Optional[str] = None

class SubmitProposalRequest(BaseModel):
    cover_message: str
    proposed_rate: float
    estimated_days: int
    portfolio_item_ids: List[str] = []

class DeliverProjectRequest(BaseModel):
    delivery_notes: Optional[str] = None
    delivery_url: Optional[str] = None

class RateProjectRequest(BaseModel):
    rating: int             # 1–5
    review: Optional[str] = None
    would_rehire: bool = True