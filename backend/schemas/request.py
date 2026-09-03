from pydantic import BaseModel

from schemas.common import APIModel


class AuthorRef(APIModel):
    id: str
    name: str


class MergedRef(APIModel):
    id: str
    title: str


class RequestCreate(BaseModel):
    title: str
    description: str = ""


class RequestUpdate(BaseModel):
    title: str
    description: str = ""


class StatusSet(BaseModel):
    status: str


class CommentCreate(BaseModel):
    body: str


class OfficialResponseSet(BaseModel):
    body: str


class MergeIn(BaseModel):
    into: str


class RequestDelete(APIModel):
    id: str


class CommentOut(APIModel):
    id: str
    request_id: str
    author: AuthorRef
    body: str
    created_at: str


class OfficialResponseOut(APIModel):
    request_id: str
    author: AuthorRef
    body: str
    created_at: str
    updated_at: str


class ActivityOut(APIModel):
    id: str
    request_id: str
    type: str
    actor: AuthorRef
    detail: str
    created_at: str


class RequestSummary(APIModel):
    id: str
    title: str
    status: str
    support: int
    comment_count: int
    voted_by_me: bool
    author: AuthorRef
    merged_into: str | None
    created_at: str


class RequestDetail(RequestSummary):
    description: str
    can_vote: bool
    merged_into_request: MergedRef | None = None
    merged_from: list[MergedRef] = []
    official_response: OfficialResponseOut | None = None
    comments: list[CommentOut] = []
    activity: list[ActivityOut] = []
    updated_at: str


class RequestList(APIModel):
    items: list[RequestSummary]
    total: int