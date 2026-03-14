from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import logging

from backend.config.database import get_db
from backend.models.user import User
from backend.models.business import BusinessProfile
from backend.routers.auth import get_current_user

logger = logging.getLogger("arise.fundmatch")
router = APIRouter()

# ─── SA Funding Database (seed data — moves to CloudTable in production) ───────
FUNDING_PROGRAMS = [
    {
        "id": "nyda-001", "name": "NYDA Youth Fund",
        "funder": "National Youth Development Agency",
        "type": "grant", "max_amount": 100000, "currency": "ZAR",
        "description": "Supports South African youth entrepreneurs aged 18-35 to start or grow businesses.",
        "sectors": ["all"], "min_age": 18, "max_age": 35,
        "requires_cipc": True, "requires_sa_citizen": True,
        "provinces": ["all"], "business_stages": ["idea", "early", "growth"],
        "application_url": "https://www.nyda.gov.za",
        "deadline": None, "is_recurring": True,
        "criteria": ["SA citizen or permanent resident", "Aged 18-35", "Viable business plan"],
    },
    {
        "id": "seda-001", "name": "SEDA Technology Programme",
        "funder": "Small Enterprise Development Agency",
        "type": "grant", "max_amount": 500000, "currency": "ZAR",
        "description": "Technology and innovation support for small enterprises.",
        "sectors": ["technology", "manufacturing", "agriculture"], "min_age": 18, "max_age": None,
        "requires_cipc": True, "requires_sa_citizen": True,
        "provinces": ["all"], "business_stages": ["early", "growth", "scaling"],
        "application_url": "https://www.seda.org.za",
        "deadline": None, "is_recurring": True,
        "criteria": ["Registered business", "Technology focus", "Job creation potential"],
    },
    {
        "id": "wdf-001", "name": "Women Development Fund",
        "funder": "Department of Women, Youth and Persons with Disabilities",
        "type": "grant", "max_amount": 250000, "currency": "ZAR",
        "description": "Empowers women entrepreneurs to start and scale sustainable businesses.",
        "sectors": ["all"], "min_age": 18, "max_age": None,
        "requires_cipc": False, "requires_sa_citizen": True,
        "gender": "female", "provinces": ["all"],
        "business_stages": ["idea", "early", "growth"],
        "application_url": "https://www.womenandyouth.gov.za",
        "deadline": None, "is_recurring": True,
        "criteria": ["Female-owned business (51%+)", "SA citizen", "Business plan required"],
    },
    {
        "id": "nef-001", "name": "NEF Rural and Community Development Fund",
        "funder": "National Empowerment Fund",
        "type": "loan_grant_hybrid", "max_amount": 750000, "currency": "ZAR",
        "description": "Supports black-owned businesses in rural areas and townships.",
        "sectors": ["agriculture", "retail", "manufacturing", "services"],
        "min_age": 18, "max_age": None,
        "requires_cipc": True, "requires_sa_citizen": True,
        "provinces": ["all"], "business_stages": ["early", "growth"],
        "application_url": "https://www.nefcorp.co.za",
        "deadline": None, "is_recurring": True,
        "criteria": ["Black-owned (51%+)", "Registered business", "Job creation plan"],
    },
    {
        "id": "sefa-001", "name": "SEFA Micro Finance",
        "funder": "Small Enterprise Finance Agency",
        "type": "loan", "max_amount": 50000, "currency": "ZAR",
        "description": "Micro loans for survivalist and micro enterprises.",
        "sectors": ["all"], "min_age": 18, "max_age": None,
        "requires_cipc": False, "requires_sa_citizen": True,
        "provinces": ["all"], "business_stages": ["idea", "early"],
        "application_url": "https://www.sefa.org.za",
        "deadline": None, "is_recurring": True,
        "criteria": ["SA citizen", "Viable business plan", "No existing SEFA loan"],
    },
    {
        "id": "idc-001", "name": "IDC Youth Empowerment Scheme",
        "funder": "Industrial Development Corporation",
        "type": "loan", "max_amount": 1000000, "currency": "ZAR",
        "description": "Financing for youth-owned enterprises in productive sectors.",
        "sectors": ["manufacturing", "agriculture", "technology", "green_economy"],
        "min_age": 18, "max_age": 35,
        "requires_cipc": True, "requires_sa_citizen": True,
        "provinces": ["all"], "business_stages": ["growth", "scaling"],
        "application_url": "https://www.idc.co.za",
        "deadline": None, "is_recurring": True,
        "criteria": ["Youth-owned (51%+)", "Registered business", "Productive sector", "Job creation"],
    },
]


# ─── Eligibility Scoring Engine ───────────────────────────────────────────────
# 🔴 Huawei ModelArts: trained model replaces this rules engine in production

def _calculate_eligibility(user: User, business: Optional[BusinessProfile], program: dict) -> dict:
    score = 0
    reasons = []
    disqualifiers = []

    # Age check
    if program.get("min_age") and user.age:
        if user.age >= program["min_age"]:
            score += 20
            reasons.append(f"Age {user.age} meets minimum requirement of {program['min_age']}")
        else:
            disqualifiers.append(f"Must be at least {program['min_age']} years old")

    if program.get("max_age") and user.age:
        if user.age <= program["max_age"]:
            score += 10
            reasons.append(f"Age {user.age} within maximum of {program['max_age']}")
        else:
            disqualifiers.append(f"Must be under {program['max_age']} years old")
    elif not program.get("max_age"):
        score += 10

    # Gender check
    if program.get("gender"):
        if user.gender and user.gender.lower() == program["gender"]:
            score += 20
            reasons.append("Gender requirement met")
        elif not user.gender:
            reasons.append("Gender not specified on profile — may affect eligibility")
            score += 5
        else:
            disqualifiers.append(f"This fund is for {program['gender']}-owned businesses")

    # CIPC check
    if program.get("requires_cipc"):
        if business and business.cipc_number:
            score += 20
            reasons.append("Business is CIPC registered")
        else:
            score += 5
            reasons.append("CIPC registration required — complete LaunchPad to qualify")
    else:
        score += 20
        reasons.append("CIPC registration not required for this fund")

    # Business stage check
    if business and business.stage.value in program.get("business_stages", []):
        score += 15
        reasons.append(f"Your business stage ({business.stage.value}) matches this fund")
    elif not business:
        score += 5

    # Sector check
    if "all" in program.get("sectors", []):
        score += 15
        reasons.append("Open to all sectors")
    elif business and business.sector and business.sector.lower() in [s.lower() for s in program.get("sectors", [])]:
        score += 15
        reasons.append(f"Your sector ({business.sector}) is eligible")

    # SA citizenship (assumed true for now)
    score += 10
    reasons.append("SA citizenship requirement assumed met")

    if disqualifiers:
        score = max(0, score - 30)

    return {
        "score": min(100, score),
        "reasons": reasons,
        "disqualifiers": disqualifiers,
        "is_eligible": len(disqualifiers) == 0 and score >= 40,
    }


# ─── Routes ────────────────────────────────────────────────────────────────────

@router.get("/", summary="Get ranked grant matches for this user")
async def get_fund_matches(
    type: Optional[str] = Query(None),
    min_amount: Optional[float] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns ranked funding programs with eligibility scores.
    🔴 Huawei ModelArts: AI model trained on approval patterns plugs in here
    """
    business = db.query(BusinessProfile).filter(
        BusinessProfile.owner_id == current_user.id
    ).first()

    results = []
    for program in FUNDING_PROGRAMS:
        if type and program["type"] != type:
            continue
        if min_amount and program["max_amount"] < min_amount:
            continue

        eligibility = _calculate_eligibility(current_user, business, program)
        results.append({
            "id": program["id"],
            "name": program["name"],
            "funder": program["funder"],
            "type": program["type"],
            "max_amount": program["max_amount"],
            "currency": program["currency"],
            "description": program["description"],
            "sectors": program["sectors"],
            "business_stages": program["business_stages"],
            "application_url": program["application_url"],
            "is_recurring": program["is_recurring"],
            "eligibility_score": eligibility["score"],
            "eligibility_reasons": eligibility["reasons"],
            "disqualifiers": eligibility["disqualifiers"],
            "is_eligible": eligibility["is_eligible"],
        })

    results.sort(key=lambda x: x["eligibility_score"], reverse=True)

    return {
        "matches": results,
        "total": len(results),
        "eligible_count": len([r for r in results if r["is_eligible"]]),
        "profile_completeness_tip": None if current_user.is_identity_verified
            else "Complete your identity verification to improve match accuracy",
    }


@router.get("/{funder_id}", summary="Get funder detail with full eligibility breakdown")
async def get_funder_detail(
    funder_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    program = next((p for p in FUNDING_PROGRAMS if p["id"] == funder_id), None)
    if not program:
        raise HTTPException(status_code=404, detail="Funding program not found.")

    business = db.query(BusinessProfile).filter(
        BusinessProfile.owner_id == current_user.id
    ).first()

    eligibility = _calculate_eligibility(current_user, business, program)

    return {
        **program,
        "eligibility_score": eligibility["score"],
        "eligibility_reasons": eligibility["reasons"],
        "disqualifiers": eligibility["disqualifiers"],
        "is_eligible": eligibility["is_eligible"],
        "application_draft": _generate_application_draft(current_user, business, program),
    }


def _generate_application_draft(user: User, business: Optional[BusinessProfile], program: dict) -> dict:
    """Pre-fills application with known TrustID data"""
    return {
        "applicant_name": user.full_name,
        "id_number": "[From verified TrustID]",
        "contact_email": user.email,
        "province": user.province or "[Add to profile]",
        "business_name": business.business_name if business else "[Complete LaunchPad]",
        "cipc_number": business.cipc_number if business else "[Complete LaunchPad]",
        "business_sector": business.sector if business else "[Complete LaunchPad]",
        "funding_amount_requested": min(program["max_amount"], business.funding_amount_seeking or program["max_amount"]) if business else program["max_amount"],
        "funding_purpose": business.funding_use_of_funds if business else "[Describe how you will use the funds]",
        "completion_percentage": 85 if business and business.cipc_number else 45,
    }