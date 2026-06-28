import os

from fastapi import APIRouter, HTTPException, Depends, Request, Response
from .schemas import UserCreate, UserLogin
from .dependencies import get_current_user
from .utils import ACCESS_TOKEN_COOKIE, ACCESS_TOKEN_EXPIRE_HOURS, hash_password, verify_password, create_access_token
from db_mongo import users_collection

router = APIRouter()

MIN_PASSWORD_LENGTH = 12
COMMON_PASSWORDS = {"password", "password123", "12345678", "123456789", "qwerty123"}
COOKIE_SECURE = os.getenv("COOKIE_SECURE")
COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE")

# Simple in-memory rate limiter. Use Redis or another shared store for multi-instance production.
_rate_limits = {}


def _is_local_origin(origin: str) -> bool:
    return "localhost" in origin or "127.0.0.1" in origin

def _cookie_options(request: Request):
    origin = request.headers.get("origin", "")

    if COOKIE_SECURE is not None:
        secure = COOKIE_SECURE.lower() == "true"
    else:
        secure = not _is_local_origin(origin)

    if COOKIE_SAMESITE:
        samesite = COOKIE_SAMESITE.lower()
    else:
        samesite = "lax" if _is_local_origin(origin) else "none"

    return {"secure": secure, "samesite": samesite}

def _client_key(request: Request, action: str) -> str:
    forwarded_for = request.headers.get("x-forwarded-for", "")
    ip = forwarded_for.split(",")[0].strip() or (request.client.host if request.client else "unknown")
    return f"{action}:{ip}"

def _check_rate_limit(key: str, limit: int, window_seconds: int):
    from time import time

    now = time()
    attempts = [ts for ts in _rate_limits.get(key, []) if now - ts < window_seconds]
    if len(attempts) >= limit:
        raise HTTPException(status_code=429, detail="Too many attempts. Please try again later")
    attempts.append(now)
    _rate_limits[key] = attempts

def _validate_password(password: str):
    if len(password) < MIN_PASSWORD_LENGTH:
        raise HTTPException(status_code=400, detail=f"Password must be at least {MIN_PASSWORD_LENGTH} characters long")
    if password.strip() != password or not password.strip():
        raise HTTPException(status_code=400, detail="Password cannot be empty or start/end with spaces")
    lowered = password.lower()
    if lowered in COMMON_PASSWORDS or "password" in lowered:
        raise HTTPException(status_code=400, detail="Password is too common")
    if not any(ch.islower() for ch in password) or not any(ch.isupper() for ch in password) or not any(ch.isdigit() for ch in password):
        raise HTTPException(status_code=400, detail="Password must include uppercase, lowercase, and numeric characters")

@router.post("/register")
def register(user: UserCreate, request: Request):
    _check_rate_limit(_client_key(request, "register"), limit=5, window_seconds=15 * 60)
    _validate_password(user.password)
    existing = users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Registration could not be completed")

    users_collection.insert_one({
        "email": user.email,
        "password": hash_password(user.password)
    })

    return {"message": "User registered successfully"}


@router.post("/login")
def login(user: UserLogin, request: Request, response: Response):
    _check_rate_limit(_client_key(request, "login"), limit=10, window_seconds=15 * 60)
    db_user = users_collection.find_one({"email": user.email})

    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(db_user["_id"]), "email": db_user["email"]})
    cookie_options = _cookie_options(request)
    response.set_cookie(
        key=ACCESS_TOKEN_COOKIE,
        value=token,
        max_age=ACCESS_TOKEN_EXPIRE_HOURS * 60 * 60,
        httponly=True,
        secure=cookie_options["secure"],
        samesite=cookie_options["samesite"],
    )

    return {"message": "Login successful", "email": db_user["email"]}

@router.get("/me")
def me(user: dict = Depends(get_current_user)):
    return {"email": user.get("email"), "sub": user.get("sub")}


@router.post("/logout")
def logout(request: Request, response: Response):
    cookie_options = _cookie_options(request)
    response.delete_cookie(
        ACCESS_TOKEN_COOKIE,
        secure=cookie_options["secure"],
        samesite=cookie_options["samesite"],
    )
    return {"message": "Logged out"}
