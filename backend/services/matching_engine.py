"""
ARISE Matching Engine
=====================
Central matching service that combines Huawei ModelArts AI with
rules-based scoring for all ARISE opportunity matching.

Handles:
- Job seeker → Job matching (Sphiwe)
- Freelancer → Project matching (Sipho)
- Entrepreneur → Mentor matching (Zama)
- Business → Investor matching (Zama)
- Grant eligibility matching (FundMatch)
"""

import logging
from typing import List, Optional
from sqlalchemy.orm import Session

from backend.models.user import User, UserSkill, SkillVerificationSource
from backend.services.huawei_modelarts import score_job_match, score_grant_eligibility
from backend.services.huawei_ges import find_matching_mentors, find_matching_investors

logger = logging.getLogger("arise.matching")


# ─── User Profile Builder ──────────────────────────────────────────────────────

def build_user_match_profile(user: User, db: Session) -> dict:
    """
    Builds a normalised profile dict for matching algorithms.
    Extracts all relevant features from user + related models.
    """
    from backend.models.business import BusinessProfile
    from backend.models.user import JobSeekerProfile, FreelancerProfile

    # Skills list — verified skills weighted higher
    all_skills = user.skills or []
    verified_skills = [
        s.skill_name for s in all_skills
        if s.verification_source != SkillVerificationSource.SELF_CLAIMED
    ]
    all_skill_names = [s.skill_name for s in all_skills]

    # Experience years estimate
    experience_years = len(user.work_experiences or []) * 1.5

    # Salary preferences
    job_seeker = db.query(JobSeekerProfile).filter(
        JobSeekerProfile.user_id == user.id
    ).first()

    # Business profile
    business = db.query(BusinessProfile).filter(
        BusinessProfile.owner_id == user.id
    ).first()

    return {
        "user_id": user.id,
        "age": user.age,
        "gender": user.gender,
        "province": user.province,
        "city": user.city,
        "is_identity_verified": user.is_identity_verified,
        "ecs_score": user.ecs_score,
        "trust_score": user.trust_completion_score,
        "skills": all_skill_names,
        "verified_skills": verified_skills,
        "experience_years": experience_years,
        "preferred_language": user.preferred_language,
        # Job seeker prefs
        "desired_sector": job_seeker.desired_sector if job_seeker else None,
        "work_style": job_seeker.work_style_preference if job_seeker else None,
        "salary_min": job_seeker.desired_salary_min if job_seeker else None,
        "salary_max": job_seeker.desired_salary_max if job_seeker else None,
        # Business info
        "sector": business.sector if business else None,
        "business_stage": business.stage.value if business else None,
        "cipc_number": business.cipc_number if business else None,
        "funding_amount_seeking": business.funding_amount_seeking if business else None,
    }


# ─── Job Matching ──────────────────────────────────────────────────────────────

async def rank_jobs_for_user(
    user: User,
    jobs: list,
    db: Session,
) -> List[dict]:
    """
    Scores and ranks a list of jobs for a specific user.
    Called by the job feed to personalise ranking.
    """
    user_profile = build_user_match_profile(user, db)
    scored_jobs = []

    for job in jobs:
        job_dict = {
            "id": job.id,
            "title": job.title,
            "required_skills": job.required_skills or [],
            "province": job.province,
            "required_experience_years": job.required_experience_years or 0,
            "salary_min": job.salary_min,
            "salary_max": job.salary_max,
            "work_style": job.work_style.value if job.work_style else None,
            "sector": job.sector,
        }

        match_result = await score_job_match(user_profile, job_dict)

        scored_jobs.append({
            "job": job,
            "match_score": match_result["total"],
            "match_breakdown": match_result["breakdown"],
            "match_model": match_result["model"],
        })

    # Sort by match score descending
    scored_jobs.sort(key=lambda x: x["match_score"], reverse=True)
    return scored_jobs


# ─── Freelance Project Matching ────────────────────────────────────────────────

def score_project_match(user: User, project: dict) -> dict:
    """
    Scores a freelance project against a user's verified skills.
    Simpler than job matching — primarily skills-based.
    """
    user_skills = {s.skill_name.lower() for s in (user.skills or [])}
    verified_skills = {
        s.skill_name.lower() for s in (user.skills or [])
        if s.verification_source != SkillVerificationSource.SELF_CLAIMED
    }

    required = {s.lower() for s in project.get("required_skills", [])}

    if not required:
        return {"total": 70, "breakdown": {"skills": {"score": 70, "matched": []}}}

    matched = user_skills & required
    verified_matched = verified_skills & required

    # Verified skill matches score higher
    base_score = int((len(matched) / len(required)) * 70)
    verified_bonus = int((len(verified_matched) / max(len(required), 1)) * 30)

    return {
        "total": min(100, base_score + verified_bonus),
        "breakdown": {
            "skills": {
                "score": base_score,
                "matched": list(matched),
                "verified_matched": list(verified_matched),
            },
            "verified_bonus": {"score": verified_bonus},
        }
    }


# ─── Mentor Matching ───────────────────────────────────────────────────────────

async def rank_mentors_for_entrepreneur(
    user: User,
    mentors: list,
    db: Session,
) -> List[dict]:
    """
    Scores mentors for an entrepreneur using GES knowledge graph.
    Falls back to attribute-based scoring.
    """
    from backend.models.business import BusinessProfile
    business = db.query(BusinessProfile).filter(BusinessProfile.owner_id == user.id).first()

    sector = business.sector if business else None
    stage = business.stage.value if business else None

    # Try GES graph matching
    ges_results = await find_matching_mentors(
        entrepreneur_id=user.id,
        sector=sector,
        stage=stage,
        limit=50,
    )

    ges_scores = {r["mentor_id"]: r["match_score"] for r in ges_results if r.get("mentor_id")}

    scored_mentors = []
    for mentor in mentors:
        # Use GES score if available
        if mentor.id in ges_scores:
            match_score = ges_scores[mentor.id]
            match_source = "huawei_ges"
        else:
            # Attribute-based fallback
            match_score = 60  # Base score
            match_source = "attribute"

            if sector and sector in (mentor.preferred_sectors or []):
                match_score += 20
            if stage and stage in (mentor.preferred_stages or []):
                match_score += 15
            if mentor.is_bbee_linked:
                match_score += 5  # Priority for free sessions

        scored_mentors.append({
            "mentor": mentor,
            "match_score": min(100, match_score),
            "match_source": match_source,
        })

    scored_mentors.sort(key=lambda x: (x["match_score"], x["mentor"].average_rating or 0), reverse=True)
    return scored_mentors


# ─── Grant Matching ────────────────────────────────────────────────────────────

async def rank_grants_for_user(
    user: User,
    grants: List[dict],
    db: Session,
) -> List[dict]:
    """
    Scores and ranks grant programs for an entrepreneur.
    Uses Huawei ModelArts grant eligibility model.
    """
    user_profile = build_user_match_profile(user, db)
    scored_grants = []

    for grant in grants:
        result = await score_grant_eligibility(user_profile, grant)
        scored_grants.append({
            **grant,
            "eligibility_score": result["score"],
            "eligibility_factors": result.get("factors", {}),
            "is_eligible": result["score"] >= 40 and len([
                f for f in (result.get("factors", {}).values())
                if isinstance(f, dict) and f.get("disqualifier")
            ]) == 0,
            "match_model": result["model"],
        })

    scored_grants.sort(key=lambda x: x["eligibility_score"], reverse=True)
    return scored_grants