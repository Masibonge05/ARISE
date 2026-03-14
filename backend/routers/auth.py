from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import logging

from backend.config.database import get_db
from backend.config.settings import settings
from backend.models.user import User, JobSeekerProfile, FreelancerProfile, PersonaType
from backend.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyEmailRequest,
    ChangePasswordRequest,
)
from backend.utils.auth import hash_password, verify_password, create_access_token, decode_access_token

logger = logging.getLogger("arise.auth")
router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# ─── Dependency: Get Current User ──────────────────────────────────────────────
# Used in all protected routes:
# current_user: User = Depends(get_current_user)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support."
        )
    if user.is_suspended:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Your account has been suspended: {user.suspension_reason}"
        )
    return user


def get_current_verified_user(current_user: User = Depends(get_current_user)) -> User:
    """Extra dependency for routes requiring email verification"""
    if not current_user.is_email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email address to access this feature."
        )
    return current_user


def get_government_user(current_user: User = Depends(get_current_verified_user)) -> User:
    """Dependency for GovLink — government officials only"""
    if current_user.primary_persona != PersonaType.GOVERNMENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to government officials only."
        )
    return current_user


# ─── Helper: Build User Response ───────────────────────────────────────────────

def build_user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        full_name=user.full_name,
        primary_persona=user.primary_persona,
        secondary_personas=user.secondary_personas or [],
        is_email_verified=user.is_email_verified,
        is_identity_verified=user.is_identity_verified,
        trust_completion_score=user.trust_completion_score,
        ecs_score=user.ecs_score,
        profile_photo_url=user.profile_photo_url,
        province=user.province,
        city=user.city,
        preferred_language=user.preferred_language,
        created_at=user.created_at,
    )


# ─── Routes ────────────────────────────────────────────────────────────────────

@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new ARISE user",
)
async def register(
    body: RegisterRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Register a new user on ARISE.

    - Checks if email already exists
    - Creates the user with hashed password
    - Creates persona-specific profile extension
    - Sends verification email (background task)
    - Returns JWT token immediately so user can start onboarding
    """
    # ── Check email uniqueness ────────────────────────────
    existing = db.query(User).filter(User.email == body.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists. Please log in.",
        )

    # ── Create user ───────────────────────────────────────
    verification_token = secrets.token_urlsafe(32)
    user = User(
        email=body.email.lower(),
        hashed_password=hash_password(body.password),
        first_name=body.first_name,
        last_name=body.last_name,
        phone=body.phone,
        primary_persona=body.primary_persona,
        province=body.province,
        city=body.city,
        preferred_language=body.preferred_language,
        email_verification_token=verification_token,
        is_email_verified=False,
    )
    db.add(user)
    db.flush()  # Get user.id without committing yet

    # ── Create persona-specific profile ───────────────────
    if body.primary_persona == PersonaType.JOB_SEEKER:
        db.add(JobSeekerProfile(user_id=user.id))

    elif body.primary_persona == PersonaType.FREELANCER:
        db.add(FreelancerProfile(user_id=user.id))

    elif body.primary_persona in (PersonaType.JOB_SEEKER, PersonaType.FREELANCER):
        # User who is both (common case)
        db.add(JobSeekerProfile(user_id=user.id))
        db.add(FreelancerProfile(user_id=user.id))

    db.commit()
    db.refresh(user)

    # ── Send verification email (non-blocking) ────────────
    # background_tasks.add_task(send_verification_email, user.email, verification_token)
    logger.info(f"New user registered: {user.email} | Persona: {user.primary_persona}")

    # ── Return token ──────────────────────────────────────
    access_token = create_access_token(data={"sub": user.id})
    return TokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=build_user_response(user),
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Log in and receive JWT token",
)
async def login(
    body: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    Log in with email and password.
    Returns a JWT access token valid for 7 days.
    """
    user = db.query(User).filter(User.email == body.email.lower()).first()

    # Always run verify_password even if user not found
    # to prevent timing attacks
    password_correct = verify_password(
        body.password,
        user.hashed_password if user else hash_password("dummy")
    )

    if not user or not password_correct:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password. Please try again.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated.",
        )

    if user.is_suspended:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Your account has been suspended: {user.suspension_reason}",
        )

    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()

    logger.info(f"User logged in: {user.email}")
    access_token = create_access_token(data={"sub": user.id})

    return TokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=build_user_response(user),
    )


@router.post(
    "/login/form",
    response_model=TokenResponse,
    summary="OAuth2 form login (for Swagger docs)",
    include_in_schema=False,
)
async def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Standard OAuth2 form login for Swagger UI testing"""
    return await login(
        LoginRequest(email=form_data.username, password=form_data.password),
        db
    )


@router.post(
    "/verify-email",
    summary="Verify email address with token",
)
async def verify_email(
    body: VerifyEmailRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(
        User.email_verification_token == body.token
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token.",
        )

    user.is_email_verified = True
    user.email_verification_token = None
    # Award ECS points for email verification
    user.ecs_score = min(850, user.ecs_score + 25)
    db.commit()

    logger.info(f"Email verified: {user.email}")
    return {"message": "Email verified successfully! Your TrustID is growing stronger."}


@router.post(
    "/forgot-password",
    summary="Request password reset email",
)
async def forgot_password(
    body: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == body.email.lower()).first()

    # Always return success — don't reveal if email exists
    if user:
        reset_token = secrets.token_urlsafe(32)
        user.password_reset_token = reset_token
        user.password_reset_expires = datetime.utcnow() + timedelta(hours=1)
        db.commit()
        # background_tasks.add_task(send_password_reset_email, user.email, reset_token)
        logger.info(f"Password reset requested: {user.email}")

    return {
        "message": "If an account exists with this email, you will receive a reset link shortly."
    }


@router.post(
    "/reset-password",
    summary="Reset password using token from email",
)
async def reset_password(
    body: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(
        User.password_reset_token == body.token
    ).first()

    if not user or user.password_reset_expires < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token. Please request a new one.",
        )

    user.hashed_password = hash_password(body.new_password)
    user.password_reset_token = None
    user.password_reset_expires = None
    db.commit()

    logger.info(f"Password reset completed: {user.email}")
    return {"message": "Password reset successfully. Please log in with your new password."}


@router.post(
    "/change-password",
    summary="Change password when logged in",
)
async def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    current_user.hashed_password = hash_password(body.new_password)
    db.commit()

    return {"message": "Password changed successfully."}


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the currently authenticated user",
)
async def get_me(current_user: User = Depends(get_current_user)):
    """Returns the current user's profile data"""
    return build_user_response(current_user)


@router.post(
    "/resend-verification",
    summary="Resend email verification link",
)
async def resend_verification(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.is_email_verified:
        return {"message": "Your email is already verified."}

    new_token = secrets.token_urlsafe(32)
    current_user.email_verification_token = new_token
    db.commit()

    # background_tasks.add_task(send_verification_email, current_user.email, new_token)
    return {"message": "Verification email resent. Please check your inbox."}