from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
        
    user_id: int = payload.get("sub")
    if user_id is None:
        raise credentials_exception
        
    # We store the full user dictionary in the payload under 'user'
    user_data = payload.get("user")
    if not user_data:
        raise credentials_exception
        
    return user_data

async def get_current_tenant_id(current_user: dict = Depends(get_current_user)):
    tenant_id = current_user.get("tenant_company_id")
    # For super admins, tenant_company_id might be None, handled at the service level.
    return tenant_id
