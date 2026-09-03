from fastapi import APIRouter, Depends
from sqlalchemy import delete
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from errors import AppError, ErrorCode
from helpers import utcnow_iso
from models.request import Request
from models.user import User
from models.vote import Vote
from schemas import RequestSummary
from schemas.common import ACTIVE_STATUSES
from serializers import to_summary

router = APIRouter(tags=["votes"])


@router.put("/requests/{request_id}/vote", response_model=RequestSummary)
def set_vote(
    request_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RequestSummary:
    request = db.get(Request, request_id)
    if not request:
        raise AppError("Request not found", ErrorCode.NOT_FOUND)
    if request.status not in ACTIVE_STATUSES:
        raise AppError("Voting is closed for this request", ErrorCode.NOT_OPEN)
    db.execute(
        sqlite_insert(Vote)
        .values(user_id=user.id, request_id=request_id, created_at=utcnow_iso())
        .on_conflict_do_nothing()
    )
    db.commit()
    return to_summary(db, request, user.id)


@router.delete("/requests/{request_id}/vote", response_model=RequestSummary)
def clear_vote(
    request_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RequestSummary:
    request = db.get(Request, request_id)
    if not request:
        raise AppError("Request not found", ErrorCode.NOT_FOUND)
    db.execute(
        delete(Vote).where(Vote.request_id == request_id, Vote.user_id == user.id)
    )
    db.commit()
    return to_summary(db, request, user.id)