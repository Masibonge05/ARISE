"""Pydantic schemas for investor connect flow."""
from pydantic import BaseModel
from typing import Optional, List

class ExpressInterestRequest(BaseModel):
    business_id: str
    investor_message: Optional[str] = None
    investment_amount_proposed: Optional[float] = None
    investment_instrument: Optional[str] = None   # equity / convertible / debt / grant

class RespondToInterestRequest(BaseModel):
    interest_id: str
    accept: bool
    entrepreneur_response: Optional[str] = None

class InvestorProfileRequest(BaseModel):
    organization: Optional[str] = None
    investor_type: Optional[str] = None   # angel / vc / corporate / dfi / family_office
    focus_sectors: Optional[List[str]] = None
    focus_stages: Optional[List[str]] = None
    min_ticket_size: Optional[float] = None
    max_ticket_size: Optional[float] = None
    preferred_instruments: Optional[List[str]] = None
    terms_agreed: Optional[bool] = None
    is_bbee_mandate: Optional[bool] = None

class InvestorDiscoveryFilters(BaseModel):
    sector: Optional[str] = None
    stage: Optional[str] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    limit: int = 20