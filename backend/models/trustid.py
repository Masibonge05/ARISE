from sqlalchemy import Column, String, Boolean, DateTime, Float, Integer, ForeignKey, JSON, Text, Enum
from sqlalchemy.sql import func
import uuid
import enum
from backend.config.database import Base

class VerificationRequest(Base):
    """Tracks all verification requests sent by ARISE to third parties"""
    __tablename__ = "verification_requests"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    verification_type = Column(String, nullable=False)  # institution / employer / cipc / reference
    target_entity = Column(String, nullable=False)      # Institution/company name
    contact_email = Column(String, nullable=True)
    token = Column(String, nullable=True)
    status = Column(String, default="sent")             # sent / confirmed / expired / failed
    sent_at = Column(DateTime, server_default=func.now())
    responded_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    reference_id = Column(String, nullable=True)        # ID of the qual/work exp being verified

class TrustBadge(Base):
    """Badges earned by users for verification milestones"""
    __tablename__ = "trust_badges"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    badge_type = Column(String, nullable=False)
    badge_label = Column(String, nullable=False)
    badge_color = Column(String, default="#4ECDC4")
    badge_icon = Column(String, nullable=True)
    awarded_at = Column(DateTime, server_default=func.now())
    is_active = Column(Boolean, default=True)