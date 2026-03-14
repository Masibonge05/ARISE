from sqlalchemy import (
    Column, String, Boolean, DateTime, Enum,
    Text, Integer, Float, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from backend.config.database import Base


class BusinessStage(str, enum.Enum):
    IDEA = "idea"
    EARLY = "early"
    GROWTH = "growth"
    SCALING = "scaling"


class BusinessVerificationStatus(str, enum.Enum):
    UNVERIFIED = "unverified"
    PENDING = "pending"
    VERIFIED = "verified"


class FundingStatus(str, enum.Enum):
    NOT_SEEKING = "not_seeking"
    SEEKING_MENTORSHIP = "seeking_mentorship"
    SEEKING_INVESTMENT = "seeking_investment"
    SEEKING_BOTH = "seeking_both"
    FUNDED = "funded"


class BusinessProfile(Base):
    """
    Zama's business identity layer on TrustID.
    Populated from LaunchPad registration + manual input.
    Visible to verified investors when Zama toggles investor visibility on.
    """
    __tablename__ = "business_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)

    # Business identity
    business_name = Column(String, nullable=False)
    trading_name = Column(String, nullable=True)
    sector = Column(String, nullable=True)
    subsector = Column(String, nullable=True)
    description = Column(Text, nullable=True)           # 3-para investor-ready summary
    stage = Column(Enum(BusinessStage), default=BusinessStage.IDEA)
    founded_date = Column(DateTime, nullable=True)
    province = Column(String, nullable=True)
    city = Column(String, nullable=True)

    # Legal registration — populated by LaunchPad via Huawei OCR
    cipc_number = Column(String, nullable=True)
    cipc_registration_date = Column(DateTime, nullable=True)
    sars_tax_number = Column(String, nullable=True)
    is_vat_registered = Column(Boolean, default=False)
    vat_number = Column(String, nullable=True)
    bbee_level = Column(String, nullable=True)          # B-BBEE level 1-8

    # Verification — from LaunchPad documents
    verification_status = Column(
        Enum(BusinessVerificationStatus),
        default=BusinessVerificationStatus.UNVERIFIED
    )
    cipc_document_url = Column(String, nullable=True)   # Stored in Huawei OBS
    verified_at = Column(DateTime, nullable=True)

    # Financials — shown as range to investors, not exact
    revenue_range = Column(String, nullable=True)       # e.g. "R0-R50K" / "R50K-R500K"
    funding_raised_total = Column(Float, default=0.0)
    employees_count = Column(Integer, default=1)

    # Funding & investment
    funding_status = Column(Enum(FundingStatus), default=FundingStatus.NOT_SEEKING)
    funding_amount_seeking = Column(Float, nullable=True)
    funding_use_of_funds = Column(Text, nullable=True)  # How will funding be used
    equity_offering_percent = Column(Float, nullable=True)

    # Investor visibility — Zama controls this toggle
    is_visible_to_investors = Column(Boolean, default=False)
    investor_pitch_url = Column(String, nullable=True)  # Pitch deck in Huawei OBS

    # Social proof
    website = Column(String, nullable=True)
    social_media = Column(JSON, default=dict)           # {instagram, linkedin, twitter}
    media_coverage_urls = Column(JSON, default=list)    # News/press links

    # Metrics shown on profile
    customers_count = Column(Integer, nullable=True)
    monthly_revenue = Column(Float, nullable=True)
    growth_rate_percent = Column(Float, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="business_profile")
    milestones = relationship("BusinessMilestone", back_populates="business", cascade="all, delete-orphan")
    investor_interests = relationship("InvestorInterest", back_populates="business", cascade="all, delete-orphan")


class BusinessMilestone(Base):
    """
    Key achievements in Zama's business journey.
    Shown on her TrustID profile as a timeline.
    """
    __tablename__ = "business_milestones"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    business_id = Column(String, ForeignKey("business_profiles.id"), nullable=False)

    title = Column(String, nullable=False)          # e.g. "First paying customer"
    description = Column(Text, nullable=True)
    milestone_date = Column(DateTime, nullable=False)
    category = Column(String, nullable=True)        # revenue / product / team / legal / funding
    is_verified = Column(Boolean, default=False)    # Verified by ARISE admin or document
    evidence_url = Column(String, nullable=True)    # Supporting document in Huawei OBS

    created_at = Column(DateTime, server_default=func.now())

    business = relationship("BusinessProfile", back_populates="milestones")