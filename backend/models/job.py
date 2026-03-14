from sqlalchemy import (
    Column, String, Boolean, DateTime, Enum,
    Text, Integer, Float, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from backend.config.database import Base


class JobStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    ACTIVE = "active"
    PAUSED = "paused"
    CLOSED = "closed"
    FLAGGED = "flagged"
    REMOVED = "removed"


class JobType(str, enum.Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"
    LEARNERSHIP = "learnership"
    VOLUNTEER = "volunteer"


class WorkStyle(str, enum.Enum):
    REMOTE = "remote"
    HYBRID = "hybrid"
    ON_SITE = "on_site"


class ApplicationStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    VIEWED = "viewed"
    SHORTLISTED = "shortlisted"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    OFFERED = "offered"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class EmployerVerificationStatus(str, enum.Enum):
    UNVERIFIED = "unverified"
    PENDING = "pending"
    VERIFIED = "verified"
    SUSPENDED = "suspended"


class EmployerProfile(Base):
    __tablename__ = "employer_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    company_name = Column(String, nullable=False)
    company_size = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    website = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String, nullable=True)
    province = Column(String, nullable=True)
    city = Column(String, nullable=True)
    address = Column(String, nullable=True)
    cipc_number = Column(String, nullable=True)
    verification_status = Column(Enum(EmployerVerificationStatus), default=EmployerVerificationStatus.UNVERIFIED)
    verified_at = Column(DateTime, nullable=True)
    trust_score = Column(Float, default=0.0)
    total_jobs_posted = Column(Integer, default=0)
    total_hires = Column(Integer, default=0)
    avg_response_time_hours = Column(Float, nullable=True)
    report_count = Column(Integer, default=0)
    is_suspended = Column(Boolean, default=False)
    is_bbee_participant = Column(Boolean, default=False)
    ed_budget_monthly = Column(Float, nullable=True)
    ed_budget_used = Column(Float, default=0.0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    jobs = relationship("Job", back_populates="employer", cascade="all, delete-orphan")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    employer_id = Column(String, ForeignKey("employer_profiles.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=True)
    responsibilities = Column(Text, nullable=True)
    sector = Column(String, nullable=True)
    job_type = Column(Enum(JobType), nullable=False)
    work_style = Column(Enum(WorkStyle), default=WorkStyle.ON_SITE)
    province = Column(String, nullable=True)
    city = Column(String, nullable=True)
    is_remote = Column(Boolean, default=False)
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    salary_currency = Column(String, default="ZAR")
    salary_period = Column(String, default="monthly")
    salary_is_negotiable = Column(Boolean, default=False)
    show_salary = Column(Boolean, default=True)
    required_skills = Column(JSON, default=list)
    required_experience_years = Column(Integer, default=0)
    required_education_level = Column(String, nullable=True)
    preferred_languages = Column(JSON, default=list)
    status = Column(Enum(JobStatus), default=JobStatus.PENDING_REVIEW)
    safety_scan_passed = Column(Boolean, nullable=True)
    safety_scan_flags = Column(JSON, default=list)
    safety_scanned_at = Column(DateTime, nullable=True)
    is_featured = Column(Boolean, default=False)
    application_deadline = Column(DateTime, nullable=True)
    max_applications = Column(Integer, nullable=True)
    view_count = Column(Integer, default=0)
    application_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    closed_at = Column(DateTime, nullable=True)

    employer = relationship("EmployerProfile", back_populates="jobs")
    applications = relationship("JobApplication", back_populates="job", cascade="all, delete-orphan")
    flags = relationship("JobFlag", back_populates="job", cascade="all, delete-orphan")


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String, ForeignKey("jobs.id"), nullable=False)
    applicant_id = Column(String, ForeignKey("users.id"), nullable=False)
    cover_note = Column(Text, nullable=True)
    video_intro_url = Column(String, nullable=True)
    video_intro_duration_seconds = Column(Integer, nullable=True)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.SUBMITTED)
    status_updated_at = Column(DateTime, nullable=True)
    employer_notes = Column(Text, nullable=True)
    employer_rating = Column(Integer, nullable=True)
    match_score = Column(Float, nullable=True)
    match_breakdown = Column(JSON, nullable=True)
    interview_scheduled_at = Column(DateTime, nullable=True)
    interview_type = Column(String, nullable=True)
    interview_link = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    job = relationship("Job", back_populates="applications")


class JobFlag(Base):
    __tablename__ = "job_flags"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String, ForeignKey("jobs.id"), nullable=False)
    reporter_id = Column(String, ForeignKey("users.id"), nullable=True)
    reason = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    is_reviewed = Column(Boolean, default=False)
    review_outcome = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    job = relationship("Job", back_populates="flags")