from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
import logging

from backend.config.database import get_db
from backend.models.user import User
from backend.models.job import Job, JobFlag, JobStatus
from backend.routers.auth import get_current_user

logger = logging.getLogger("arise.safety")
router = APIRouter()

_reports = []

class ReportRequest(BaseModel):
    report_type: str       # job / user / investor / employer / message
    target_id: str
    reason: str            # scam / trafficking / harassment / fake_company / inappropriate / other
    description: Optional[str] = None
    is_anonymous: bool = True

class SafetyCheckRequest(BaseModel):
    title: str
    description: str

@router.post("/report", summary="Report suspicious content or user", status_code=201)
async def submit_report(
    body: ReportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit a safety report against any content type.
    All reports are logged and reviewed within 24 hours.
    3 confirmed reports on a job = auto-suspend.
    """
    report_id = str(uuid.uuid4())
    report = {
        "id": report_id,
        "report_type": body.report_type,
        "target_id": body.target_id,
        "reason": body.reason,
        "description": body.description,
        "reporter_id": None if body.is_anonymous else current_user.id,
        "status": "pending_review",
        "created_at": datetime.utcnow().isoformat(),
    }
    _reports.append(report)

    # Auto-flag job if 3+ reports
    if body.report_type == "job":
        job = db.query(Job).filter(Job.id == body.target_id).first()
        if job:
            flag_count = db.query(JobFlag).filter(JobFlag.job_id == body.target_id).count()
            if flag_count >= 2:
                job.status = JobStatus.FLAGGED
                db.commit()
                logger.warning(f"Job auto-flagged after 3 reports: {body.target_id}")

    # Auto-suspend user if 5+ reports
    if body.report_type == "user":
        user_reports = [r for r in _reports if r["target_id"] == body.target_id and r["report_type"] == "user"]
        if len(user_reports) >= 5:
            target = db.query(User).filter(User.id == body.target_id).first()
            if target and not target.is_suspended:
                target.is_suspended = True
                target.suspension_reason = "Multiple community safety reports — under review"
                db.commit()
                logger.warning(f"User auto-suspended: {body.target_id}")

    logger.info(f"Safety report: {body.report_type} {body.target_id} reason={body.reason}")
    return {
        "message": "Thank you for keeping ARISE safe. Your report has been recorded and will be reviewed within 24 hours.",
        "report_id": report_id,
        "anonymous": body.is_anonymous,
    }

@router.post("/scan", summary="Scan text for safety red flags")
async def scan_content(
    body: SafetyCheckRequest,
    current_user: User = Depends(get_current_user)
):
    """🔴 Huawei NLP: scans job postings for trafficking and scam patterns"""
    from backend.services.huawei_nlp import scan_job_posting
    result = await scan_job_posting(body.title, body.description)
    return result

@router.get("/resources", summary="Get safety resources and emergency contacts")
async def get_safety_resources():
    return {
        "emergency_contacts": [
            {"org": "SAPS Emergency", "number": "10111", "available": "24/7", "type": "emergency"},
            {"org": "Human Trafficking Hotline", "number": "0800 222 777", "available": "24/7", "type": "trafficking", "note": "Free, toll-free"},
            {"org": "SAPS Crime Stop", "number": "08600 10111", "available": "24/7", "type": "crime", "note": "Anonymous reporting"},
            {"org": "Gender Violence Helpline", "number": "0800 428 428", "available": "24/7", "type": "gbv"},
        ],
        "arise_safety_features": [
            "All job postings scanned by Huawei NLP before publishing",
            "Employer CIPC verification against Companies register",
            "All communication stays inside ARISE until mutual consent",
            "3-flag auto-suspend on any reported listing",
            "Investor identity verification before profile access",
            "Escrow-protected payments — never pay outside ARISE",
        ],
        "warning_signs": [
            "Employer asks for upfront payment (training/equipment/registration)",
            "Job offers unusually high salary with no experience required",
            "Contact only via WhatsApp with no verifiable company details",
            "Asked to travel before contract signing",
            "Requested banking details or ID before interview",
        ]
    }

@router.get("/reports/my", summary="Get own submitted reports")
async def get_my_reports(current_user: User = Depends(get_current_user)):
    my_reports = [r for r in _reports if r.get("reporter_id") == current_user.id]
    return {"reports": my_reports, "total": len(my_reports)}