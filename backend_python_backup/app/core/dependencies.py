# backend/app/core/dependencies.py

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from bson import ObjectId
from app.core.security import decode_access_token
from app.database.connection import get_users_collection

# Bearer token extractor
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Extract and validate the JWT token from request header.
    Returns the current user's data from the database.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode the token
        payload = decode_access_token(credentials.credentials)
        user_id: str = payload.get("sub")

        if user_id is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    # Find user in database
    users_collection = get_users_collection()
    user = users_collection.find_one({"_id": ObjectId(user_id)})

    if user is None:
        raise credentials_exception

    # Check account is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Contact admin."
        )

    return user


def require_student(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """Only allow students."""
    if current_user.get("role") != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to students only."
        )
    return current_user


def require_lecturer(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """Only allow lecturers."""
    if current_user.get("role") != "lecturer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to lecturers only."
        )
    return current_user


def require_admin(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """Only allow admins."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to administrators only."
        )
    return current_user


def require_lecturer_or_admin(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """Allow lecturers or admins."""
    if current_user.get("role") not in ["lecturer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to lecturers and administrators."
        )
    return current_user