from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
import logging

from backend.config.database import get_db
from backend.models.user import User, FreelancerProfile
from backend.routers.auth import get_current_user

logger = logging.getLogger("arise.freelance")
router = APIRouter()

_projects = {}
_proposals = {}
_escrow = {}

class CreateProjectRequest(BaseModel):
    title: str
    description: str
    category: str
    budget_min: float
    budget_max: float
    currency: str = "ZAR"
    deadline_days: int
    required_skills: List[str] = []
    province: Optional[str] = None
    is_remote: bool = True

class SubmitProposalRequest(BaseModel):
    cover_message: str
    proposed_rate: float
    estimated_days: int
    portfolio_item_ids: List[str] = []

class UpdateAvailabilityRequest(BaseModel):
    is_available: bool
    available_from: Optional[datetime] = None

class UpdateRateCardRequest(BaseModel):
    hourly_rate: Optional[float] = None
    project_minimum: Optional[float] = None
    typical_turnaround_days: Optional[int] = None
    service_categories: Optional[List[str]] = None

class ConfirmDeliveryRequest(BaseModel):
    is_satisfied: bool
    rating: int
    review: Optional[str] = None

@router.get("/", summary="Get freelance project feed matched to skills")
async def get_project_feed(
    category: Optional[str] = Query(None),
    is_remote: Optional[bool] = Query(None),
    budget_min: Optional[float] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    projects = list(_projects.values())
    if category:
        projects = [p for p in projects if p.get("category") == category]
    if is_remote is not None:
        projects = [p for p in projects if p.get("is_remote") == is_remote]
    if budget_min:
        projects = [p for p in projects if p.get("budget_max", 0) >= budget_min]

    user_skills = {s.skill_name.lower() for s in current_user.skills}
    for p in projects:
        required = {s.lower() for s in p.get("required_skills", [])}
        matched = user_skills & required
        p["match_score"] = int((len(matched) / max(len(required), 1)) * 100)

    projects.sort(key=lambda x: x["match_score"], reverse=True)
    start = (page - 1) * limit
    return {"projects": projects[start:start + limit], "total": len(projects), "page": page}

@router.post("/", summary="Post a project brief", status_code=201)
async def create_project(body: CreateProjectRequest, current_user: User = Depends(get_current_user)):
    project_id = str(uuid.uuid4())
    _projects[project_id] = {
        "id": project_id, "client_id": current_user.id,
        "client_name": current_user.full_name, "title": body.title,
        "description": body.description, "category": body.category,
        "budget_min": body.budget_min, "budget_max": body.budget_max,
        "currency": body.currency, "deadline_days": body.deadline_days,
        "required_skills": body.required_skills, "province": body.province,
        "is_remote": body.is_remote, "status": "open", "proposal_count": 0,
        "created_at": datetime.utcnow().isoformat(),
    }
    return {"message": "Project posted successfully.", "project_id": project_id}

@router.get("/{project_id}", summary="Get project detail")
async def get_project_detail(project_id: str, current_user: User = Depends(get_current_user)):
    project = _projects.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    project["client_trust_score"] = 4.2
    project["already_proposed"] = any(
        p["project_id"] == project_id and p["freelancer_id"] == current_user.id
        for p in _proposals.values()
    )
    return project

@router.post("/{project_id}/propose", summary="Submit a proposal", status_code=201)
async def submit_proposal(project_id: str, body: SubmitProposalRequest, current_user: User = Depends(get_current_user)):
    project = _projects.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    if project["status"] != "open":
        raise HTTPException(status_code=400, detail="Project is no longer accepting proposals.")
    if any(p["project_id"] == project_id and p["freelancer_id"] == current_user.id for p in _proposals.values()):
        raise HTTPException(status_code=409, detail="You already submitted a proposal.")

    proposal_id = str(uuid.uuid4())
    _proposals[proposal_id] = {
        "id": proposal_id, "project_id": project_id,
        "freelancer_id": current_user.id, "freelancer_name": current_user.full_name,
        "freelancer_ecs_score": current_user.ecs_score,
        "cover_message": body.cover_message, "proposed_rate": body.proposed_rate,
        "estimated_days": body.estimated_days, "status": "pending",
        "created_at": datetime.utcnow().isoformat(),
    }
    _projects[project_id]["proposal_count"] += 1
    return {"message": "Proposal submitted successfully.", "proposal_id": proposal_id}

@router.post("/{project_id}/proposals/{proposal_id}/accept", summary="Accept a proposal")
async def accept_proposal(project_id: str, proposal_id: str, current_user: User = Depends(get_current_user)):
    project = _projects.get(project_id)
    proposal = _proposals.get(proposal_id)
    if not project or not proposal:
        raise HTTPException(status_code=404, detail="Not found.")
    if project["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the client can accept proposals.")

    escrow_id = str(uuid.uuid4())
    _escrow[escrow_id] = {
        "id": escrow_id, "project_id": project_id, "proposal_id": proposal_id,
        "freelancer_id": proposal["freelancer_id"], "client_id": current_user.id,
        "amount": proposal["proposed_rate"], "status": "held",
        "held_at": datetime.utcnow().isoformat(),
    }
    _proposals[proposal_id]["status"] = "accepted"
    _projects[project_id]["status"] = "in_progress"
    _projects[project_id]["accepted_freelancer_id"] = proposal["freelancer_id"]
    _projects[project_id]["escrow_id"] = escrow_id
    return {"message": "Proposal accepted. Payment held in escrow.", "escrow_id": escrow_id}

@router.post("/{project_id}/deliver", summary="Mark project as delivered")
async def mark_delivered(project_id: str, current_user: User = Depends(get_current_user)):
    project = _projects.get(project_id)
    if not project or project.get("accepted_freelancer_id") != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized.")
    _projects[project_id]["status"] = "pending_confirmation"
    _projects[project_id]["delivered_at"] = datetime.utcnow().isoformat()
    return {"message": "Delivery marked. Client has 72 hours to confirm."}

@router.post("/{project_id}/confirm-delivery", summary="Confirm delivery and release escrow")
async def confirm_delivery(project_id: str, body: ConfirmDeliveryRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = _projects.get(project_id)
    if not project or project["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized.")
    escrow_id = project.get("escrow_id")
    if escrow_id in _escrow:
        _escrow[escrow_id]["status"] = "released" if body.is_satisfied else "disputed"
    _projects[project_id]["status"] = "completed" if body.is_satisfied else "disputed"
    _projects[project_id]["client_rating"] = body.rating
    if body.is_satisfied:
        freelancer_id = project.get("accepted_freelancer_id")
        profile = db.query(FreelancerProfile).filter(FreelancerProfile.user_id == freelancer_id).first()
        if profile:
            profile.total_projects_completed += 1
            total = profile.total_projects_completed
            profile.average_rating = ((profile.average_rating * (total - 1)) + body.rating) / total
            if total >= 5 and profile.average_rating >= 4.0:
                profile.is_top_freelancer = True
            db.commit()
    return {"message": "Payment released." if body.is_satisfied else "Dispute opened."}

@router.patch("/profile/availability", summary="Update availability")
async def update_availability(body: UpdateAvailabilityRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.is_available = body.is_available
    current_user.available_from = body.available_from
    db.commit()
    return {"message": f"Availability updated."}

@router.get("/my/active", summary="Get active projects")
async def get_active_projects(current_user: User = Depends(get_current_user)):
    active = [p for p in _projects.values() if p.get("accepted_freelancer_id") == current_user.id and p.get("status") in ("in_progress", "pending_confirmation")]
    return {"projects": active, "total": len(active)}

@router.get("/my/earnings", summary="Get earnings history")
async def get_earnings(current_user: User = Depends(get_current_user)):
    completed = [p for p in _projects.values() if p.get("accepted_freelancer_id") == current_user.id and p.get("status") == "completed"]
    total_earned = sum(_escrow.get(p.get("escrow_id", ""), {}).get("amount", 0) for p in completed)
    return {"total_earned": total_earned, "currency": "ZAR", "completed_projects": len(completed),
            "history": [{"project_title": p["title"], "amount": _escrow.get(p.get("escrow_id", ""), {}).get("amount", 0), "client_rating": p.get("client_rating")} for p in completed]}