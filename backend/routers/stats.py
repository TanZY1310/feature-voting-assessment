from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from auth import require_admin
from database import get_db
from models.request import Request
from models.user import User
from models.vote import Vote
from schemas import Stats, StatusBucket, TopVoted, VotesOverTime
from schemas.common import ACTIVE_STATUSES, STATUS_LABELS, STATUS_RELEASED
from serializers import support_count

router = APIRouter(tags=["stats"])


@router.get("/stats", response_model=Stats)
def get_stats(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> Stats:
    total_requests = db.scalar(select(func.count()).select_from(Request)) or 0
    active_requests = (
        db.scalar(
            select(func.count())
            .select_from(Request)
            .where(Request.status.in_(ACTIVE_STATUSES))
        )
        or 0
    )
    total_support = db.scalar(select(func.count()).select_from(Vote)) or 0
    released_requests = (
        db.scalar(
            select(func.count())
            .select_from(Request)
            .where(Request.status == STATUS_RELEASED)
        )
        or 0
    )

    status_distribution = []
    for status, label in STATUS_LABELS.items():
        count = (
            db.scalar(
                select(func.count())
                .select_from(Request)
                .where(Request.status == status)
            )
            or 0
        )
        status_distribution.append(
            StatusBucket(status=status, label=label, count=count)
        )

    requests = db.scalars(select(Request)).all()
    supports = {r.id: support_count(db, r.id) for r in requests}
    top = sorted(
        requests, key=lambda r: (supports[r.id], r.created_at), reverse=True
    )[:5]
    top_voted = [
        TopVoted(id=r.id, title=r.title, status=r.status, support=supports[r.id])
        for r in top
    ]

    today = datetime.now(timezone.utc).date()
    buckets = {(today - timedelta(days=i)).isoformat(): 0 for i in range(29, -1, -1)}
    for created_at in db.scalars(select(Vote.created_at)).all():
        key = created_at[:10]
        if key in buckets:
            buckets[key] += 1
    votes_over_time = [
        VotesOverTime(date=date, count=count) for date, count in buckets.items()
    ]

    return Stats(
        total_requests=total_requests,
        active_requests=active_requests,
        total_support=total_support,
        released_requests=released_requests,
        status_distribution=status_distribution,
        top_voted=top_voted,
        votes_over_time=votes_over_time,
    )