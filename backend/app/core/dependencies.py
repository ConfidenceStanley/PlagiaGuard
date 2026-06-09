from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_access_token
from app.database.connection import get_users_collection
from bson import ObjectId

# Bearer token scheme
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get the currently logged in user from JWT token"""

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token. Please login again.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Decode the token
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise credentials_exception

    # Get user ID from token
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    # Find user in database
    users_col = get_users_collection()
    user = users_col.find_one({"_id": ObjectId(user_id)})

    if user is None:
        raise credentials_exception

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Contact admin."
        )

    return user


def require_student(current_user: dict = Depends(get_current_user)):
    """Only allow students"""
    if current_user["role"] not in ["student", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Student account required."
        )
    return current_user


def require_lecturer(current_user: dict = Depends(get_current_user)):
    """Only allow lecturers"""
    if current_user["role"] not in ["lecturer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Lecturer account required."
        )
    return current_user


def require_admin(current_user: dict = Depends(get_current_user)):
    """Only allow admins"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin account required."
        )
    return current_user