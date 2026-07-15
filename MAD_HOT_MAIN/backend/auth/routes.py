from fastapi import APIRouter, HTTPException
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os
from dotenv import load_dotenv
from .schemas import UserCreate, UserLogin, GoogleLogin
from .utils import hash_password, verify_password, create_access_token
from db_mongo import users_collection
from datetime import datetime
load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

router = APIRouter()

def verify_google_token(token: str):
    try:
        print("GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID)

        info = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )

        print("Verified Google user:", info)

        return info

    except Exception as e:
        print("Google verification error:", repr(e))
        raise HTTPException(
            status_code=401,
            detail="Invalid Google token"
        )

@router.post("/register")
def register(user: UserCreate):
    existing = users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    users_collection.insert_one({
        "email": user.email,
        "password": hash_password(user.password),
        "legacy_access": False,
        "created_at": datetime.utcnow(),
        "plan": "Free"
    })

    return {"message": "User registered successfully"}


@router.post("/login")
def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})

    if not db_user:
     raise HTTPException(
        status_code=401,
        detail="Invalid credentials"
    )

    # Google-only account
    if db_user.get("provider") == "google":
     raise HTTPException(
        status_code=400,
        detail="This account uses Google Sign-In. Please continue with Google."
    )

    if not verify_password(user.password, db_user["password"]):
     raise HTTPException(
        status_code=401,
        detail="Invalid credentials"
    )


    token = create_access_token({"email": user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "legacy_access": db_user.get("legacy_access", False)
    }

@router.post("/google-login")
def google_login(data: GoogleLogin):

    # Verify Google token
    google_user = verify_google_token(data.credential)

    email = google_user.get("email")

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email not found in Google account"
        )

    # -------------------------
    # Existing User Required
    # -------------------------

    db_user = users_collection.find_one({"email": email})

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="Account not found. Please register first before using Google Sign-In."
        )

    # -------------------------
    # Update Google information
    # -------------------------

    users_collection.update_one(
        {"email": email},
        {
            "$set": {
                "google_id": google_user.get("sub"),
                "provider": "google",
                "profile_picture": google_user.get("picture"),
                "last_login": datetime.utcnow()
            }
        }
    )

    token = create_access_token({"email": email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "legacy_access": db_user.get("legacy_access", False)
    }

@router.post("/google-register")
def google_register(data: GoogleLogin):

    # Verify Google token
    google_user = verify_google_token(data.credential)

    email = google_user.get("email")

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email not found in Google account"
        )

    # Check whether account already exists
    existing = users_collection.find_one({"email": email})

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Account already exists. Please login instead."
        )

    # Create new user
    users_collection.insert_one({
        "email": email,
        "password": None,
        "google_id": google_user.get("sub"),
        "provider": "google",
        "profile_picture": google_user.get("picture"),
        "legacy_access": False,
        "created_at": datetime.utcnow(),
        "last_login": datetime.utcnow(),
        "plan": "Free"
    })

    token = create_access_token({"email": email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "legacy_access": False
    }