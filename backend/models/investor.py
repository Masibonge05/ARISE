from sqlalchemy import (
    Column, String, Boolean, DateTime, Enum,
    Text, Integer, Float, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from backend.config.database import Base


class InvestorVerificationStatus(str, enum.Enum):
    UNVERIFIED = "unverified"
    PENDING = "pending"
    VERIFIED = "verified"
    SUSPENDED = "suspended"


class InterestStatus(str, enum.Enum):
    EXPRESSED = "expressed"         # Investor expressed interest
    VIEWED_BY_ENTREPRENEUR = "viewed"
    ACCEPTED = "accepted"           # Entrepreneur accepted — contact shared
    DECLINED = "declined"           # Entrepreneur declined
    IN_DISCUSSION = "in_discussion"
    DEAL_CLOSED = "deal_closed"
    WITHDRAWN = "withdrawn"


class InvestorProfile(Base):
    """
    Verified investors looking for fundable entrepreneurs on ARISE.
    Must complete full verification before accessing entrepreneur profiles.
    Anti-exploitation terms enforced at account level.
    """
    __tablename__ = "investor_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)

    # Investor identity
    investor_type = Column(String, nullable=True)   # angel / vc / family_office / corporate / grant
    organization_name = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    website = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)

    # Investment mandate
    focus_sectors = Column(JSON, default=list)      # Sectors they invest in
    focus_stages = Column(JSON, default=list)       # Business stages they fund
    focus_provinces = Column(JSON, default=list)    # Geographic focus
    ticket_size_min = Column(Float, nullable=True)  # Minimum investment (ZAR)
    ticket_size_max = Column(Float, nullable=True)  # Maximum investment (ZAR)
    investment_instrument = Column(JSON, default=list)  # equity / debt / grant / convertible

    # Portfolio — previous investments (shown to entrepreneurs for credibility)
    portfolio_companies = Column(JSON, default=list)    # List of company names/descriptions
    total_investments_made = Column(Integer, default=0)

    # Verification — must complete before accessing entrepreneur data
    verification_status = Column(
        Enum(InvestorVerificationStatus),
        default=InvestorVerificationStatus.UNVERIFIED
    )
    id_verified = Column(Boolean, default=False)
    mandate_verified = Column(Boolean, default=False)
    # Agreed to ARISE anti-exploitation terms
    terms_agreed = Column(Boolean, default=False)
    terms_agreed_at = Column(DateTime, nullable=True)
    verified_at = Column(DateTime, nullable=True)

    # Trust & safety
    trust_score = Column(Float, default=0.0)
    report_count = Column(Integer, default=0)
    is_suspended = Column(Boolean, default=False)
    suspension_reason = Column(Text, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    interests = relationship("InvestorInterest", back_populates="investor", cascade="all, delete-orphan")


class InvestorInterest(Base):
    """
    An investor expressing interest in an entrepreneur's business.
    Zama is always in control — she accepts or declines before any contact is shared.
    Contact details only exchange after mutual acceptance.
    """
    __tablename__ = "investor_interests"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    investor_id = Column(String, ForeignKey("investor_profiles.id"), nullable=False)
    business_id = Column(String, ForeignKey("business_profiles.id"), nullable=False)
    entrepreneur_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Initial interest
    status = Column(Enum(InterestStatus), default=InterestStatus.EXPRESSED)
    investor_message = Column(Text, nullable=True)  # Initial message to entrepreneur
    investment_amount_proposed = Column(Float, nullable=True)
    investment_instrument = Column(String, nullable=True)

    # Entrepreneur response
    entrepreneur_response = Column(Text, nullable=True)
    responded_at = Column(DateTime, nullable=True)

    # Contact exchange — ONLY after mutual acceptance
    contact_shared_at = Column(DateTime, nullable=True)

    # NDA
    nda_required = Column(Boolean, default=False)
    nda_signed_at = Column(DateTime, nullable=True)
    nda_document_url = Column(String, nullable=True)    # Stored in Huawei OBS

    # Deal tracking
    deal_amount = Column(Float, nullable=True)
    deal_closed_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    investor = relationship("InvestorProfile", back_populates="interests")
    business = relationship("BusinessProfile", back_populates="investor_interests")