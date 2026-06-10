# backend/app/routers/auth.py

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.concurrency import run_in_threadpool   # ← ADD THIS
from datetime import datetime, timezone
from bson import ObjectId
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.database.connection import get_users_collection, get_notifications_collection
from app.models.user import UserRegister, UserLogin, UserResponse, Token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# ─────────────────────────────────────────
# REGISTER
# ─────────────────────────────────────────
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """Register a new user account."""
    users_collection = get_users_collection()

    # Check if email already exists
    existing_user = users_collection.find_one(
        {"email": user_data.email.lower().strip()}
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    # ── Hash password in threadpool so it doesn't block ──
    hashed_password = await run_in_threadpool(
        hash_password, user_data.password
    )

    now = datetime.now(timezone.utc)

    new_user = {
        "full_name": user_data.full_name.strip(),
        "email": user_data.email.lower().strip(),
        "password": hashed_password,
        "role": user_data.role,
        "student_id": getattr(user_data, "student_id", None),
        "department": getattr(user_data, "department", None),
        "institution": getattr(user_data, "institution", None),
        "is_active": True,
        "is_verified": False,
        "profile_image": None,
        "created_at": now,
        "last_login": None,
    }

    result = users_collection.insert_one(new_user)
    user_id = str(result.inserted_id)

    # Create welcome notification
    notifications_collection = get_notifications_collection()
    notifications_collection.insert_one({
        "user_id": result.inserted_id,
        "title": "Welcome to PlagiaGuard! 🎉",
        "message": f"Hello {user_data.full_name}! Your account has been created successfully.",
        "type": "success",
        "is_read": False,
        "related_doc_id": None,
        "created_at": now,
    })

    return {
        "success": True,
        "message": "Account created successfully. You can now log in.",
        "user": {
            "id": user_id,
            "full_name": user_data.full_name,
            "email": user_data.email.lower(),
            "role": user_data.role,
        }
    }


# ─────────────────────────────────────────
# LOGIN
# ─────────────────────────────────────────
@router.post("/login")
async def login(user_data: UserLogin):
    """Login and receive a JWT access token."""

    print(f"🔐 Login attempt for: {user_data.email}")  # Debug log

    users_collection = get_users_collection()

    # Find user by email
    user = users_collection.find_one(
        {"email": user_data.email.lower().strip()}
    )

    print(f"👤 User found: {user is not None}")  # Debug log

    auth_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password."
    )

    if not user:
        raise auth_error

    # ── Verify password in threadpool so it doesn't block ──
    print("🔑 Verifying password...")  # Debug log

    password_valid = await run_in_threadpool(
        verify_password, user_data.password, user["password"]
    )

    print(f"✅ Password valid: {password_valid}")  # Debug log

    if not password_valid:
        raise auth_error

    # Check account is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact admin."
        )

    # Update last login time
    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.now(timezone.utc)}}
    )

    # Create JWT token
    token = create_access_token(data={
        "sub": str(user["_id"]),
        "role": user["role"],
        "email": user["email"],
    })

    print(f"🎉 Login successful for: {user['email']}")  # Debug log

    return {
        "success": True,
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "full_name": user["full_name"],
            "email": user["email"],
            "role": user["role"],
            "department": user.get("department"),
            "student_id": user.get("student_id"),
        }
    }


# ─────────────────────────────────────────
# GET CURRENT USER
# ─────────────────────────────────────────
@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get the currently logged-in user's profile."""
    return {
        "success": True,
        "user": {
            "id": str(current_user["_id"]),
            "full_name": current_user["full_name"],
            "email": current_user["email"],
            "role": current_user["role"],
            "department": current_user.get("department"),
            "student_id": current_user.get("student_id"),
            "institution": current_user.get("institution"),
            "is_active": current_user.get("is_active", True),
            "is_verified": current_user.get("is_verified", False),
            "profile_image": current_user.get("profile_image"),
            "created_at": current_user.get("created_at"),
            "last_login": current_user.get("last_login"),
        }
    }


# ─────────────────────────────────────────
# UPDATE PROFILE
# ─────────────────────────────────────────
@router.put("/profile")
async def update_profile(
    update_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update the current user's profile information."""
    users_collection = get_users_collection()

    allowed_fields = ["full_name", "department", "institution", "student_id"]
    updates = {
        k: v for k, v in update_data.items()
        if k in allowed_fields and v is not None
    }

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid fields to update."
        )

    users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": updates}
    )

    return {
        "success": True,
        "message": "Profile updated successfully."
    }


# ─────────────────────────────────────────
# GET NOTIFICATIONS
# ─────────────────────────────────────────
@router.get("/notifications")
async def get_notifications(
    current_user: dict = Depends(get_current_user)
):
    """Get all notifications for the current user."""
    notifications_collection = get_notifications_collection()

    notifications = list(
        notifications_collection.find(
            {"user_id": current_user["_id"]}
        ).sort("created_at", -1).limit(20)
    )

    for notif in notifications:
        notif["id"] = str(notif["_id"])
        del notif["_id"]
        notif["user_id"] = str(notif["user_id"])
        if notif.get("related_doc_id"):
            notif["related_doc_id"] = str(notif["related_doc_id"])

    unread_count = notifications_collection.count_documents({
        "user_id": current_user["_id"],
        "is_read": False
    })

    return {
        "success": True,
        "notifications": notifications,
        "unread_count": unread_count
    }


# ─────────────────────────────────────────
# MARK NOTIFICATIONS READ
# ─────────────────────────────────────────
@router.put("/notifications/read-all")
async def mark_all_notifications_read(
    current_user: dict = Depends(get_current_user)
):
    """Mark all notifications as read."""
    notifications_collection = get_notifications_collection()

    notifications_collection.update_many(
        {"user_id": current_user["_id"], "is_read": False},
        {"$set": {"is_read": True}}
    )

    return {
        "success": True,
        "message": "All notifications marked as read."
    }