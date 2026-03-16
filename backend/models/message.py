from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from backend.config.database import Base

class Message(Base):
    __tablename__ = "messages"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    thread_id = Column(String, nullable=False, index=True)
    sender_id = Column(String, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(String, ForeignKey("users.id"), nullable=False)
    text = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    is_system = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")

class MessageThread(Base):
    __tablename__ = "message_threads"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    participant_1_id = Column(String, ForeignKey("users.id"), nullable=False)
    participant_2_id = Column(String, ForeignKey("users.id"), nullable=False)
    last_message = Column(String, nullable=True)
    last_message_at = Column(DateTime, nullable=True)
    is_safety_flagged = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())