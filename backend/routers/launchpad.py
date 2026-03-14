from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
import logging

from backend.config.database import get_db
from backend.models.user import User
from backend.models.business import BusinessProfile, BusinessStage, BusinessVerificationStatus
from backend.routers.auth import get_current_user

logger = logging.getLogger("arise.launchpad")
router = APIRouter()


# ─── Schemas ───────────────────────────────────────────────────────────────────

class BusinessWizardStep1(BaseModel):
    """Step 1 — What does your business do?"""
    business_name: str
    trading_name: Optional[str] = None
    sector: str
    subsector: Optional[str] = None
    description: str
    province: str
    city: str


class BusinessWizardStep2(BaseModel):
    """Step 2 — Legal structure"""
    business_structure: str     # sole_proprietor / pty_ltd / partnership / npo
    founded_date: Optional[datetime] = None
    has_cipc_registration: bool = False
    cipc_number: Optional[str] = None


class BusinessWizardStep3(BaseModel):
    """Step 3 — Financial basics"""
    revenue_range: Optional[str] = None
    employees_count: int = 1
    is_vat_registered: bool = False
    vat_number: Optional[str] = None


class BusinessWizardComplete(BaseModel):
    """Final step — funding goals"""
    funding_status: str = "not_seeking"
    funding_amount_seeking: Optional[float] = None
    funding_use_of_funds: Optional[str] = None
    equity_offering_percent: Optional[float] = None


# ─── Wizard Steps ──────────────────────────────────────────────────────────────

@router.post("/step/1", summary="LaunchPad Step 1 — Business identity", status_code=201)
async def launchpad_step1(
    body: BusinessWizardStep1,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates or updates the entrepreneur's business profile.
    First step of the LaunchPad registration wizard.
    """
    existing = db.query(BusinessProfile).filter(
        BusinessProfile.owner_id == current_user.id
    ).first()

    if existing:
        existing.business_name = body.business_name
        existing.trading_name = body.trading_name
        existing.sector = body.sector
        existing.subsector = body.subsector
        existing.description = body.description
        existing.province = body.province
        existing.city = body.city
    else:
        profile = BusinessProfile(
            owner_id=current_user.id,
            business_name=body.business_name,
            trading_name=body.trading_name,
            sector=body.sector,
            subsector=body.subsector,
            description=body.description,
            province=body.province,
            city=body.city,
            stage=BusinessStage.IDEA,
        )
        db.add(profile)

    db.commit()
    return {
        "message": "Step 1 complete. Business identity saved.",
        "next_step": "/launchpad/step/2",
        "progress": 25,
    }


@router.post("/step/2", summary="LaunchPad Step 2 — Legal registration")
async def launchpad_step2(
    body: BusinessWizardStep2,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Records legal structure and CIPC registration details.
    If CIPC number provided, triggers verification against Companies register.
    🔴 Huawei OCR: reads uploaded CIPC certificate
    """
    profile = db.query(BusinessProfile).filter(
        BusinessProfile.owner_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=400,
            detail="Please complete Step 1 first."
        )

    profile.founded_date = body.founded_date
    profile.cipc_number = body.cipc_number

    if body.cipc_number:
        # TODO: verify against CIPC API
        profile.verification_status = BusinessVerificationStatus.PENDING
        logger.info(f"CIPC verification queued: {body.cipc_number}")

    db.commit()
    return {
        "message": "Step 2 complete. Legal details saved.",
        "next_step": "/launchpad/step/3",
        "progress": 50,
        "cipc_verification": "pending" if body.cipc_number else "not_provided",
    }


@router.post("/step/3", summary="LaunchPad Step 3 — Financial basics")
async def launchpad_step3(
    body: BusinessWizardStep3,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(BusinessProfile).filter(
        BusinessProfile.owner_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Please complete Step 1 first.")

    profile.revenue_range = body.revenue_range
    profile.employees_count = body.employees_count
    profile.is_vat_registered = body.is_vat_registered
    profile.vat_number = body.vat_number

    # Update business stage based on revenue
    if body.revenue_range and body.revenue_range != "R0-R50K":
        profile.stage = BusinessStage.EARLY

    db.commit()
    return {
        "message": "Step 3 complete. Financial details saved.",
        "next_step": "/launchpad/complete",
        "progress": 75,
    }


@router.post("/complete", summary="LaunchPad final step — Funding goals")
async def launchpad_complete(
    body: BusinessWizardComplete,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Completes the LaunchPad wizard.
    Generates registration documents and adds ECS points.
    🔴 Huawei OBS: stores generated documents
    """
    profile = db.query(BusinessProfile).filter(
        BusinessProfile.owner_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Please complete all steps first.")

    profile.funding_status = body.funding_status
    profile.funding_amount_seeking = body.funding_amount_seeking
    profile.funding_use_of_funds = body.funding_use_of_funds
    profile.equity_offering_percent = body.equity_offering_percent

    # Award ECS points for business registration
    current_user.ecs_score = min(850, current_user.ecs_score + 100)

    db.commit()

    return {
        "message": "🎉 Congratulations! Your business profile is live on ARISE.",
        "progress": 100,
        "ecs_points_awarded": 100,
        "new_ecs_score": current_user.ecs_score,
        "documents_generated": [
            "business_profile_summary.pdf",
            "bbee_affidavit_template.pdf",
            "invoice_template.pdf",
        ],
        "next_steps": [
            "Upload your CIPC certificate to get verified",
            "Run FundMatch to find grants you qualify for",
            "Book your first mentor session",
        ],
    }


@router.post("/upload/cipc", summary="Upload CIPC certificate for OCR verification")
async def upload_cipc_certificate(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Accepts CIPC certificate upload.
    🔴 Huawei OCR: extracts company name, registration number, date
    🔴 Huawei OBS: stores the document securely
    """
    if file.content_type not in ["application/pdf", "image/jpeg", "image/png"]:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, JPG, or PNG files are accepted."
        )

    # TODO: Send to Huawei OCR API and extract:
    # - company_name, cipc_number, registration_date
    # TODO: Store in Huawei OBS with DEW encryption
    # TODO: Cross-reference extracted CIPC number with profile

    mock_ocr_result = {
        "company_name": "Extracted from document",
        "cipc_number": "Extracted from document",
        "registration_date": "Extracted from document",
        "confidence_score": 0.95,
    }

    profile = db.query(BusinessProfile).filter(
        BusinessProfile.owner_id == current_user.id
    ).first()
    if profile:
        profile.verification_status = BusinessVerificationStatus.PENDING
        db.commit()

    return {
        "message": "Certificate uploaded successfully. Verification in progress.",
        "ocr_extracted": mock_ocr_result,
        "verification_status": "pending",
        "estimated_verification_time": "24-48 hours",
    }


@router.get("/status", summary="Get LaunchPad completion status")
async def get_launchpad_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(BusinessProfile).filter(
        BusinessProfile.owner_id == current_user.id
    ).first()

    if not profile:
        return {
            "started": False,
            "progress": 0,
            "current_step": 1,
            "message": "Start your business registration journey",
        }

    progress = 25
    if profile.cipc_number is not None:
        progress = 50
    if profile.revenue_range is not None:
        progress = 75
    if profile.funding_status != "not_seeking":
        progress = 100

    return {
        "started": True,
        "progress": progress,
        "business_name": profile.business_name,
        "verification_status": profile.verification_status,
        "cipc_number": profile.cipc_number,
        "stage": profile.stage,
        "is_visible_to_investors": profile.is_visible_to_investors,
    }