"""
Huawei ModelArts Service
========================
AI inference for ARISE's core matching and scoring features.

Models:
1. Grant Eligibility Model — predicts funding match scores
2. Job/Project Matching Model — ranks opportunities by TrustID profile
3. Skills Assessment Model — evaluates skill proficiency responses
4. ECS Prediction Model — forecasts ECS growth trajectory

Docs: https://support.huaweicloud.com/modelarts/index.html
"""

import httpx
import logging
from typing import Optional

from backend.config.settings import settings

logger = logging.getLogger("arise.huawei.modelarts")


# ─── Model Inference Base ──────────────────────────────────────────────────────

async def _call_model(model_id: str, inputs: dict) -> Optional[dict]:
    """
    Calls a deployed Huawei ModelArts inference endpoint.
    Returns None if model unavailable — callers fall back to rules engine.
    """
    if not model_id or not settings.HUAWEI_ACCESS_KEY or settings.HUAWEI_ACCESS_KEY == "placeholder":
        return None

    url = (
        f"{settings.HUAWEI_MODELARTS_ENDPOINT}/v1/{settings.HUAWEI_PROJECT_ID}"
        f"/models/{model_id}/predict"
    )

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                url,
                json={"data": inputs},
                headers={"Content-Type": "application/json"}
            )
        if response.status_code == 200:
            return response.json().get("predictions", {})
        logger.warning(f"ModelArts {model_id} returned {response.status_code}")
        return None
    except Exception as e:
        logger.warning(f"ModelArts inference failed for {model_id}: {e}")
        return None


# ─── Grant Eligibility Scoring ─────────────────────────────────────────────────

async def score_grant_eligibility(user_profile: dict, grant: dict) -> dict:
    """
    Predicts grant eligibility score using ModelArts trained on
    historical NYDA/SEDA approval data.
    
    Input features:
    - age, gender, province
    - business_stage, sector
    - ecs_score, is_identity_verified
    - cipc_registered, revenue_range
    
    Returns score 0-100 and factor breakdown.
    Falls back to rules engine if model unavailable.
    """
    inputs = {
        "age": user_profile.get("age"),
        "gender": user_profile.get("gender", "unknown"),
        "province": user_profile.get("province", ""),
        "business_stage": user_profile.get("business_stage", "idea"),
        "sector": user_profile.get("sector", ""),
        "ecs_score": user_profile.get("ecs_score", 0),
        "is_identity_verified": user_profile.get("is_identity_verified", False),
        "cipc_registered": user_profile.get("cipc_number") is not None,
        "grant_type": grant.get("type", "grant"),
        "grant_min_age": grant.get("min_age"),
        "grant_max_age": grant.get("max_age"),
        "grant_gender": grant.get("gender", "all"),
        "grant_sectors": grant.get("sectors", ["all"]),
        "grant_requires_cipc": grant.get("requires_cipc", False),
    }

    prediction = await _call_model(settings.HUAWEI_GRANT_MODEL_ID, inputs)

    if prediction:
        logger.info(f"ModelArts grant score: {prediction.get('score')} for {grant.get('id')}")
        return {
            "score": min(100, max(0, prediction.get("score", 0))),
            "factors": prediction.get("factors", {}),
            "model": "huawei_modelarts",
        }

    # Rules-based fallback
    return _rules_grant_score(user_profile, grant)


def _rules_grant_score(user: dict, grant: dict) -> dict:
    """Deterministic fallback scoring when ModelArts unavailable"""
    score = 0
    factors = {}

    # Age
    age = user.get("age")
    if age and grant.get("min_age") and age >= grant["min_age"]:
        score += 20
        factors["age"] = {"score": 20, "reason": "Age meets minimum"}
    elif not grant.get("min_age"):
        score += 20
        factors["age"] = {"score": 20, "reason": "No age restriction"}

    if age and grant.get("max_age") and age <= grant["max_age"]:
        score += 10
        factors["age_max"] = {"score": 10, "reason": "Age within maximum"}
    elif not grant.get("max_age"):
        score += 10

    # Gender
    if grant.get("gender") == "female" and user.get("gender") == "female":
        score += 20
        factors["gender"] = {"score": 20, "reason": "Gender requirement met"}
    elif not grant.get("gender"):
        score += 20
        factors["gender"] = {"score": 20, "reason": "No gender restriction"}

    # CIPC
    if grant.get("requires_cipc"):
        if user.get("cipc_number"):
            score += 20
            factors["cipc"] = {"score": 20, "reason": "CIPC registered"}
        else:
            factors["cipc"] = {"score": 0, "reason": "CIPC registration required"}
    else:
        score += 20
        factors["cipc"] = {"score": 20, "reason": "CIPC not required"}

    # Sector
    grant_sectors = grant.get("sectors", ["all"])
    if "all" in grant_sectors:
        score += 15
        factors["sector"] = {"score": 15, "reason": "All sectors eligible"}
    elif user.get("sector") in grant_sectors:
        score += 15
        factors["sector"] = {"score": 15, "reason": "Your sector is eligible"}

    # Identity verified
    if user.get("is_identity_verified"):
        score += 15
        factors["identity"] = {"score": 15, "reason": "Identity verified on ARISE"}

    return {
        "score": min(100, score),
        "factors": factors,
        "model": "rules_engine",
    }


# ─── Job / Project Matching ────────────────────────────────────────────────────

async def score_job_match(user_profile: dict, job: dict) -> dict:
    """
    Ranks a job opportunity against a user's TrustID profile.
    
    Input features:
    - user verified skills vs required skills
    - location match
    - experience years
    - salary expectations vs offering
    - work style preference
    - ECS score (higher = more opportunities unlocked)
    
    🔴 Huawei ModelArts: trained on successful hire patterns
    """
    inputs = {
        "user_skills": user_profile.get("skills", []),
        "required_skills": job.get("required_skills", []),
        "user_province": user_profile.get("province", ""),
        "job_province": job.get("province", ""),
        "user_experience_years": user_profile.get("experience_years", 0),
        "required_experience_years": job.get("required_experience_years", 0),
        "user_salary_min": user_profile.get("salary_min", 0),
        "user_salary_max": user_profile.get("salary_max", 999999),
        "job_salary_min": job.get("salary_min", 0),
        "job_salary_max": job.get("salary_max", 999999),
        "user_work_style": user_profile.get("work_style", ""),
        "job_work_style": job.get("work_style", ""),
        "ecs_score": user_profile.get("ecs_score", 0),
    }

    prediction = await _call_model(settings.HUAWEI_MATCHING_MODEL_ID, inputs)

    if prediction:
        return {
            "total": min(100, prediction.get("match_score", 0)),
            "breakdown": prediction.get("breakdown", {}),
            "model": "huawei_modelarts",
        }

    # Rules fallback
    return _rules_job_match(user_profile, job)


def _rules_job_match(user: dict, job: dict) -> dict:
    """Rules-based job matching fallback"""
    score = 0
    breakdown = {}

    # Skills (40 points)
    user_skills = {s.lower() for s in user.get("skills", [])}
    required = {s.lower() for s in job.get("required_skills", [])}
    if required:
        matched = user_skills & required
        skill_score = int((len(matched) / len(required)) * 40)
        score += skill_score
        breakdown["skills"] = {"score": skill_score, "max": 40, "matched": list(matched)}
    else:
        score += 30
        breakdown["skills"] = {"score": 30, "max": 40}

    # Location (20 points)
    if user.get("province") and user.get("province") == job.get("province"):
        score += 20
        breakdown["location"] = {"score": 20, "max": 20}
    elif job.get("work_style") == "remote":
        score += 20
        breakdown["location"] = {"score": 20, "max": 20, "reason": "Remote role"}
    else:
        score += 8
        breakdown["location"] = {"score": 8, "max": 20}

    # Experience (20 points)
    req_exp = job.get("required_experience_years", 0)
    user_exp = user.get("experience_years", 0)
    if user_exp >= req_exp:
        score += 20
        breakdown["experience"] = {"score": 20, "max": 20}
    else:
        exp_score = max(0, int(20 - (req_exp - user_exp) * 5))
        score += exp_score
        breakdown["experience"] = {"score": exp_score, "max": 20}

    # Work style (10 points)
    if user.get("work_style") == job.get("work_style"):
        score += 10
        breakdown["work_style"] = {"score": 10, "max": 10}
    else:
        breakdown["work_style"] = {"score": 0, "max": 10}

    # ECS boost (10 points) — high ECS = more trusted candidate
    ecs = user.get("ecs_score", 0)
    ecs_score = min(10, int(ecs / 85))
    score += ecs_score
    breakdown["ecs_boost"] = {"score": ecs_score, "max": 10}

    return {
        "total": min(100, score),
        "breakdown": breakdown,
        "model": "rules_engine",
    }


# ─── Skills Assessment Scoring ─────────────────────────────────────────────────

async def score_skills_assessment(skill_name: str, answers: list) -> dict:
    """
    Scores a skills assessment response using ModelArts.
    
    🔴 Huawei ModelArts: trained on skill domain knowledge
    Falls back to answer-index scoring.
    """
    inputs = {
        "skill": skill_name,
        "answers": answers,
        "answer_count": len(answers),
    }

    prediction = await _call_model(settings.HUAWEI_SKILLS_MODEL_ID, inputs)

    if prediction:
        return {
            "score": min(100, prediction.get("proficiency_score", 0)),
            "level": prediction.get("level", "intermediate"),
            "passed": prediction.get("passed", False),
            "model": "huawei_modelarts",
        }

    # Simple fallback: higher answer indices = more experienced
    avg_answer = sum(answers) / max(len(answers), 1)
    max_possible = 3  # 0-3 scale per question
    score = int((avg_answer / max_possible) * 100)

    return {
        "score": score,
        "level": "expert" if score >= 75 else "advanced" if score >= 60 else "intermediate" if score >= 40 else "beginner",
        "passed": score >= 50,
        "model": "rules_engine",
    }