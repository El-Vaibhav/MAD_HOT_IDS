from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .utils import decode_token

# THIS LINE FIXES EVERYTHING
security = HTTPBearer(auto_error=False)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        return decode_token(credentials.credentials)
    except:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_current_user_optional(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        if credentials:
            return decode_token(credentials.credentials)
        return None
    except:
        return None