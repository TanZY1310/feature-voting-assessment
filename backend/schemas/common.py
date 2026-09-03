from pydantic import BaseModel, ConfigDict

STATUS_UNDER_REVIEW = "under_review"
STATUS_PLANNED = "planned"
STATUS_IN_PROGRESS = "in_progress"
STATUS_RELEASED = "released"
STATUS_DECLINED = "declined"
STATUS_REDIRECTED = "redirected"

STATUSES = {
    STATUS_UNDER_REVIEW,
    STATUS_PLANNED,
    STATUS_IN_PROGRESS,
    STATUS_RELEASED,
    STATUS_DECLINED,
    STATUS_REDIRECTED,
}

STATUS_LABELS = {
    STATUS_UNDER_REVIEW: "Under Review",
    STATUS_PLANNED: "Planned",
    STATUS_IN_PROGRESS: "In Progress",
    STATUS_RELEASED: "Released",
    STATUS_DECLINED: "Declined",
    STATUS_REDIRECTED: "Redirected",
}

ACTIVE_STATUSES = {
    STATUS_UNDER_REVIEW,
    STATUS_PLANNED,
    STATUS_IN_PROGRESS,
}

SORT_SUPPORT = "support"
SORT_NEWEST = "newest"


def to_camel(value: str) -> str:
    parts = value.split("_")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


class APIModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel, populate_by_name=True, from_attributes=True
    )