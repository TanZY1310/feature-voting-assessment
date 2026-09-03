from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from auth import get_current_user, require_admin
from database import get_db
from errors import AppError, ErrorCode
from helpers import next_id, utcnow_iso
from models.activity import ActivityEntry
from models.comment import Comment
from models.request import Request
from models.response import OfficialResponse
from models.user import User
from schemas import CommentCreate, CommentOut, OfficialResponseOut, OfficialResponseSet
from serializers import comment_out, response_out

router = APIRouter(tags=["comments"])


def _get_request(db: Session, request_id: str) -> Request:
    request = db.get(Request, request_id)
    if not request:
        raise AppError("Request not found", ErrorCode.NOT_FOUND)
    return request


@router.get("/requests/{request_id}/comments", response_model=list[CommentOut])
def list_comments(request_id: str, db: Session = Depends(get_db)) -> list[CommentOut]:
    _get_request(db, request_id)
    comments = db.scalars(
        select(Comment)
        .where(Comment.request_id == request_id)
        .order_by(Comment.created_at.desc())
    ).all()
    return [comment_out(db, c) for c in comments]


@router.post("/requests/{request_id}/comments", response_model=CommentOut)
def add_comment(
    request_id: str,
    body: CommentCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CommentOut:
    _get_request(db, request_id)
    if not body.body or not body.body.strip():
        raise AppError("Comment cannot be empty")
    comment = Comment(
        id=next_id(db, "comment", "c-"),
        request_id=request_id,
        author_id=user.id,
        body=body.body.strip(),
        created_at=utcnow_iso(),
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment_out(db, comment)


@router.put("/requests/{request_id}/response", response_model=OfficialResponseOut)
def set_official_response(
    request_id: str,
    body: OfficialResponseSet,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> OfficialResponseOut:
    _get_request(db, request_id)
    if not body.body or not body.body.strip():
        raise AppError("Response cannot be empty")
    now = utcnow_iso()
    existing = db.get(OfficialResponse, request_id)
    if existing:
        existing.body = body.body.strip()
        existing.updated_at = now
        db.add(
            ActivityEntry(
                id=next_id(db, "activity", "a-"),
                request_id=request_id,
                type="response_edited",
                actor_id=admin.id,
                detail="edited the official response",
                created_at=now,
            )
        )
    else:
        db.add(
            OfficialResponse(
                request_id=request_id,
                author_id=admin.id,
                body=body.body.strip(),
                created_at=now,
                updated_at=now,
            )
        )
        db.add(
            ActivityEntry(
                id=next_id(db, "activity", "a-"),
                request_id=request_id,
                type="response_posted",
                actor_id=admin.id,
                detail="posted an official response",
                created_at=now,
            )
        )
    db.commit()
    response = db.get(OfficialResponse, request_id)
    return response_out(db, response)


@router.delete("/requests/{request_id}/response")
def remove_official_response(
    request_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> None:
    _get_request(db, request_id)
    existing = db.get(OfficialResponse, request_id)
    if existing:
        db.delete(existing)
        db.add(
            ActivityEntry(
                id=next_id(db, "activity", "a-"),
                request_id=request_id,
                type="response_removed",
                actor_id=admin.id,
                detail="removed the official response",
                created_at=utcnow_iso(),
            )
        )
        db.commit()
    return None