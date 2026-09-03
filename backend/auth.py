import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from database import get_db
from errors import AppError, ErrorCode
from models.user import User

SECRET_KEY = os.getenv("JWT_SECRET", "dev-secret-change-me")
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))

security = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def create_token(user: User) -> str:
    payload = {
        "sub": user.id,
        "role": user.role,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        raise AppError("Invalid or expired token", ErrorCode.UNAUTHORIZED)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise AppError("Authentication required", ErrorCode.UNAUTHORIZED)
    payload = decode_token(credentials.credentials)
    user = db.get(User, payload["sub"])
    if user is None:
        raise AppError("Authentication required", ErrorCode.UNAUTHORIZED)
    return user


def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User | None:
    if credentials is None:
        return None
    try:
        payload = decode_token(credentials.credentials)
    except AppError:
        return None
    return db.get(User, payload["sub"])


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise AppError("Admin access required", ErrorCode.FORBIDDEN)
    return user