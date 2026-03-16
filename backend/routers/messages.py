from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
import logging

from backend.config.database import get_db
from backend.models.user import User
from backend.routers.auth import get_current_user

logger = logging.getLogger("arise.messages")
router = APIRouter()

_threads = {}
_messages_store = {}

class SendMessageRequest(BaseModel):
    recipient_id: str
    text: str
    thread_id: Optional[str] = None

@router.get("/", summary="Get all message threads")
async def get_threads(current_user: User = Depends(get_current_user)):
    user_threads = [t for t in _threads.values() if current_user.id in t.get("participants", [])]
    return {"threads": user_threads, "total": len(user_threads)}

@router.post("/", summary="Send a message", status_code=201)
async def send_message(body: SendMessageRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    thread_id = body.thread_id or str(uuid.uuid4())
    if thread_id not in _threads:
        _threads[thread_id] = {
            "id": thread_id,
            "participants": [current_user.id, body.recipient_id],
            "created_at": datetime.utcnow().isoformat(),
            "safety_note": "All communication is monitored for safety. Contact details shared only after mutual consent."
        }
    msg = {
        "id": str(uuid.uuid4()), "thread_id": thread_id,
        "sender_id": current_user.id, "text": body.text,
        "timestamp": datetime.utcnow().isoformat(), "is_read": False,
    }
    _messages_store.setdefault(thread_id, []).append(msg)
    _threads[thread_id]["last_message"] = body.text[:80]
    _threads[thread_id]["last_at"] = msg["timestamp"]
    logger.info(f"Message sent: {current_user.email} → thread {thread_id}")
    return {"message_id": msg["id"], "thread_id": thread_id}

@router.get("/{thread_id}", summary="Get messages in a thread")
async def get_thread_messages(thread_id: str, current_user: User = Depends(get_current_user)):
    thread = _threads.get(thread_id)
    if not thread or current_user.id not in thread.get("participants", []):
        raise HTTPException(status_code=404, detail="Thread not found.")
    msgs = _messages_store.get(thread_id, [])
    for m in msgs:
        if m["sender_id"] != current_user.id:
            m["is_read"] = True
    return {"messages": msgs, "total": len(msgs), "thread": thread}

@router.delete("/{thread_id}", summary="Delete a thread")
async def delete_thread(thread_id: str, current_user: User = Depends(get_current_user)):
    thread = _threads.get(thread_id)
    if not thread or current_user.id not in thread.get("participants", []):
        raise HTTPException(status_code=404, detail="Thread not found.")
    _threads.pop(thread_id, None)
    _messages_store.pop(thread_id, None)
    return {"message": "Thread deleted."}