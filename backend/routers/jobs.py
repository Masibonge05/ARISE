from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import logging

from backend.config.database import get_db
from backend.models.user import User
from backend.models.job import (
    Job, JobApplication, JobFlag, EmployerProfile,
    JobStatus, JobType, WorkStyle, ApplicationStatus
)
from backend.routers.auth import get_current_user

logger = logging.getLogger("arise.jobs")
router = APIRouter()


# ─── Schemas ───────────────────────────────────────────────────────────────────

class CreateJobRequest(BaseModel):
    title: str
    description: str
    requirements: Optional[str] = None
    responsibilities: Optional[str] = None
    sector: Optional[str] = None
    job_type: JobType
    work_style: WorkStyle = WorkStyle.ON_SITE
    province: Optional[str] = None
    city: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_is_negotiable: bool = False
    show_salary: bool = True
    required_skills: List[str] = []
    required_experience_years: int = 0
    required_education_level: Optional[str] = None
    preferred_languages: List[str] = []
    application_deadline: Optional[datetime] = None


class ApplyJobRequest(BaseModel):
    cover_note: Optional[str] = None
    video_intro_url: Optional[str] = None


class FlagJobRequest(BaseModel):
    reason: str     # scam / trafficking / harassment / fake_company
    description: Optional[str] = None


# ─── Helper: Calculate Match Score ─────────────────────────────────────────────

def _calculate_match_score(user: User, job: Job) -> dict:
    """
    Rules-based match scoring — ModelArts inference layer plugs in here.
    Returns score 0-100 and per-factor breakdown.
    """
    score = 0
    breakdown = {}

    # Skills match (40 points)
    if job.required_skills:
        user_skill_names = {s.skill_name.lower() for s in user.skills}
        required = {s.lower() for s in job.required_skills}
        matched = user_skill_names & required
        skill_score = int((len(matched) / len(required)) * 40)
        score += skill_score
        breakdown["skills"] = {"score": skill_score, "max": 40, "matched": list(matched)}
    else:
        score += 30
        breakdown["skills"] = {"score": 30, "max": 40, "matched": []}

    # Location match (20 points)
    if job.province and user.province:
        if user.province == job.province:
            score += 20
            breakdown["location"] = {"score": 20, "max": 20}
        else:
            breakdown["location"] = {"score": 0, "max": 20}
    else:
        score += 10
        breakdown["location"] = {"score": 10, "max": 20}

    # Experience match (20 points)
    if hasattr(user, 'work_experiences'):
        exp_years = len(user.work_experiences) * 1.5  # Rough estimate
        if exp_years >= job.required_experience_years:
            score += 20
            breakdown["experience"] = {"score": 20, "max": 20}
        else:
            exp_score = int((exp_years / max(job.required_experience_years, 1)) * 20)
            score += exp_score
            breakdown["experience"] = {"score": exp_score, "max": 20}

    # Job seeker preferences (20 points)
    if hasattr(user, 'job_seeker_profile') and user.job_seeker_profile:
        prefs = user.job_seeker_profile
        pref_score = 0
        if prefs.desired_sector and job.sector and prefs.desired_sector == job.sector:
            pref_score += 10
        if prefs.work_style_preference and job.work_style.value == prefs.work_style_preference:
            pref_score += 10
        score += pref_score
        breakdown["preferences"] = {"score": pref_score, "max": 20}

    return {"total": min(100, score), "breakdown": breakdown}


# ─── Job Routes ────────────────────────────────────────────────────────────────

@router.get("/", summary="Get job feed — ranked by match score")
async def get_job_feed(
    sector: Optional[str] = Query(None),
    province: Optional[str] = Query(None),
    job_type: Optional[str] = Query(None),
    work_style: Optional[str] = Query(None),
    salary_min: Optional[int] = Query(None),
    verified_only: bool = Query(False),
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns personalized job feed ranked by TrustID match score.
    Unverified employer postings are still shown but clearly flagged.
    """
    query = db.query(Job).filter(Job.status == JobStatus.ACTIVE)

    # Filters
    if sector:
        query = query.filter(Job.sector == sector)
    if province:
        query = query.filter(Job.province == province)
    if job_type:
        query = query.filter(Job.job_type == job_type)
    if work_style:
        query = query.filter(Job.work_style == work_style)
    if salary_min:
        query = query.filter(Job.salary_max >= salary_min)
    if verified_only:
        query = query.join(EmployerProfile).filter(
            EmployerProfile.verification_status == "verified"
        )

    jobs = query.order_by(desc(Job.created_at)).offset((page - 1) * limit).limit(limit).all()

    # Calculate match scores and build response
    result = []
    for job in jobs:
        match = _calculate_match_score(current_user, job)
        employer = db.query(EmployerProfile).filter(EmployerProfile.id == job.employer_id).first()

        result.append({
            "id": job.id,
            "title": job.title,
            "sector": job.sector,
            "job_type": job.job_type,
            "work_style": job.work_style,
            "province": job.province,
            "city": job.city,
            "salary_min": job.salary_min if job.show_salary else None,
            "salary_max": job.salary_max if job.show_salary else None,
            "salary_is_negotiable": job.salary_is_negotiable,
            "required_skills": job.required_skills,
            "application_deadline": job.application_deadline,
            "application_count": job.application_count,
            "match_score": match["total"],
            "match_breakdown": match["breakdown"],
            "employer": {
                "id": employer.id if employer else None,
                "company_name": employer.company_name if employer else "Unknown",
                "logo_url": employer.logo_url if employer else None,
                "verification_status": employer.verification_status if employer else "unverified",
                "trust_score": employer.trust_score if employer else 0,
            },
            "created_at": job.created_at,
        })

    # Sort by match score descending
    result.sort(key=lambda x: x["match_score"], reverse=True)

    return {
        "jobs": result,
        "total": query.count(),
        "page": page,
        "limit": limit,
    }


@router.get("/{job_id}", summary="Get job detail")
async def get_job_detail(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    # Increment view count
    job.view_count += 1
    db.commit()

    employer = db.query(EmployerProfile).filter(EmployerProfile.id == job.employer_id).first()
    match = _calculate_match_score(current_user, job)

    # Check if user already applied
    existing_application = db.query(JobApplication).filter(
        JobApplication.job_id == job_id,
        JobApplication.applicant_id == current_user.id
    ).first()

    return {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "requirements": job.requirements,
        "responsibilities": job.responsibilities,
        "sector": job.sector,
        "job_type": job.job_type,
        "work_style": job.work_style,
        "province": job.province,
        "city": job.city,
        "salary_min": job.salary_min if job.show_salary else None,
        "salary_max": job.salary_max if job.show_salary else None,
        "salary_is_negotiable": job.salary_is_negotiable,
        "required_skills": job.required_skills,
        "required_experience_years": job.required_experience_years,
        "required_education_level": job.required_education_level,
        "preferred_languages": job.preferred_languages,
        "application_deadline": job.application_deadline,
        "application_count": job.application_count,
        "view_count": job.view_count,
        "safety_scan_passed": job.safety_scan_passed,
        "match_score": match["total"],
        "match_breakdown": match["breakdown"],
        "already_applied": existing_application is not None,
        "application_status": existing_application.status if existing_application else None,
        "employer": {
            "id": employer.id if employer else None,
            "company_name": employer.company_name if employer else "Unknown",
            "industry": employer.industry if employer else None,
            "company_size": employer.company_size if employer else None,
            "logo_url": employer.logo_url if employer else None,
            "website": employer.website if employer else None,
            "verification_status": employer.verification_status if employer else "unverified",
            "trust_score": employer.trust_score if employer else 0,
            "total_hires": employer.total_hires if employer else 0,
        },
        "created_at": job.created_at,
    }


@router.post("/{job_id}/apply", summary="Apply to a job using TrustID", status_code=201)
async def apply_to_job(
    job_id: str,
    body: ApplyJobRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id, Job.status == JobStatus.ACTIVE).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or no longer active.")

    # Check duplicate application
    existing = db.query(JobApplication).filter(
        JobApplication.job_id == job_id,
        JobApplication.applicant_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="You have already applied to this job.")

    match = _calculate_match_score(current_user, job)

    application = JobApplication(
        job_id=job_id,
        applicant_id=current_user.id,
        cover_note=body.cover_note,
        video_intro_url=body.video_intro_url,
        match_score=match["total"],
        match_breakdown=match["breakdown"],
        status=ApplicationStatus.SUBMITTED,
    )
    db.add(application)
    job.application_count += 1
    db.commit()

    logger.info(f"Application submitted: {current_user.email} → {job.title} (match: {match['total']}%)")
    return {
        "message": "Application submitted successfully. Your TrustID profile has been shared with the employer.",
        "application_id": application.id,
        "match_score": match["total"],
    }


@router.get("/my/applications", summary="Get own application history")
async def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    applications = db.query(JobApplication).filter(
        JobApplication.applicant_id == current_user.id
    ).order_by(desc(JobApplication.created_at)).all()

    result = []
    for app in applications:
        job = db.query(Job).filter(Job.id == app.job_id).first()
        employer = db.query(EmployerProfile).filter(
            EmployerProfile.id == job.employer_id
        ).first() if job else None

        result.append({
            "application_id": app.id,
            "status": app.status,
            "match_score": app.match_score,
            "applied_at": app.created_at,
            "status_updated_at": app.status_updated_at,
            "interview_scheduled_at": app.interview_scheduled_at,
            "job": {
                "id": job.id if job else None,
                "title": job.title if job else "Job removed",
                "sector": job.sector if job else None,
            },
            "employer": {
                "company_name": employer.company_name if employer else "Unknown",
                "logo_url": employer.logo_url if employer else None,
            }
        })

    return {"applications": result, "total": len(result)}


@router.post("/{job_id}/flag", summary="Flag a suspicious job posting", status_code=201)
async def flag_job(
    job_id: str,
    body: FlagJobRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    flag = JobFlag(
        job_id=job_id,
        reporter_id=current_user.id,
        reason=body.reason,
        description=body.description,
    )
    db.add(flag)

    # Auto-suspend after 3 flags
    flag_count = db.query(JobFlag).filter(JobFlag.job_id == job_id).count()
    if flag_count >= 2:  # This will be the 3rd
        job.status = JobStatus.FLAGGED
        logger.warning(f"Job auto-suspended due to 3+ flags: {job.title} ({job_id})")

    db.commit()
    return {"message": "Thank you for keeping ARISE safe. This report has been recorded and will be reviewed."}