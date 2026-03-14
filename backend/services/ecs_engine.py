"""
ARISE ECS Engine
=================
Entrepreneurship Credit Score — a new financial primitive for South Africa.

The ECS is a dynamic score from 0–850 that builds a financial identity
for entrepreneurs, freelancers, and job seekers who have no traditional
credit history.

Five factors (total max: 850):
1. Formalization      (max 200) — business registration, identity, docs
2. Mentorship         (max 150) — sessions completed, consistency
3. Grant Compliance   (max 150) — grants accessed + correctly spent
4. Revenue Activity   (max 200) — income generated on ARISE
5. Community Rep      (max 150) — reviews, ratings, skill assessments

Usage:
    from backend.services.ecs_engine import calculate_ecs, award_ecs_event
"""

import logging
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from backend.models.user import User, VerificationStatus, SkillVerificationSource, FreelancerProfile
from backend.models.ecs import ECSHistory

logger = logging.getLogger("arise.ecs")


# ─── ECS Event Types & Points ──────────────────────────────────────────────────

ECS_EVENTS = {
    # Formalization (max 200)
    "email_verified":           {"points": 25,  "factor": "formalization", "desc": "Email address verified"},
    "identity_verified":        {"points": 50,  "factor": "formalization", "desc": "Identity document verified"},
    "profile_photo_added":      {"points": 10,  "factor": "formalization", "desc": "Profile photo uploaded"},
    "bio_added":                {"points": 10,  "factor": "formalization", "desc": "Profile bio written"},
    "qualification_verified":   {"points": 25,  "factor": "formalization", "desc": "Qualification verified"},
    "business_registered":      {"points": 30,  "factor": "formalization", "desc": "Business registered on LaunchPad"},
    "cipc_verified":            {"points": 25,  "factor": "formalization", "desc": "CIPC registration verified"},
    "work_verified":            {"points": 20,  "factor": "formalization", "desc": "Work experience verified"},

    # Mentorship (max 150)
    "session_completed":        {"points": 25,  "factor": "mentorship",   "desc": "Mentor session completed"},
    "session_rated":            {"points": 5,   "factor": "mentorship",   "desc": "Session rated and reviewed"},
    "consecutive_sessions":     {"points": 15,  "factor": "mentorship",   "desc": "3 consecutive sessions completed"},

    # Grant Compliance (max 150)
    "grant_application_submitted": {"points": 20, "factor": "grant",    "desc": "Grant application submitted"},
    "grant_received":           {"points": 50,  "factor": "grant",       "desc": "Grant successfully received"},
    "grant_report_submitted":   {"points": 30,  "factor": "grant",       "desc": "Grant compliance report submitted"},
    "grant_spent_correctly":    {"points": 50,  "factor": "grant",       "desc": "Grant funds used as declared"},

    # Revenue (max 200)
    "first_client":             {"points": 30,  "factor": "revenue",     "desc": "First paying client on ARISE"},
    "project_completed":        {"points": 20,  "factor": "revenue",     "desc": "Freelance project delivered"},
    "monthly_revenue_r5k":      {"points": 30,  "factor": "revenue",     "desc": "Earned R5,000+ this month"},
    "monthly_revenue_r20k":     {"points": 50,  "factor": "revenue",     "desc": "Earned R20,000+ this month"},
    "escrow_payment_received":  {"points": 15,  "factor": "revenue",     "desc": "Escrow payment released"},

    # Community (max 150)
    "skill_assessed":           {"points": 15,  "factor": "community",   "desc": "Skill verified via assessment"},
    "skill_accredited":         {"points": 20,  "factor": "community",   "desc": "Skill verified via accredited course"},
    "five_star_review":         {"points": 15,  "factor": "community",   "desc": "Received 5-star client review"},
    "top_freelancer_badge":     {"points": 25,  "factor": "community",   "desc": "Earned Top Freelancer badge"},
    "safety_flag_confirmed":    {"points": 10,  "factor": "community",   "desc": "Safety flag confirmed — community protection"},
}

# Factor maximums
FACTOR_MAXES = {
    "formalization": 200,
    "mentorship": 150,
    "grant": 150,
    "revenue": 200,
    "community": 150,
}


# ─── ECS Calculation ───────────────────────────────────────────────────────────

def calculate_ecs(user: User, db: Session) -> dict:
    """
    Recalculates the full ECS score from current user state.
    
    This is called:
    - After any profile update
    - After completing a session
    - After a project is delivered
    - On the ECS dashboard load
    
    Returns the full breakdown used by the ECS dashboard.
    """
    scores = {
        "formalization": _calc_formalization(user, db),
        "mentorship":    _calc_mentorship(user, db),
        "grant":         _calc_grant(user, db),
        "revenue":       _calc_revenue(user, db),
        "community":     _calc_community(user, db),
    }

    total = sum(s["score"] for s in scores.values())
    total = min(850, total)

    return {
        "total": total,
        "factors": {
            key: {
                "score": val["score"],
                "max": FACTOR_MAXES[key],
                "label": key.replace("_", " ").title() + (" Activity" if key == "revenue" else " Participation" if key == "mentorship" else " Compliance" if key == "grant" else " Reputation" if key == "community" else ""),
                "details": val.get("details", []),
                "percentage": round((val["score"] / FACTOR_MAXES[key]) * 100, 1),
            }
            for key, val in scores.items()
        }
    }


def _calc_formalization(user: User, db: Session) -> dict:
    score = 0
    details = []

    if user.is_email_verified:
        score += 25
        details.append("✓ Email verified (+25)")
    if user.is_identity_verified:
        score += 50
        details.append("✓ Identity verified (+50)")
    if user.profile_photo_url:
        score += 10
        details.append("✓ Profile photo (+10)")
    if user.bio:
        score += 10
        details.append("✓ Bio written (+10)")

    verified_quals = [q for q in user.qualifications if q.verification_status == VerificationStatus.VERIFIED]
    qual_points = min(50, len(verified_quals) * 25)
    if qual_points:
        score += qual_points
        details.append(f"✓ {len(verified_quals)} qualification(s) verified (+{qual_points})")

    # Business registration
    from backend.models.business import BusinessProfile
    business = db.query(BusinessProfile).filter(BusinessProfile.owner_id == user.id).first()
    if business:
        if business.business_name:
            score += 30
            details.append("✓ Business registered (+30)")
        if business.cipc_number:
            score += 25
            details.append("✓ CIPC verified (+25)")

    return {"score": min(FACTOR_MAXES["formalization"], score), "details": details}


def _calc_mentorship(user: User, db: Session) -> dict:
    score = 0
    details = []

    from backend.models.mentor import MentorSession, SessionStatus
    completed = db.query(MentorSession).filter(
        MentorSession.mentee_id == user.id,
        MentorSession.status == SessionStatus.COMPLETED
    ).count()

    session_points = min(125, completed * 25)
    if session_points:
        score += session_points
        details.append(f"✓ {completed} session(s) completed (+{session_points})")

    # Consistency bonus
    if completed >= 3:
        score += 15
        details.append("✓ Consistency bonus — 3+ sessions (+15)")
    if completed >= 6:
        score += 10
        details.append("✓ Dedicated learner — 6+ sessions (+10)")

    return {"score": min(FACTOR_MAXES["mentorship"], score), "details": details}


def _calc_grant(user: User, db: Session) -> dict:
    score = 0
    details = []

    # Check business profile for grant tracking
    from backend.models.business import BusinessProfile
    business = db.query(BusinessProfile).filter(BusinessProfile.owner_id == user.id).first()

    if business:
        score += 30
        details.append("✓ Business profile active (+30)")
        if business.funding_status in ("funded", "seeking_investment"):
            score += 20
            details.append("✓ Funding journey started (+20)")

    return {"score": min(FACTOR_MAXES["grant"], score), "details": details}


def _calc_revenue(user: User, db: Session) -> dict:
    score = 0
    details = []

    freelancer = db.query(FreelancerProfile).filter(FreelancerProfile.user_id == user.id).first()

    if freelancer:
        if freelancer.total_projects_completed >= 1:
            score += 30
            details.append("✓ First project completed (+30)")
        if freelancer.total_projects_completed >= 3:
            score += min(60, freelancer.total_projects_completed * 15)
            details.append(f"✓ {freelancer.total_projects_completed} projects done (+{min(60, freelancer.total_projects_completed * 15)})")
        if freelancer.total_earnings >= 5000:
            score += 30
            details.append("✓ Earned R5,000+ (+30)")
        if freelancer.total_earnings >= 20000:
            score += 50
            details.append("✓ Earned R20,000+ (+50)")
        if freelancer.is_top_freelancer:
            score += 30
            details.append("✓ Top Freelancer badge (+30)")

    return {"score": min(FACTOR_MAXES["revenue"], score), "details": details}


def _calc_community(user: User, db: Session) -> dict:
    score = 0
    details = []

    verified_skills = [
        s for s in user.skills
        if s.verification_source != SkillVerificationSource.SELF_CLAIMED
    ]
    skill_points = min(75, len(verified_skills) * 15)
    if skill_points:
        score += skill_points
        details.append(f"✓ {len(verified_skills)} skill(s) verified (+{skill_points})")

    accredited = [s for s in user.skills if s.verification_source == SkillVerificationSource.ACCREDITED]
    if accredited:
        score += min(40, len(accredited) * 20)
        details.append(f"✓ {len(accredited)} accredited skill(s) (+{min(40, len(accredited) * 20)})")

    freelancer = db.query(FreelancerProfile).filter(FreelancerProfile.user_id == user.id).first()
    if freelancer and freelancer.average_rating >= 4.0:
        score += 25
        details.append(f"✓ {freelancer.average_rating:.1f}★ average rating (+25)")

    return {"score": min(FACTOR_MAXES["community"], score), "details": details}


# ─── ECS Event Recording ───────────────────────────────────────────────────────

def award_ecs_event(user: User, event_type: str, db: Session, reference_id: str = None) -> int:
    """
    Awards ECS points for a specific event and records the history.
    
    Returns the new ECS score.
    
    Usage:
        new_score = award_ecs_event(user, "session_completed", db, session.id)
    """
    event = ECS_EVENTS.get(event_type)
    if not event:
        logger.warning(f"Unknown ECS event type: {event_type}")
        return user.ecs_score

    points = event["points"]
    old_score = user.ecs_score
    new_score = min(850, old_score + points)

    # Record history
    history = ECSHistory(
        user_id=user.id,
        score_before=old_score,
        score_after=new_score,
        points_delta=points,
        event_type=event_type,
        event_description=event["desc"],
        event_reference_id=reference_id,
    )
    db.add(history)

    # Update user score
    user.ecs_score = new_score
    user.ecs_last_updated = datetime.utcnow()
    db.commit()

    logger.info(f"ECS award: {user.email} +{points} ({event_type}) → {new_score}")
    return new_score


def get_score_band(score: int) -> dict:
    """Returns the score band label, color, and message"""
    if score < 300:
        return {"band": "Building", "color": "#FF6B35", "message": "Keep growing — every action counts"}
    elif score < 500:
        return {"band": "Developing", "color": "#FFD93D", "message": "Good progress! More opportunities unlocking"}
    elif score < 650:
        return {"band": "Established", "color": "#4ECDC4", "message": "Strong profile — investors and lenders notice you"}
    elif score < 750:
        return {"band": "Thriving", "color": "#A8E6CF", "message": "Excellent standing — premium opportunities unlocked"}
    else:
        return {"band": "Elite", "color": "#FF6B35", "message": "Top tier — all ARISE opportunities available"}