from fastapi import APIRouter, HTTPException
from .schemas import UserCreate, UserLogin
from .utils import hash_password, verify_password, create_access_token
from db_mongo import users_collection

router = APIRouter()

@router.post("/register")
def register(user: UserCreate):
    existing = users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    users_collection.insert_one({
        "email": user.email,
        "password": hash_password(user.password)
    })

    return {"message": "User registered successfully"}


@router.post("/login")
def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})

    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"email": user.email})

    return {
        "access_token": token,
        "token_type": "bearer"
    }