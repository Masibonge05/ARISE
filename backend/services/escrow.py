"""Escrow service — payment protection for freelance transactions"""
import logging
from datetime import datetime, timedelta

logger = logging.getLogger("arise.escrow")

_escrow_records = {}

def hold_payment(
    project_id: str,
    client_id: str,
    freelancer_id: str,
    amount: float,
    currency: str = "ZAR"
) -> dict:
    """Holds a payment in escrow when client accepts a proposal"""
    import uuid
    escrow_id = str(uuid.uuid4())
    record = {
        "id": escrow_id,
        "project_id": project_id,
        "client_id": client_id,
        "freelancer_id": freelancer_id,
        "amount": amount,
        "currency": currency,
        "status": "held",
        "held_at": datetime.utcnow().isoformat(),
        "auto_release_at": (datetime.utcnow() + timedelta(hours=72)).isoformat(),
    }
    _escrow_records[escrow_id] = record
    logger.info(f"Escrow held: {currency} {amount} for project {project_id}")
    return record

def release_payment(escrow_id: str) -> dict:
    """Releases escrow payment to freelancer after delivery confirmation"""
    record = _escrow_records.get(escrow_id)
    if not record:
        return {"success": False, "error": "Escrow record not found"}
    record["status"] = "released"
    record["released_at"] = datetime.utcnow().isoformat()
    logger.info(f"Escrow released: {record['amount']} to {record['freelancer_id']}")
    return {"success": True, "record": record}

def dispute_payment(escrow_id: str, reason: str) -> dict:
    """Opens a dispute on an escrow — holds funds pending review"""
    record = _escrow_records.get(escrow_id)
    if not record:
        return {"success": False, "error": "Escrow record not found"}
    record["status"] = "disputed"
    record["dispute_reason"] = reason
    record["disputed_at"] = datetime.utcnow().isoformat()
    logger.warning(f"Escrow disputed: {escrow_id} — {reason}")
    return {"success": True, "record": record}

def get_escrow(escrow_id: str) -> dict:
    return _escrow_records.get(escrow_id, {})