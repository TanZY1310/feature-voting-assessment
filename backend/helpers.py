from datetime import datetime, timedelta, timezone

from sqlalchemy import update
from sqlalchemy.orm import Session

from models.counter import Counter


def utcnow_iso() -> str:
    # Mirrors the mock's `new Date().toISOString()` format (ms precision, Z suffix).
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def days_ago(days: int, hours: int = 0) -> str:
    return (datetime.now(timezone.utc) - timedelta(days=days, hours=hours)).isoformat()


def next_id(db: Session, name: str, prefix: str) -> str:
    value = db.scalar(
        update(Counter)
        .where(Counter.name == name)
        .values(value=Counter.value + 1)
        .returning(Counter.value)
    )
    if value is None:
        db.add(Counter(name=name, value=1))
        db.flush()
        value = 1
    return f"{prefix}{value}"