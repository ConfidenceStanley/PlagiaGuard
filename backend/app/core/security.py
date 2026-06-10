# backend/app/core/security.py

import bcrypt
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from app.core.config import settings


# ─────────────────────────────────────────
# PASSWORD HASHING
# ─────────────────────────────────────────

def hash_password(plain_password: str) -> str:
    """
    Hash a plain text password using bcrypt.
    Never store plain text passwords.
    """
    password_bytes = plain_password.encode("utf-8")
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against its bcrypt hash.
    Returns True if match, False otherwise.
    """
    try:
        password_bytes = plain_password.encode("utf-8")
        hashed_bytes   = hashed_password.encode("utf-8")
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
        return False


# ─────────────────────────────────────────
# JWT TOKEN HANDLING
# ─────────────────────────────────────────

def create_access_token(data: dict) -> str:
    """
    Create a signed JWT access token.

    Args:
        data: Payload to encode (sub, role, email, etc.)

    Returns:
        Encoded JWT string

    Uses JWT_EXPIRE_HOURS from config.py
    """
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        hours=settings.JWT_EXPIRE_HOURS      # ← matches config.py
    )

    to_encode.update({"exp": expire})

    token = jwt.encode(
        to_encode,
        settings.JWT_SECRET,                 # ← matches config.py
        algorithm=settings.JWT_ALGORITHM     # ← matches config.py
    )

    return token


def decode_access_token(token: str) -> dict:
    """
    Decode and verify a JWT token.

    Returns:
        Decoded payload dict

    Raises:
        JWTError if token is invalid or expired
    """
    payload = jwt.decode(
        token,
        settings.JWT_SECRET,                 # ← matches config.py
        algorithms=[settings.JWT_ALGORITHM]  # ← matches config.py
    )
    return payload