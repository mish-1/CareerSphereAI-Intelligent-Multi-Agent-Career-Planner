"""Firebase authentication service for token verification and user management."""

from __future__ import annotations

import json
import logging
from typing import Any

from backend.config import get_settings

logger = logging.getLogger(__name__)

_firebase_app = None


def initialize_firebase() -> Any:
    """Initialize Firebase Admin SDK if credentials are available."""
    global _firebase_app
    
    if _firebase_app is not None:
        return _firebase_app
    
    settings = get_settings()
    
    # If Firebase is not configured, return None (dev mode)
    if not settings.firebase_project_id:
        logger.info("Firebase not configured - running in dev mode")
        return None
    
    try:
        import firebase_admin
        from firebase_admin import credentials
        
        # Build service account dict from environment variables
        service_account_dict = {
            "type": "service_account",
            "project_id": settings.firebase_project_id,
            "private_key_id": settings.firebase_private_key_id or "",
            "private_key": settings.firebase_private_key.replace("\\n", "\n") if settings.firebase_private_key else "",
            "client_email": settings.firebase_client_email or "",
            "client_id": "",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
        
        cred = credentials.Certificate(service_account_dict)
        _firebase_app = firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin SDK initialized successfully")
        return _firebase_app
        
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        # Fall back to dev mode
        return None


async def verify_firebase_token(token: str) -> dict[str, Any] | None:
    """Verify a Firebase ID token and return user info."""
    try:
        import firebase_admin
        from firebase_admin import auth
        
        firebase_app = initialize_firebase()
        if firebase_app is None:
            logger.debug("Firebase not initialized - returning mock user")
            return None
        
        # Verify the token
        decoded_token = auth.verify_id_token(token)
        
        return {
            "uid": decoded_token.get("uid"),
            "email": decoded_token.get("email"),
            "email_verified": decoded_token.get("email_verified", False),
            "name": decoded_token.get("name"),
            "picture": decoded_token.get("picture"),
            "auth_source": "firebase",
        }
        
    except Exception as e:
        logger.warning(f"Firebase token verification failed: {e}")
        return None


async def get_firebase_user(uid: str) -> dict[str, Any] | None:
    """Get user info from Firebase by UID."""
    try:
        import firebase_admin
        from firebase_admin import auth
        
        firebase_app = initialize_firebase()
        if firebase_app is None:
            return None
        
        user = auth.get_user(uid)
        return {
            "uid": user.uid,
            "email": user.email,
            "email_verified": user.email_verified,
            "display_name": user.display_name,
            "photo_url": user.photo_url,
        }
        
    except Exception as e:
        logger.error(f"Failed to get Firebase user: {e}")
        return None
