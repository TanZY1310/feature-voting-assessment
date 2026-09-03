from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Vote(Base):
    __tablename__ = "votes"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id"), primary_key=True
    )
    request_id: Mapped[str] = mapped_column(
        ForeignKey("requests.id"), primary_key=True
    )
    created_at: Mapped[str] = mapped_column(String, nullable=False)