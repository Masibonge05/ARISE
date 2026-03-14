from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum


class PersonaType(str, Enum):
    JOB_SEEKER = "job_seeker"
    FREELANCER = "freelancer"
    ENTREPRENEUR = "entrepreneur"
    EMPLOYER = "employer"
    INVESTOR = "investor"
    MENTOR = "mentor"
    GOVERNMENT = "government"


class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    primary_persona: PersonaType
    province: Optional[str] = None
    city: Optional[str] = None
    preferred_language: str = "English"

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    full_name: str
    primary_persona: PersonaType
    secondary_personas: List[str] = []
    is_email_verified: bool
    is_identity_verified: bool
    trust_completion_score: float
    ecs_score: int
    profile_photo_url: Optional[str] = None
    province: Optional[str] = None
    city: Optional[str] = None
    preferred_language: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class VerifyEmailRequest(BaseModel):
    token: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
