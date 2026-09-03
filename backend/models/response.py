from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class OfficialResponse(Base):
    __tablename__ = "official_responses"

    request_id: Mapped[str] = mapped_column(
        ForeignKey("requests.id"), primary_key=True
    )
    author_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    body: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[str] = mapped_column(String, nullable=False)
    updated_at: Mapped[str] = mapped_column(String, nullable=False)