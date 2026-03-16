from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UpdateProfileRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    province: Optional[str] = None
    city: Optional[str] = None
    preferred_language: Optional[str] = None
    linkedin_url: Optional[str] = None
    is_available: Optional[bool] = None
    is_visible_to_investors: Optional[bool] = None
    is_visible_to_employers: Optional[bool] = None
    gender: Optional[str] = None
    id_number: Optional[str] = None
    date_of_birth: Optional[datetime] = None

class SkillRequest(BaseModel):
    skill_name: str
    category: Optional[str] = None
    level: str = "intermediate"
    years_experience: Optional[float] = None
    is_language: bool = False

class QualificationRequest(BaseModel):
    institution_name: str
    qualification_title: str
    field_of_study: Optional[str] = None
    year_completed: Optional[int] = None
    is_current: bool = False
    reference_email: Optional[str] = None

class WorkExperienceRequest(BaseModel):
    company_name: str
    job_title: str
    start_date: datetime
    end_date: Optional[datetime] = None
    is_current: bool = False
    description: Optional[str] = None
    reference_email: Optional[str] = None