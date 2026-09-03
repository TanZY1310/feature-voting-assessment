from schemas.common import APIModel


class StatusBucket(APIModel):
    status: str
    label: str
    count: int


class TopVoted(APIModel):
    id: str
    title: str
    status: str
    support: int


class VotesOverTime(APIModel):
    date: str
    count: int


class Stats(APIModel):
    total_requests: int
    active_requests: int
    total_support: int
    released_requests: int
    status_distribution: list[StatusBucket]
    top_voted: list[TopVoted]
    votes_over_time: list[VotesOverTime]