from sqlalchemy import Column, String, Boolean, DateTime, Float, Integer, ForeignKey, JSON, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from backend.config.database import Base

class GrantApplicationStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    DISBURSED = "disbursed"

class GrantApplication(Base):
    __tablename__ = "grant_applications"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    grant_program_id = Column(String, nullable=False)
    grant_program_name = Column(String, nullable=False)
    funder_name = Column(String, nullable=False)
    amount_requested = Column(Float, nullable=True)
    eligibility_score = Column(Float, nullable=True)
    status = Column(Enum(GrantApplicationStatus), default=GrantApplicationStatus.DRAFT)
    application_data = Column(JSON, default=dict)
    submitted_at = Column(DateTime, nullable=True)
    decision_at = Column(DateTime, nullable=True)
    amount_awarded = Column(Float, nullable=True)
    compliance_report_submitted = Column(Boolean, default=False)
    ecs_points_awarded = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())