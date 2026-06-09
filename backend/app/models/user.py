from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    STUDENT = "student"
    LECTURER = "lecturer"
    ADMIN = "admin"


# ─── Request Models (what frontend sends) ───────────────────

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: UserRole = UserRole.STUDENT
    student_id: Optional[str] = None
    department: Optional[str] = None
    institution: Optional[str] = "PlagiaGuard Institution"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    department: Optional[str] = None
    institution: Optional[str] = None
    student_id: Optional[str] = None


# ─── Response Models (what backend sends back) ───────────────

class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    role: str
    student_id: Optional[str] = None
    department: Optional[str] = None
    institution: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    success: bool
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class RegisterResponse(BaseModel):
    success: bool
    message: str
    user: UserResponse


# ─── Database Model (what gets stored in MongoDB) ────────────

class UserInDB(BaseModel):
    full_name: str
    email: str
    password: str               # hashed password
    role: str
    student_id: Optional[str] = None
    department: Optional[str] = None
    institution: Optional[str] = "PlagiaGuard Institution"
    is_active: bool = True
    is_verified: bool = False
    profile_image: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None