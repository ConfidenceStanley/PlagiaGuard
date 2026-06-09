from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime, timedelta
from bson import ObjectId
from app.models.user import (
    RegisterRequest,
    LoginRequest,
    UpdateProfileRequest,
    LoginResponse,
    RegisterResponse,
    UserResponse,
    UserInDB
)
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.database.connection import get_users_collection, get_notifications_collection

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def format_user(user: dict) -> UserResponse:
    """Convert MongoDB user document to UserResponse"""
    return UserResponse(
        id=str(user["_id"]),
        full_name=user["full_name"],
        email=user["email"],
        role=user["role"],
        student_id=user.get("student_id"),
        department=user.get("department"),
        institution=user.get("institution"),
        is_active=user.get("is_active", True),
        created_at=user["created_at"]
    )


@router.post("/register", response_model=RegisterResponse, status_code=201)
async def register(request: RegisterRequest):
    """Register a new user account"""

    try:
        users_col = get_users_collection()

        # Check if email already exists
        existing_user = users_col.find_one({"email": request.email.lower()})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists."
            )

        # Create user document
        user_data = UserInDB(
            full_name=request.full_name,
            email=request.email.lower(),
            password=hash_password(request.password),
            role=request.role.value,
            student_id=request.student_id,
            department=request.department,
            institution=request.institution,
            created_at=datetime.utcnow()
        )

        # Insert into database
        result = users_col.insert_one(user_data.model_dump())
        new_user = users_col.find_one({"_id": result.inserted_id})

        # Create welcome notification
        notifications_col = get_notifications_collection()
        notifications_col.insert_one({
            "user_id": result.inserted_id,
            "title": "Welcome to PlagiaGuard! 🎉",
            "message": f"Hello {request.full_name}! Your account has been created successfully.",
            "type": "success",
            "is_read": False,
            "created_at": datetime.utcnow()
        })

        return RegisterResponse(
            success=True,
            message="Account created successfully! Please login.",
            user=format_user(new_user)
        )

    except HTTPException:
        raise

    except Exception as e:
        print(f"❌ REGISTER ERROR: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Login and receive JWT token"""

    users_col = get_users_collection()

    # Find user by email
    user = users_col.find_one({"email": request.email.lower()})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Verify password
    if not verify_password(request.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Check account is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Contact your administrator."
        )

    # Generate JWT token
    access_token = create_access_token(
        data={"sub": str(user["_id"]), "role": user["role"]}
    )

    # Update last login time
    users_col.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )

    return LoginResponse(
        success=True,
        access_token=access_token,
        token_type="bearer",
        user=format_user(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Get the currently logged in user profile"""
    return format_user(current_user)


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    request: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile information"""

    users_col = get_users_collection()

    # Build update data (only update provided fields)
    update_data = {}
    if request.full_name:
        update_data["full_name"] = request.full_name
    if request.department:
        update_data["department"] = request.department
    if request.institution:
        update_data["institution"] = request.institution
    if request.student_id:
        update_data["student_id"] = request.student_id

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No update data provided."
        )

    # Update in database
    users_col.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_data}
    )

    # Return updated user
    updated_user = users_col.find_one({"_id": current_user["_id"]})
    return format_user(updated_user)


@router.get("/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    """Get user notifications"""

    notifications_col = get_notifications_collection()

    notifications = list(
        notifications_col.find(
            {"user_id": current_user["_id"]}
        ).sort("created_at", -1).limit(20)
    )

    # Format notifications
    formatted = []
    for notif in notifications:
        formatted.append({
            "id": str(notif["_id"]),
            "title": notif["title"],
            "message": notif["message"],
            "type": notif["type"],
            "is_read": notif["is_read"],
            "created_at": notif["created_at"].isoformat()
        })

    # Count unread
    unread_count = notifications_col.count_documents({
        "user_id": current_user["_id"],
        "is_read": False
    })

    return {
        "success": True,
        "notifications": formatted,
        "unread_count": unread_count
    }


@router.put("/notifications/read-all")
async def mark_all_notifications_read(
    current_user: dict = Depends(get_current_user)
):
    """Mark all notifications as read"""

    notifications_col = get_notifications_collection()
    notifications_col.update_many(
        {"user_id": current_user["_id"], "is_read": False},
        {"$set": {"is_read": True}}
    )

    return {"success": True, "message": "All notifications marked as read"}