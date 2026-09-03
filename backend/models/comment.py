from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    request_id: Mapped[str] = mapped_column(
        ForeignKey("requests.id"), nullable=False
    )
    author_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    body: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[str] = mapped_column(String, nullable=False)