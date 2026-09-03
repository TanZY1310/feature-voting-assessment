from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import create_token, get_current_user, verify_password
from database import get_db
from errors import AppError, ErrorCode
from models.user import User
from schemas import LoginIn, LoginOut, UserOut

router = APIRouter(tags=["auth"])


@router.post("/auth/login", response_model=LoginOut)
def login(body: LoginIn, db: Session = Depends(get_db)) -> LoginOut:
    user = db.query(User).filter(User.email == body.email).first()
    if user is None or not verify_password(body.password, user.password_hash):
        raise AppError("Invalid email or password", ErrorCode.UNAUTHORIZED)
    return LoginOut(token=create_token(user), user=UserOut.model_validate(user))


@router.get("/session", response_model=UserOut)
def get_session(user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(user)