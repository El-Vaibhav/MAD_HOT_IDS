import os

import bcrypt
from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 2

# FIX: explicitly use bcrypt
def _bcrypt_password_bytes(password: str) -> bytes:
    return password.encode("utf-8")[:72]

# FIX: truncate password (bcrypt limit = 72 bytes)
def hash_password(password: str):
    password_bytes = _bcrypt_password_bytes(password)
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str):
    password_bytes = _bcrypt_password_bytes(plain)
    return bcrypt.checkpw(password_bytes, hashed.encode("utf-8"))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
