"""Pydantic schemas for job postings and applications."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CreateJobRequest(BaseModel):
    title: str
    description: str
    requirements: Optional[str] = None
    sector: Optional[str] = None
    job_type: str = "full_time"
    work_style: str = "on_site"
    province: Optional[str] = None
    city: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    show_salary: bool = True
    salary_is_negotiable: bool = False
    required_skills: List[str] = []
    required_experience_years: int = 0
    application_deadline: Optional[datetime] = None

class UpdateJobRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    required_skills: Optional[List[str]] = None

class ApplyJobRequest(BaseModel):
    cover_note: Optional[str] = None
    portfolio_item_ids: List[str] = []

class FlagJobRequest(BaseModel):
    reason: str     # scam / trafficking / fake_company / misleading / inappropriate
    description: Optional[str] = None
    is_anonymous: bool = True

class ApplicationStatusUpdate(BaseModel):
    status: str     # submitted/viewed/shortlisted/interview_scheduled/offered/rejected
    interview_scheduled_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None