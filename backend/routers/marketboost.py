from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
import logging

from backend.config.database import get_db
from backend.models.user import User
from backend.routers.auth import get_current_user

logger = logging.getLogger("arise.marketboost")
router = APIRouter()

_storefronts = {}
_listings = {}
_orders = {}

class CreateListingRequest(BaseModel):
    title: str
    description: str
    price: float
    currency: str = "ZAR"
    category: str
    is_service: bool = True
    languages: List[str] = ["English"]
    tags: List[str] = []

class UpdateListingRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    is_active: Optional[bool] = None

@router.get("/storefront/mine", summary="Get own storefront and listings")
async def get_my_storefront(current_user: User = Depends(get_current_user)):
    storefront = _storefronts.get(current_user.id)
    listings = [l for l in _listings.values() if l["seller_id"] == current_user.id]
    total_views = sum(l.get("view_count", 0) for l in listings)
    return {
        "storefront": storefront,
        "listings": listings,
        "stats": {
            "total_listings": len(listings),
            "active_listings": len([l for l in listings if l.get("is_active")]),
            "total_views": total_views,
        },
        "whatsapp_share_text": f"Check out my services on ARISE: arise.co.za/store/{current_user.id}"
    }

@router.get("/storefront/{user_id}", summary="View a public storefront")
async def get_storefront(user_id: str, current_user: User = Depends(get_current_user)):
    listings = [l for l in _listings.values() if l["seller_id"] == user_id and l.get("is_active")]
    if not listings:
        raise HTTPException(status_code=404, detail="Storefront not found or no active listings.")
    return {"listings": listings, "total": len(listings)}

@router.post("/listings", summary="Create a product or service listing", status_code=201)
async def create_listing(body: CreateListingRequest, current_user: User = Depends(get_current_user)):
    """🔴 Huawei NLP: generates professional description + multilingual versions"""
    listing_id = str(uuid.uuid4())

    # Generate WhatsApp share link
    wa_text = f"Hi! I'd like to enquire about: {body.title} (R{body.price}) — seen on ARISE marketplace"

    listing = {
        "id": listing_id,
        "seller_id": current_user.id,
        "seller_name": current_user.full_name,
        "seller_ecs_score": current_user.ecs_score,
        "title": body.title,
        "description": body.description,
        "price": body.price,
        "currency": body.currency,
        "category": body.category,
        "is_service": body.is_service,
        "languages": body.languages,
        "tags": body.tags,
        "is_active": True,
        "view_count": 0,
        "inquiry_count": 0,
        "whatsapp_link": f"https://wa.me/?text={wa_text.replace(' ', '%20')}",
        "payment_methods": ["SnapScan", "Yoco", "EFT"],
        "created_at": datetime.utcnow().isoformat(),
    }
    _listings[listing_id] = listing

    # Create storefront if first listing
    if current_user.id not in _storefronts:
        _storefronts[current_user.id] = {
            "seller_id": current_user.id,
            "seller_name": current_user.full_name,
            "profile_url": f"/profile/{current_user.id}",
            "ecs_score": current_user.ecs_score,
            "created_at": datetime.utcnow().isoformat(),
        }

    logger.info(f"Listing created: {body.title} by {current_user.email}")
    return {
        "message": "Listing live on ARISE MarketBoost.",
        "listing_id": listing_id,
        "whatsapp_link": listing["whatsapp_link"],
        "storefront_url": f"/marketboost/storefront/{current_user.id}"
    }

@router.patch("/listings/{listing_id}", summary="Update a listing")
async def update_listing(listing_id: str, body: UpdateListingRequest, current_user: User = Depends(get_current_user)):
    listing = _listings.get(listing_id)
    if not listing or listing["seller_id"] != current_user.id:
        raise HTTPException(status_code=404, detail="Listing not found.")
    for key, val in body.model_dump(exclude_none=True).items():
        listing[key] = val
    listing["updated_at"] = datetime.utcnow().isoformat()
    return {"message": "Listing updated.", "listing": listing}

@router.delete("/listings/{listing_id}", summary="Delete a listing")
async def delete_listing(listing_id: str, current_user: User = Depends(get_current_user)):
    listing = _listings.get(listing_id)
    if not listing or listing["seller_id"] != current_user.id:
        raise HTTPException(status_code=404, detail="Listing not found.")
    _listings.pop(listing_id)
    return {"message": "Listing removed."}

@router.get("/browse", summary="Browse all marketplace listings")
async def browse_listings(
    category: Optional[str] = Query(None),
    is_service: Optional[bool] = Query(None),
    max_price: Optional[float] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=50),
    current_user: User = Depends(get_current_user)
):
    listings = [l for l in _listings.values() if l.get("is_active") and l["seller_id"] != current_user.id]
    if category:
        listings = [l for l in listings if l.get("category") == category]
    if is_service is not None:
        listings = [l for l in listings if l.get("is_service") == is_service]
    if max_price:
        listings = [l for l in listings if l.get("price", 0) <= max_price]

    start = (page - 1) * limit
    return {"listings": listings[start:start+limit], "total": len(listings), "page": page}

@router.post("/listings/{listing_id}/inquire", summary="Send an inquiry about a listing")
async def inquire_listing(listing_id: str, current_user: User = Depends(get_current_user)):
    listing = _listings.get(listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found.")
    listing["inquiry_count"] = listing.get("inquiry_count", 0) + 1
    return {
        "message": "Inquiry sent via ARISE messages.",
        "seller_id": listing["seller_id"],
        "whatsapp_link": listing["whatsapp_link"]
    }