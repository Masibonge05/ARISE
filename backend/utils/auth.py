"""
backend/utils/auth.py
JWT token creation/verification and password hashing.
Uses bcrypt directly to avoid passlib/bcrypt version conflicts.
"""
import bcrypt
import jwt
import logging
from datetime import datetime, timedelta
from typing import Optional
from backend.config.settings import settings

logger = logging.getLogger("arise.utils.auth")

# ── Password hashing (direct bcrypt) ─────────────────────────────────────────

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False


# ── JWT tokens ────────────────────────────────────────────────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Creates a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Decodes and validates a JWT token. Returns payload or None."""
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except jwt.ExpiredSignatureError:
        logger.warning("Token has expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {e}")
        return None


def create_reset_token(email: str) -> str:
    """Creates a short-lived password reset token (1 hour)."""
    return create_access_token({"sub": email, "type": "reset"}, timedelta(hours=1))


def create_verify_token(email: str) -> str:
    """Creates an email verification token (24 hours)."""
    return create_access_token({"sub": email, "type": "verify"}, timedelta(hours=24))