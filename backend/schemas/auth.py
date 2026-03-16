from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from backend.models.user import PersonaType


# ─── Register ──────────────────────────────────────────────────────────────────

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

    @validator("password")
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v

    @validator("first_name", "last_name")
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip().title()


# ─── Login ─────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ─── Token Response ────────────────────────────────────────────────────────────

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int                 # seconds
    user: "UserResponse"


# ─── User Response ─────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    full_name: str
    primary_persona: PersonaType
    secondary_personas: List[str]
    is_email_verified: bool
    is_identity_verified: bool
    trust_completion_score: float
    ecs_score: int
    profile_photo_url: Optional[str]
    province: Optional[str]
    city: Optional[str]
    preferred_language: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Password Reset ────────────────────────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @validator("new_password")
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


# ─── Email Verification ────────────────────────────────────────────────────────

class VerifyEmailRequest(BaseModel):
    token: str


# ─── Change Password ───────────────────────────────────────────────────────────

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @validator("new_password")
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


TokenResponse.model_rebuild()