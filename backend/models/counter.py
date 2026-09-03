from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Counter(Base):
    __tablename__ = "counters"

    name: Mapped[str] = mapped_column(String, primary_key=True)
    value: Mapped[int] = mapped_column(Integer, nullable=False, default=0)