from __future__ import annotations

import logging

from fastapi import Header, HTTPException

from backend.config import get_settings
from backend.services.firebase_service import verify_firebase_token

logger = logging.getLogger(__name__)


async def get_current_user_optional(authorization: str | None = Header(default=None)) -> dict | None:
    """Get current user from Authorization header.
    
    Attempts Firebase token verification first.
    Falls back to dev mock user if Firebase not configured.
    """
    if not authorization:
        return None

    if not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing bearer token")

    settings = get_settings()
    
    # Try to verify with Firebase if configured
    if settings.firebase_project_id:
        user = await verify_firebase_token(token)
        if user:
            return user
        # If verification failed, raise error (token is invalid)
        raise HTTPException(status_code=401, detail="Invalid Firebase token")
    
    # Dev mode: return mock user
    logger.debug("Firebase not configured - using dev mock user")
    return {"uid": "dev-user", "email": "dev@careersphere.local", "auth_source": "mock"}
