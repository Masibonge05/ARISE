from pydantic import BaseModel
from typing import Optional

class ECSEventRequest(BaseModel):
    event_type: str
    reference_id: Optional[str] = None