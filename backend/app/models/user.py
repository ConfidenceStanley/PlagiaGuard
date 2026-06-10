# backend/app/models/user.py

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum


# ─────────────────────────────────────────
# ENUMS
# ─────────────────────────────────────────

class UserRole(str, Enum):
    STUDENT  = "student"
    LECTURER = "lecturer"
    ADMIN    = "admin"


# ─────────────────────────────────────────
# REQUEST MODELS (what frontend sends)
# ─────────────────────────────────────────

class UserRegister(BaseModel):
    """Data required to create a new account."""
    full_name:   str      = Field(..., min_length=2, max_length=100)
    email:       EmailStr
    password:    str      = Field(..., min_length=8)
    role:        UserRole = UserRole.STUDENT
    student_id:  Optional[str] = None
    department:  Optional[str] = None
    institution: Optional[str] = None


class UserLogin(BaseModel):
    """Data required to log in."""
    email:    EmailStr
    password: str


class UserProfileUpdate(BaseModel):
    """Data allowed to be updated in profile."""
    full_name:   Optional[str] = None
    department:  Optional[str] = None
    institution: Optional[str] = None
    student_id:  Optional[str] = None


# ─────────────────────────────────────────
# RESPONSE MODELS (what backend returns)
# ─────────────────────────────────────────

class UserResponse(BaseModel):
    """User info returned to frontend (no password)."""
    id:            str
    full_name:     str
    email:         str
    role:          str
    department:    Optional[str] = None
    student_id:    Optional[str] = None
    institution:   Optional[str] = None
    is_active:     bool = True
    is_verified:   bool = False
    profile_image: Optional[str] = None


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type:   str = "bearer"


class LoginResponse(BaseModel):
    """Full login response including token and user."""
    success:      bool
    access_token: str
    token_type:   str
    user:         UserResponse