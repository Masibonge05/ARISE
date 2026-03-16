from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BusinessProfileUpdate(BaseModel):
    business_name: Optional[str] = None
    sector: Optional[str] = None
    description: Optional[str] = None
    province: Optional[str] = None
    city: Optional[str] = None
    funding_status: Optional[str] = None
    funding_amount_seeking: Optional[float] = None
    funding_use_of_funds: Optional[str] = None
    equity_offering_percent: Optional[float] = None
    is_visible_to_investors: Optional[bool] = None
    website: Optional[str] = None