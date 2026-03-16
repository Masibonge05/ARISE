from sqlalchemy import Column, String, Boolean, DateTime, Float, Integer, ForeignKey, JSON, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from backend.config.database import Base

class ProjectStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    PENDING_CONFIRMATION = "pending_confirmation"
    COMPLETED = "completed"
    DISPUTED = "disputed"
    CANCELLED = "cancelled"

class FreelanceProject(Base):
    __tablename__ = "freelance_projects"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    budget_min = Column(Float, nullable=False)
    budget_max = Column(Float, nullable=False)
    currency = Column(String, default="ZAR")
    deadline_days = Column(Integer, nullable=False)
    required_skills = Column(JSON, default=list)
    province = Column(String, nullable=True)
    is_remote = Column(Boolean, default=True)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.OPEN)
    accepted_freelancer_id = Column(String, ForeignKey("users.id"), nullable=True)
    escrow_amount = Column(Float, nullable=True)
    escrow_held = Column(Boolean, default=False)
    escrow_released = Column(Boolean, default=False)
    proposal_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    client_rating = Column(Integer, nullable=True)
    client_review = Column(Text, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class FreelanceProposal(Base):
    __tablename__ = "freelance_proposals"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("freelance_projects.id"), nullable=False)
    freelancer_id = Column(String, ForeignKey("users.id"), nullable=False)
    cover_message = Column(Text, nullable=False)
    proposed_rate = Column(Float, nullable=False)
    estimated_days = Column(Integer, nullable=False)
    portfolio_item_ids = Column(JSON, default=list)
    status = Column(String, default="pending")  # pending / accepted / rejected / withdrawn
    created_at = Column(DateTime, server_default=func.now())