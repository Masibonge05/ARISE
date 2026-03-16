from sqlalchemy import (
    Boolean,
    Column, String, DateTime, Integer, Float, ForeignKey, JSON, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from backend.config.database import Base


class ECSHistory(Base):
    """
    Full history of ECS score changes for a user.
    Every event that changes the score is recorded here.
    Used to render the score progression chart on the ECS dashboard.
    """
    __tablename__ = "ecs_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Score snapshot
    score_before = Column(Integer, nullable=False)
    score_after = Column(Integer, nullable=False)
    points_delta = Column(Integer, nullable=False)      # Positive or negative change

    # What caused the change
    event_type = Column(String, nullable=False)
    # event_type options:
    # identity_verified / email_verified / qualification_added /
    # skill_assessed / work_verified / session_completed /
    # grant_accessed / grant_complied / freelance_project_completed /
    # revenue_reported / community_review / business_registered /
    # milestone_achieved / penalty_report

    event_description = Column(String, nullable=True)  # Human-readable description
    event_reference_id = Column(String, nullable=True) # ID of the related object

    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="ecs_history")


class ECSFactorSnapshot(Base):
    """
    Periodic snapshot of the 5 ECS factor scores.
    Stored weekly so we can show factor trends over time.
    """
    __tablename__ = "ecs_factor_snapshots"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Total score at snapshot time
    total_score = Column(Integer, nullable=False)

    # The 5 factors — each max score shown in comment
    formalization_score = Column(Integer, default=0)    # Max 200 — business registration, docs
    mentorship_score = Column(Integer, default=0)       # Max 150 — sessions completed
    grant_compliance_score = Column(Integer, default=0) # Max 150 — grants accessed + used correctly
    revenue_score = Column(Integer, default=0)          # Max 200 — income tracked on platform
    community_score = Column(Integer, default=0)        # Max 150 — reviews, ratings, referrals

    # Breakdown detail
    factor_details = Column(JSON, default=dict)         # Per-factor breakdown with sub-items

    snapped_at = Column(DateTime, server_default=func.now())


class MicroLender(Base):
    """
    Partnered micro-lenders that accept ECS score as creditworthiness indicator.
    Shown to users who hit the ECS threshold for that lender.
    """
    __tablename__ = "micro_lenders"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    logo_url = Column(String, nullable=True)
    website = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)

    # Eligibility
    min_ecs_score = Column(Integer, nullable=False)     # Minimum ECS to be shown this lender
    min_loan_amount = Column(Float, nullable=True)
    max_loan_amount = Column(Float, nullable=True)
    interest_rate_min = Column(Float, nullable=True)
    interest_rate_max = Column(Float, nullable=True)
    repayment_period_months = Column(Integer, nullable=True)

    # Target personas
    target_personas = Column(JSON, default=list)        # job_seeker / freelancer / entrepreneur
    focus_sectors = Column(JSON, default=list)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())