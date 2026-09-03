from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class ActivityEntry(Base):
    __tablename__ = "activity"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    request_id: Mapped[str] = mapped_column(
        ForeignKey("requests.id"), nullable=False
    )
    type: Mapped[str] = mapped_column(String, nullable=False)
    actor_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    detail: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[str] = mapped_column(String, nullable=False)