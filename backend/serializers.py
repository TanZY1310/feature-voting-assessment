from sqlalchemy import func, select
from sqlalchemy.orm import Session

from models.activity import ActivityEntry
from models.comment import Comment
from models.request import Request
from models.response import OfficialResponse
from models.user import User
from models.vote import Vote
from schemas.common import ACTIVE_STATUSES
from schemas.request import (
    ActivityOut,
    AuthorRef,
    CommentOut,
    MergedRef,
    OfficialResponseOut,
    RequestDetail,
    RequestSummary,
)


def support_count(db: Session, request_id: str) -> int:
    return db.scalar(
        select(func.count()).select_from(Vote).where(Vote.request_id == request_id)
    )


def comment_count(db: Session, request_id: str) -> int:
    return db.scalar(
        select(func.count())
        .select_from(Comment)
        .where(Comment.request_id == request_id)
    )


def voted_by_me(db: Session, request_id: str, user_id: str | None) -> bool:
    if user_id is None:
        return False
    count = db.scalar(
        select(func.count())
        .select_from(Vote)
        .where(Vote.request_id == request_id, Vote.user_id == user_id)
    )
    return count > 0


def author_ref(db: Session, user_id: str) -> AuthorRef:
    user = db.get(User, user_id)
    return AuthorRef(id=user.id, name=user.name)


def comment_out(db: Session, comment: Comment) -> CommentOut:
    return CommentOut(
        id=comment.id,
        request_id=comment.request_id,
        author=author_ref(db, comment.author_id),
        body=comment.body,
        created_at=comment.created_at,
    )


def response_out(db: Session, response: OfficialResponse) -> OfficialResponseOut:
    return OfficialResponseOut(
        request_id=response.request_id,
        author=author_ref(db, response.author_id),
        body=response.body,
        created_at=response.created_at,
        updated_at=response.updated_at,
    )


def activity_out(db: Session, entry: ActivityEntry) -> ActivityOut:
    return ActivityOut(
        id=entry.id,
        request_id=entry.request_id,
        type=entry.type,
        actor=author_ref(db, entry.actor_id),
        detail=entry.detail,
        created_at=entry.created_at,
    )


def to_summary(
    db: Session, request: Request, current_user_id: str | None = None
) -> RequestSummary:
    return RequestSummary(
        id=request.id,
        title=request.title,
        status=request.status,
        support=support_count(db, request.id),
        comment_count=comment_count(db, request.id),
        voted_by_me=voted_by_me(db, request.id, current_user_id),
        author=author_ref(db, request.author_id),
        merged_into=request.merged_into,
        created_at=request.created_at,
    )


def to_detail(
    db: Session, request: Request, current_user_id: str | None = None
) -> RequestDetail:
    merged_into_request = db.get(Request, request.merged_into) if request.merged_into else None
    merged_from = db.scalars(
        select(Request).where(Request.merged_into == request.id)
    ).all()
    comments = db.scalars(
        select(Comment)
        .where(Comment.request_id == request.id)
        .order_by(Comment.created_at.desc())
    ).all()
    activity = db.scalars(
        select(ActivityEntry)
        .where(ActivityEntry.request_id == request.id)
        .order_by(ActivityEntry.created_at.desc())
    ).all()
    response = db.get(OfficialResponse, request.id)

    return RequestDetail(
        id=request.id,
        title=request.title,
        status=request.status,
        support=support_count(db, request.id),
        comment_count=comment_count(db, request.id),
        voted_by_me=voted_by_me(db, request.id, current_user_id),
        author=author_ref(db, request.author_id),
        merged_into=request.merged_into,
        created_at=request.created_at,
        description=request.description,
        can_vote=bool(current_user_id) and request.status in ACTIVE_STATUSES,
        merged_into_request=(
            MergedRef(id=merged_into_request.id, title=merged_into_request.title)
            if merged_into_request
            else None
        ),
        merged_from=[MergedRef(id=r.id, title=r.title) for r in merged_from],
        official_response=response_out(db, response) if response else None,
        comments=[comment_out(db, c) for c in comments],
        activity=[activity_out(db, a) for a in activity],
        updated_at=request.updated_at,
    )