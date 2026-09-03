"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-09-03

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("password_hash", sa.String(), nullable=False),
        sa.Column("role", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_table(
        "requests",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=False),
        sa.Column("author_id", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("merged_into", sa.String(), nullable=True),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.Column("updated_at", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["merged_into"], ["requests.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "votes",
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("request_id", sa.String(), nullable=False),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["request_id"], ["requests.id"]),
        sa.PrimaryKeyConstraint("user_id", "request_id"),
    )
    op.create_index("ix_votes_request_id", "votes", ["request_id"])
    op.create_table(
        "comments",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("request_id", sa.String(), nullable=False),
        sa.Column("author_id", sa.String(), nullable=False),
        sa.Column("body", sa.String(), nullable=False),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["request_id"], ["requests.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_comments_request_id", "comments", ["request_id"])
    op.create_table(
        "official_responses",
        sa.Column("request_id", sa.String(), nullable=False),
        sa.Column("author_id", sa.String(), nullable=False),
        sa.Column("body", sa.String(), nullable=False),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.Column("updated_at", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["request_id"], ["requests.id"]),
        sa.PrimaryKeyConstraint("request_id"),
    )
    op.create_table(
        "activity",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("request_id", sa.String(), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("actor_id", sa.String(), nullable=False),
        sa.Column("detail", sa.String(), nullable=False),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(["actor_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["request_id"], ["requests.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_activity_request_id", "activity", ["request_id"])
    op.create_table(
        "counters",
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("value", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("name"),
    )


def downgrade() -> None:
    op.drop_table("counters")
    op.drop_table("activity")
    op.drop_table("official_responses")
    op.drop_table("comments")
    op.drop_table("votes")
    op.drop_table("requests")
    op.drop_table("users")