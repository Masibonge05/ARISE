from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import logging

from backend.config.database import get_db
from backend.models.user import User
from backend.models.investor import InvestorProfile, InvestorInterest, InterestStatus, InvestorVerificationStatus
from backend.models.business import BusinessProfile, FundingStatus
from backend.routers.auth import get_current_user

logger = logging.getLogger("arise.investors")
router = APIRouter()


class CreateInvestorProfileRequest(BaseModel):
    investor_type: str
    organization_name: Optional[str] = None
    bio: Optional[str] = None
    website: Optional[str] = None
    focus_sectors: List[str] = []
    focus_stages: List[str] = []
    ticket_size_min: Optional[float] = None
    ticket_size_max: Optional[float] = None
    investment_instrument: List[str] = []
    portfolio_companies: List[str] = []
    terms_agreed: bool = False


class ExpressInterestRequest(BaseModel):
    business_id: str
    investor_message: Optional[str] = None
    investment_amount_proposed: Optional[float] = None
    investment_instrument: Optional[str] = None


class RespondToInterestRequest(BaseModel):
    accept: bool
    entrepreneur_response: Optional[str] = None


# ─── Entrepreneur Discovery (Investor side) ────────────────────────────────────

@router.get("/discover", summary="Browse entrepreneur profiles (investors only)")
async def discover_entrepreneurs(
    sector: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
    province: Optional[str] = Query(None),
    min_ecs_score: Optional[int] = Query(None),
    funding_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Investor discovery portal — search verified entrepreneur profiles.
    Only accessible to verified investors who have agreed to anti-exploitation terms.
    🔴 Huawei GES: knowledge graph matching
    """
    investor = db.query(InvestorProfile).filter(
        InvestorProfile.user_id == current_user.id
    ).first()

    if not investor:
        raise HTTPException(status_code=403, detail="You need an investor profile to access this.")
    if not investor.terms_agreed:
        raise HTTPException(status_code=403, detail="Please agree to ARISE anti-exploitation terms first.")
    if investor.verification_status != InvestorVerificationStatus.VERIFIED:
        raise HTTPException(status_code=403, detail="Your investor profile is pending verification.")

    query = db.query(BusinessProfile).filter(
        BusinessProfile.is_visible_to_investors == True,
        BusinessProfile.funding_status.in_([
            FundingStatus.SEEKING_INVESTMENT,
            FundingStatus.SEEKING_BOTH
        ])
    )

    if sector:
        query = query.filter(BusinessProfile.sector == sector)
    if stage:
        query = query.filter(BusinessProfile.stage == stage)
    if province:
        query = query.filter(BusinessProfile.province == province)

    businesses = query.offset((page - 1) * limit).limit(limit).all()
    result = []

    for b in businesses:
        owner = db.query(User).filter(User.id == b.owner_id).first()
        if not owner:
            continue
        if min_ecs_score and owner.ecs_score < min_ecs_score:
            continue

        existing_interest = db.query(InvestorInterest).filter(
            InvestorInterest.investor_id == investor.id,
            InvestorInterest.business_id == b.id
        ).first()

        result.append({
            "business_id": b.id,
            "business_name": b.business_name,
            "sector": b.sector,
            "stage": b.stage,
            "province": b.province,
            "city": b.city,
            "description": b.description,
            "revenue_range": b.revenue_range,
            "employees_count": b.employees_count,
            "funding_amount_seeking": b.funding_amount_seeking,
            "equity_offering_percent": b.equity_offering_percent,
            "verification_status": b.verification_status,
            "entrepreneur_ecs_score": owner.ecs_score,
            "entrepreneur_name": owner.full_name,
            "milestones_count": len(b.milestones),
            "already_expressed_interest": existing_interest is not None,
            "interest_status": existing_interest.status if existing_interest else None,
        })

    return {"businesses": result, "total": len(result), "page": page}


@router.get("/business/{business_id}", summary="View entrepreneur business profile in detail")
async def get_business_profile(
    business_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    investor = db.query(InvestorProfile).filter(InvestorProfile.user_id == current_user.id).first()
    if not investor or not investor.terms_agreed or investor.verification_status != InvestorVerificationStatus.VERIFIED:
        raise HTTPException(status_code=403, detail="Investor verification required.")

    business = db.query(BusinessProfile).filter(
        BusinessProfile.id == business_id,
        BusinessProfile.is_visible_to_investors == True
    ).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business profile not found or not visible to investors.")

    owner = db.query(User).filter(User.id == business.owner_id).first()

    return {
        "business_id": business.id,
        "business_name": business.business_name,
        "sector": business.sector,
        "stage": business.stage,
        "description": business.description,
        "revenue_range": business.revenue_range,
        "employees_count": business.employees_count,
        "founded_date": business.founded_date,
        "province": business.province,
        "website": business.website,
        "cipc_number": business.cipc_number,
        "verification_status": business.verification_status,
        "funding_amount_seeking": business.funding_amount_seeking,
        "funding_use_of_funds": business.funding_use_of_funds,
        "equity_offering_percent": business.equity_offering_percent,
        "milestones": [
            {"title": m.title, "date": m.milestone_date, "category": m.category, "is_verified": m.is_verified}
            for m in business.milestones
        ],
        "entrepreneur": {
            "name": owner.full_name if owner else "Unknown",
            "ecs_score": owner.ecs_score if owner else 0,
            "province": owner.province if owner else None,
        },
    }


# ─── Interest Flow (Zama's control) ────────────────────────────────────────────

@router.post("/interest", summary="Express interest in an entrepreneur", status_code=201)
async def express_interest(
    body: ExpressInterestRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Investor expresses interest in Zama's business.
    Zama gets notified — she accepts or declines. No contact shared yet.
    """
    investor = db.query(InvestorProfile).filter(InvestorProfile.user_id == current_user.id).first()
    if not investor or investor.verification_status != InvestorVerificationStatus.VERIFIED:
        raise HTTPException(status_code=403, detail="Verified investor profile required.")

    business = db.query(BusinessProfile).filter(BusinessProfile.id == body.business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found.")

    existing = db.query(InvestorInterest).filter(
        InvestorInterest.investor_id == investor.id,
        InvestorInterest.business_id == body.business_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="You have already expressed interest in this business.")

    interest = InvestorInterest(
        investor_id=investor.id,
        business_id=body.business_id,
        entrepreneur_id=business.owner_id,
        investor_message=body.investor_message,
        investment_amount_proposed=body.investment_amount_proposed,
        investment_instrument=body.investment_instrument,
        status=InterestStatus.EXPRESSED,
    )
    db.add(interest)
    db.commit()

    return {
        "message": "Interest expressed. The entrepreneur will be notified and can review your verified profile before deciding to connect.",
        "interest_id": interest.id,
        "note": "Contact details will only be shared after mutual consent.",
    }


@router.get("/my-interests", summary="Entrepreneur sees investor interest notifications")
async def get_my_investor_interests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Zama sees who has expressed interest in her business"""
    business = db.query(BusinessProfile).filter(BusinessProfile.owner_id == current_user.id).first()
    if not business:
        return {"interests": [], "total": 0}

    interests = db.query(InvestorInterest).filter(
        InvestorInterest.business_id == business.id
    ).all()

    result = []
    for i in interests:
        investor = db.query(InvestorProfile).filter(InvestorProfile.id == i.investor_id).first()
        investor_user = db.query(User).filter(User.id == investor.user_id).first() if investor else None
        result.append({
            "interest_id": i.id,
            "status": i.status,
            "investment_amount_proposed": i.investment_amount_proposed,
            "investment_instrument": i.investment_instrument,
            "investor_message": i.investor_message,
            "created_at": i.created_at,
            "investor": {
                "name": investor_user.full_name if investor_user else "Anonymous",
                "investor_type": investor.investor_type if investor else None,
                "organization": investor.organization_name if investor else None,
                "focus_sectors": investor.focus_sectors if investor else [],
                "portfolio_companies": investor.portfolio_companies if investor else [],
                "verification_status": investor.verification_status if investor else None,
            } if i.status != InterestStatus.EXPRESSED else {"name": "Verified Investor", "note": "Accept to see full profile"},
        })

    return {"interests": result, "total": len(result),
            "pending_response": len([i for i in result if i["status"] == InterestStatus.EXPRESSED])}


@router.post("/interest/{interest_id}/respond", summary="Entrepreneur responds to investor interest")
async def respond_to_interest(
    interest_id: str,
    body: RespondToInterestRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Zama accepts or declines an investor's interest.
    Only after acceptance are contact details shared.
    """
    interest = db.query(InvestorInterest).filter(
        InvestorInterest.id == interest_id,
        InvestorInterest.entrepreneur_id == current_user.id
    ).first()

    if not interest:
        raise HTTPException(status_code=404, detail="Interest not found.")

    interest.entrepreneur_response = body.entrepreneur_response
    interest.responded_at = datetime.utcnow()

    if body.accept:
        interest.status = InterestStatus.ACCEPTED
        interest.contact_shared_at = datetime.utcnow()
        message = "Connection accepted. Contact details have been shared with the investor. You can now communicate directly."
    else:
        interest.status = InterestStatus.DECLINED
        message = "Interest declined. The investor has been notified."

    db.commit()
    return {"message": message, "status": interest.status}


# ─── Investor Profile Management ───────────────────────────────────────────────

@router.post("/profile/create", summary="Create investor profile", status_code=201)
async def create_investor_profile(
    body: CreateInvestorProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(InvestorProfile).filter(InvestorProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Investor profile already exists.")

    if not body.terms_agreed:
        raise HTTPException(status_code=400, detail="You must agree to ARISE anti-exploitation terms.")

    investor = InvestorProfile(
        user_id=current_user.id,
        investor_type=body.investor_type,
        organization_name=body.organization_name,
        bio=body.bio,
        website=body.website,
        focus_sectors=body.focus_sectors,
        focus_stages=body.focus_stages,
        ticket_size_min=body.ticket_size_min,
        ticket_size_max=body.ticket_size_max,
        investment_instrument=body.investment_instrument,
        portfolio_companies=body.portfolio_companies,
        terms_agreed=body.terms_agreed,
        terms_agreed_at=datetime.utcnow(),
        verification_status=InvestorVerificationStatus.PENDING,
    )
    db.add(investor)
    db.commit()
    return {"message": "Investor profile created. Pending identity verification.", "investor_id": investor.id}