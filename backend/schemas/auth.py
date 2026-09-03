from pydantic import BaseModel

from schemas.common import APIModel


class LoginIn(BaseModel):
    email: str
    password: str


class UserOut(APIModel):
    id: str
    name: str
    role: str


class LoginOut(BaseModel):
    token: str
    user: UserOut