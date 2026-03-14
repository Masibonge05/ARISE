from sqlalchemy import (
    Column, String, Boolean, DateTime, Enum, Text,
    Integer, Float, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import uuid
import enum

from backend.config.database import Base


# ─── Enums ─────────────────────────────────────────────────────────────────────

class PersonaType(str, enum.Enum):
    """
    The three core user types on ARISE.
    A user can have multiple personas (e.g. Sphiwe can be
    both JOB_SEEKER and FREELANCER at the same time).
    """
    JOB_SEEKER = "job_seeker"         # Sphiwe - looking for employment
    FREELANCER = "freelancer"          # Sipho - offering services
    ENTREPRENEUR = "entrepreneur"      # Zama - building a business
    EMPLOYER = "employer"              # Companies posting jobs
    INVESTOR = "investor"              # People funding businesses
    MENTOR = "mentor"                  # Experienced professionals guiding others
    GOVERNMENT = "government"          # DSBD/SEDA officials (GovLink access)


class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    VERIFIED = "verified"
    FAILED = "failed"
    EXPIRED = "expired"


class SkillLevel(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class SkillVerificationSource(str, enum.Enum):
    SELF_CLAIMED = "self_claimed"           # Unverified - just claimed
    PLATFORM_ASSESSED = "platform_assessed" # Passed ARISE skills test
    EDUCATION_VERIFIED = "education_verified" # From verified qualification
    WORK_VERIFIED = "work_verified"         # From verified work experience
    ACCREDITED = "accredited"               # From completed course with certificate


# ─── User Model ────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    # ── Identity ──────────────────────────────────────────
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    phone = Column(String, nullable=True)

    # ── Personal Info ─────────────────────────────────────
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    id_number = Column(String, nullable=True)          # SA ID number (encrypted)
    date_of_birth = Column(DateTime, nullable=True)    # Auto-extracted from ID via OCR
    gender = Column(String, nullable=True)
    nationality = Column(String, default="South African")
    province = Column(String, nullable=True)
    city = Column(String, nullable=True)
    preferred_language = Column(String, default="English")

    # ── Persona ───────────────────────────────────────────
    # Primary persona - determines dashboard layout
    primary_persona = Column(Enum(PersonaType), nullable=False)
    # Secondary personas - a user can be both job seeker + freelancer
    secondary_personas = Column(JSON, default=list)

    # ── Account Status ────────────────────────────────────
    is_active = Column(Boolean, default=True)
    is_email_verified = Column(Boolean, default=False)
    is_identity_verified = Column(Boolean, default=False)
    email_verification_token = Column(String, nullable=True)
    password_reset_token = Column(String, nullable=True)
    password_reset_expires = Column(DateTime, nullable=True)

    # ── TrustID Verification ──────────────────────────────
    identity_verification_status = Column(
        Enum(VerificationStatus),
        default=VerificationStatus.PENDING
    )
    # 0-100 — percentage of profile that is verified
    trust_completion_score = Column(Float, default=0.0)

    # ── Profile ───────────────────────────────────────────
    profile_photo_url = Column(String, nullable=True)   # Stored in Huawei OBS
    bio = Column(Text, nullable=True)
    linkedin_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)

    # ── ECS Score ─────────────────────────────────────────
    ecs_score = Column(Integer, default=0)              # 0-850
    ecs_last_updated = Column(DateTime, nullable=True)

    # ── Availability (for freelancers) ────────────────────
    is_available = Column(Boolean, default=True)
    available_from = Column(DateTime, nullable=True)

    # ── Privacy & Safety ──────────────────────────────────
    # Zama can toggle investor visibility on/off
    is_visible_to_investors = Column(Boolean, default=False)
    is_visible_to_employers = Column(Boolean, default=True)
    # Flag if user has been reported
    report_count = Column(Integer, default=0)
    is_suspended = Column(Boolean, default=False)
    suspension_reason = Column(Text, nullable=True)

    # ── Timestamps ────────────────────────────────────────
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    last_login = Column(DateTime, nullable=True)

    # ── Relationships ─────────────────────────────────────
    qualifications = relationship("Qualification", back_populates="user", cascade="all, delete-orphan")
    skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    work_experiences = relationship("WorkExperience", back_populates="user", cascade="all, delete-orphan")
    portfolio_items = relationship("PortfolioItem", back_populates="user", cascade="all, delete-orphan")
    ecs_history = relationship("ECSHistory", back_populates="user", cascade="all, delete-orphan")
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    received_messages = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    business_profile = relationship("BusinessProfile", back_populates="owner", uselist=False)
    freelancer_profile = relationship("FreelancerProfile", back_populates="user", uselist=False)
    job_seeker_profile = relationship("JobSeekerProfile", back_populates="user", uselist=False)

    def __repr__(self):
        return f"<User {self.email} | {self.primary_persona}>"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def age(self):
        if self.date_of_birth:
            today = datetime.today()
            return today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        return None


# ─── TrustID Sub-Models ────────────────────────────────────────────────────────

class Qualification(Base):
    """Academic qualifications — degrees, diplomas, certificates"""
    __tablename__ = "qualifications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    institution_name = Column(String, nullable=False)
    qualification_title = Column(String, nullable=False)
    field_of_study = Column(String, nullable=True)
    year_completed = Column(Integer, nullable=True)
    is_current = Column(Boolean, default=False)   # Currently studying

    # Verification
    verification_status = Column(Enum(VerificationStatus), default=VerificationStatus.PENDING)
    document_url = Column(String, nullable=True)  # Certificate uploaded to Huawei OBS
    # OCR extracted data from Huawei OCR
    ocr_extracted_data = Column(JSON, nullable=True)
    # SAQA institution check result
    institution_is_registered = Column(Boolean, nullable=True)
    verified_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="qualifications")


class WorkExperience(Base):
    """Work history — jobs, internships, volunteer work"""
    __tablename__ = "work_experiences"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    company_name = Column(String, nullable=False)
    job_title = Column(String, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)     # None = current job
    is_current = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    reference_email = Column(String, nullable=True) # Contact for verification

    # Verification — ARISE emails the reference contact
    verification_status = Column(Enum(VerificationStatus), default=VerificationStatus.PENDING)
    verification_token = Column(String, nullable=True)  # Token in verification email
    verified_by_name = Column(String, nullable=True)
    verified_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="work_experiences")


class UserSkill(Base):
    """Skills — verified through multiple pathways"""
    __tablename__ = "user_skills"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    skill_name = Column(String, nullable=False)
    category = Column(String, nullable=True)  # Technical / Soft / Language / Tool
    level = Column(Enum(SkillLevel), default=SkillLevel.INTERMEDIATE)
    years_experience = Column(Float, nullable=True)

    # Verification source — determines badge shown on profile
    verification_source = Column(
        Enum(SkillVerificationSource),
        default=SkillVerificationSource.SELF_CLAIMED
    )
    # Assessment score if verified via platform
    assessment_score = Column(Float, nullable=True)   # 0-100
    assessment_passed = Column(Boolean, nullable=True)
    assessed_at = Column(DateTime, nullable=True)

    # For language skills — verified via Huawei SIS voice assessment
    is_language = Column(Boolean, default=False)
    language_proficiency = Column(String, nullable=True)  # A1/A2/B1/B2/C1/C2

    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="skills")


class PortfolioItem(Base):
    """Work samples for freelancers and entrepreneurs"""
    __tablename__ = "portfolio_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)   # Design / Dev / Writing etc.
    client_name = Column(String, nullable=True)
    project_date = Column(DateTime, nullable=True)

    # Files stored in Huawei OBS
    file_urls = Column(JSON, default=list)     # Images, PDFs, videos
    thumbnail_url = Column(String, nullable=True)
    external_link = Column(String, nullable=True)

    # Verification — client can confirm this work was done
    is_client_verified = Column(Boolean, default=False)
    client_review = Column(Text, nullable=True)
    client_rating = Column(Float, nullable=True)  # 1-5

    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="portfolio_items")


# ─── Persona-Specific Profile Extensions ──────────────────────────────────────

class JobSeekerProfile(Base):
    """Extra fields for Sphiwe — job seekers"""
    __tablename__ = "job_seeker_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)

    desired_job_title = Column(String, nullable=True)
    desired_sector = Column(String, nullable=True)
    desired_salary_min = Column(Integer, nullable=True)
    desired_salary_max = Column(Integer, nullable=True)
    work_style_preference = Column(String, nullable=True)  # remote/hybrid/onsite
    open_to_relocation = Column(Boolean, default=False)
    employment_type = Column(String, nullable=True)  # full-time/part-time/contract
    # Sectors to avoid
    excluded_sectors = Column(JSON, default=list)

    user = relationship("User", back_populates="job_seeker_profile")


class FreelancerProfile(Base):
    """Extra fields for Sipho — freelancers"""
    __tablename__ = "freelancer_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)

    hourly_rate = Column(Float, nullable=True)
    project_minimum = Column(Float, nullable=True)
    currency = Column(String, default="ZAR")
    typical_turnaround_days = Column(Integer, nullable=True)
    service_categories = Column(JSON, default=list)
    # Aggregate rating from completed projects
    average_rating = Column(Float, default=0.0)
    total_projects_completed = Column(Integer, default=0)
    total_earnings = Column(Float, default=0.0)
    # Top Verified Freelancer badge — unlocked at 5 projects + 4+ star avg
    is_top_freelancer = Column(Boolean, default=False)

    user = relationship("User", back_populates="freelancer_profile")


# ─── Notifications ─────────────────────────────────────────────────────────────

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    type = Column(String, nullable=False)   # verification_update / new_match / ecs_change etc.
    title = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    action_url = Column(String, nullable=True)  # Frontend route to navigate to
    extra_data = Column(JSON, default=dict)

    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="notifications")