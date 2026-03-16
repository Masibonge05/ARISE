from sqlalchemy import Column, String, Boolean, DateTime, Float, Integer, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from backend.config.database import Base

class Course(Base):
    __tablename__ = "courses"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    provider = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    skill_unlocked = Column(String, nullable=False)
    category = Column(String, nullable=True)
    level = Column(String, default="beginner")
    duration_hours = Column(Float, nullable=True)
    ecs_points = Column(Integer, default=15)
    is_free = Column(Boolean, default=True)
    url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    enrollments = relationship("CourseEnrollment", back_populates="course", cascade="all, delete-orphan")

class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    ecs_awarded = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    course = relationship("Course", back_populates="enrollments")