import os

import bcrypt
from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY or len(SECRET_KEY) < 32:
    raise RuntimeError("SECRET_KEY environment variable must be set to at least 32 characters")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 2
ACCESS_TOKEN_COOKIE = "access_token"

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
    now = datetime.utcnow()
    expire = now + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"iat": now, "exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
