from sqlalchemy import delete
from sqlalchemy.orm import Session

from auth import hash_password
from database import SessionLocal
from helpers import days_ago
from models import (
    ActivityEntry,
    Comment,
    Counter,
    OfficialResponse,
    Request,
    User,
    Vote,
)

USERS = [
    ("u-1", "Lee Park", "lee@example.com", "admin"),
    ("u-2", "Sam Rivera", "sam@example.com", "user"),
    ("u-3", "Alex Chen", "alex@example.com", "user"),
    ("u-4", "Maya Patel", "maya@example.com", "user"),
    ("u-5", "Jordan Lee", "jordan@example.com", "user"),
    ("u-6", "Priya Nair", "priya@example.com", "user"),
    ("u-7", "Diego Ramirez", "diego@example.com", "user"),
    ("u-8", "Hannah Kim", "hannah@example.com", "user"),
    ("u-9", "Omar Haddad", "omar@example.com", "user"),
    ("u-10", "Ella Fischer", "ella@example.com", "user"),
    ("u-11", "Noah Tanaka", "noah@example.com", "user"),
    ("u-12", "Chloe Weber", "chloe@example.com", "user"),
]

DEV_PASSWORD = "password"

REQUESTS = [
    ("req-1", "Dark mode for the whole app",
     "The admin panels, request lists, and comment threads should respect a dark theme alongside the existing light theme. Follows system preference with a manual override.",
     "u-2", "released", None, (28, 0), (6, 0)),
    ("req-2", "Export my votes to CSV",
     "Users should be able to download a CSV of the requests they voted on, including status and current support. Useful for tracking the roadmap they care about.",
     "u-3", "planned", None, (24, 0), (13, 0)),
    ("req-3", "Keyboard shortcuts for the review queue",
     "Admins should be able to triage faster with shortcuts: jump between requests, move status, and merge duplicates without reaching for the mouse.",
     "u-4", "in_progress", None, (20, 0), (2, 0)),
    ("req-4", "Real-time vote counts",
     "When other users vote, the count should update live instead of requiring a refresh. Explore subscribing to vote events for the requests a user is viewing.",
     "u-2", "under_review", None, (3, 0), (3, 0)),
    ("req-5", "GitHub issue sync",
     "Automatically create a GitHub issue when a feature request is accepted, and link it back so supporters can follow progress in the repo.",
     "u-3", "declined", None, (18, 0), (15, 0)),
    ("req-6", "Team workspaces",
     "Let organizations group requests by workspace so internal tools and client feedback stay separate but share the same voting engine.",
     "u-4", "under_review", None, (2, 0), (2, 0)),
    ("req-7", "Bulk moderation tools",
     "Admins need to select multiple requests and decline or redirect them in one pass, with a single confirm step and a full activity trail.",
     "u-2", "planned", None, (12, 0), (9, 0)),
    ("req-8", "API rate-limit dashboard",
     "A usage view showing per-key request counts, throttling events, and the remaining quota window so heavy consumers can self-diagnose.",
     "u-3", "released", None, (15, 0), (4, 0)),
    ("req-9", "Self-serve billing",
     "Upgrade, downgrade, and see invoices without talking to sales. Includes a seat-based plan model and prorated changes.",
     "u-4", "in_progress", None, (8, 0), (1, 0)),
    ("req-10", "Dark mode toggle in the header",
     "A quick toggle in the app header to switch themes without touching settings.",
     "u-2", "redirected", "req-1", (26, 0), (24, 0)),
    ("req-11", "Offline support",
     "Cache the browse and detail pages so the app is usable on flaky connections.",
     "u-3", "declined", None, (10, 0), (7, 0)),
    ("req-12", "Mobile push notifications",
     "Notify users when a request they voted on changes status or receives an official response.",
     "u-4", "under_review", None, (1, 0), (1, 0)),
]

# [request_id, user_id, days_ago] — one vote per user per request (vote-once).
VOTES = [
    ["req-1", "u-2", 27], ["req-1", "u-3", 26], ["req-1", "u-4", 25], ["req-1", "u-1", 24],
    ["req-1", "u-5", 23], ["req-1", "u-6", 22], ["req-1", "u-7", 21], ["req-1", "u-8", 18],
    ["req-1", "u-9", 16], ["req-1", "u-10", 14], ["req-1", "u-11", 12], ["req-1", "u-12", 9],
    ["req-2", "u-2", 23], ["req-2", "u-4", 21], ["req-2", "u-3", 18], ["req-2", "u-5", 14], ["req-2", "u-8", 11],
    ["req-3", "u-2", 19], ["req-3", "u-3", 17], ["req-3", "u-4", 15], ["req-3", "u-1", 14],
    ["req-3", "u-6", 13], ["req-3", "u-7", 10], ["req-3", "u-9", 8], ["req-3", "u-10", 5],
    ["req-4", "u-3", 2], ["req-4", "u-4", 2], ["req-4", "u-2", 2], ["req-4", "u-1", 1], ["req-4", "u-5", 1], ["req-4", "u-6", 0],
    ["req-5", "u-2", 17], ["req-5", "u-4", 16], ["req-5", "u-3", 14], ["req-5", "u-7", 13],
    ["req-6", "u-2", 1], ["req-6", "u-3", 1], ["req-6", "u-1", 0],
    ["req-7", "u-4", 11], ["req-7", "u-2", 10], ["req-7", "u-3", 9], ["req-7", "u-1", 8],
    ["req-7", "u-8", 7], ["req-7", "u-9", 6], ["req-7", "u-10", 5],
    ["req-8", "u-2", 14], ["req-8", "u-4", 13], ["req-8", "u-3", 11], ["req-8", "u-1", 9], ["req-8", "u-11", 7],
    ["req-9", "u-2", 7], ["req-9", "u-3", 7], ["req-9", "u-4", 6], ["req-9", "u-1", 6],
    ["req-9", "u-5", 5], ["req-9", "u-6", 4], ["req-9", "u-7", 3], ["req-9", "u-8", 2], ["req-9", "u-9", 1],
    ["req-10", "u-3", 25], ["req-10", "u-4", 25], ["req-10", "u-2", 24], ["req-10", "u-1", 24],
    ["req-11", "u-4", 9], ["req-11", "u-2", 8],
    ["req-12", "u-2", 0], ["req-12", "u-3", 0], ["req-12", "u-4", 0], ["req-12", "u-1", 0], ["req-12", "u-5", 0],
]

# [request_id, author_id, body, days_ago]
COMMENTS = [
    ["req-1", "u-3", "Would this also cover the request list and admin panels, or just the main app?", 25],
    ["req-1", "u-2", "Everything — we want one consistent theme across the whole product.", 24],
    ["req-1", "u-4", "Please make sure the contrast passes WCAG in dark mode.", 10],
    ["req-4", "u-4", "Polling every few seconds would be a simpler first step than a websocket.", 2],
    ["req-4", "u-2", "Agreed — polling is fine to start, we can move to events later.", 1],
    ["req-9", "u-3", "Will annual plans get a discount like the current pricing page?", 6],
    ["req-9", "u-2", "Yes — 20% on annual, same as today.", 5],
    ["req-12", "u-2", "Only for status changes, or also for official responses?", 0],
]

RESPONSES = [
    ("req-1", "u-1", "Shipped in v2.4. Toggle lives in the header and follows system preference by default. Thanks to everyone who voted.", 7),
    ("req-5", "u-1", "We reviewed this and it duplicates our existing GitHub webhooks integration. Not accepting as a standalone request.", 15),
    ("req-9", "u-1", "Building now. Targeted for the next billing release — invoices will be downloadable from the account page.", 1),
]

# [request_id, type, actor_id, detail, days_ago]
ACTIVITY = [
    ["req-1", "created", "u-2", "created this request", 28],
    ["req-1", "status_changed", "u-1", "moved to Planned", 19],
    ["req-1", "status_changed", "u-1", "moved to In Progress", 12],
    ["req-1", "status_changed", "u-1", "moved to Released", 6],
    ["req-1", "response_posted", "u-1", "posted an official response", 7],
    ["req-10", "created", "u-2", "created this request", 26],
    ["req-10", "merged_into", "u-1", "merged into req-1", 24],
    ["req-2", "created", "u-3", "created this request", 24],
    ["req-2", "status_changed", "u-1", "moved to Planned", 13],
    ["req-3", "created", "u-4", "created this request", 20],
    ["req-3", "status_changed", "u-1", "moved to Planned", 15],
    ["req-3", "status_changed", "u-1", "moved to In Progress", 2],
    ["req-4", "created", "u-2", "created this request", 3],
    ["req-5", "created", "u-3", "created this request", 18],
    ["req-5", "status_changed", "u-1", "moved to Declined", 15],
    ["req-5", "response_posted", "u-1", "posted an official response", 15],
    ["req-6", "created", "u-4", "created this request", 2],
    ["req-7", "created", "u-2", "created this request", 12],
    ["req-7", "status_changed", "u-1", "moved to Planned", 9],
    ["req-8", "created", "u-3", "created this request", 15],
    ["req-8", "status_changed", "u-1", "moved to Released", 4],
    ["req-9", "created", "u-4", "created this request", 8],
    ["req-9", "status_changed", "u-1", "moved to In Progress", 7],
    ["req-9", "response_posted", "u-1", "posted an official response", 1],
    ["req-11", "created", "u-3", "created this request", 10],
    ["req-11", "status_changed", "u-1", "moved to Declined", 7],
    ["req-12", "created", "u-4", "created this request", 1],
]


def seed(db: Session) -> None:
    db.execute(delete(Vote))
    db.execute(delete(ActivityEntry))
    db.execute(delete(Comment))
    db.execute(delete(OfficialResponse))
    db.execute(delete(Request))
    db.execute(delete(Counter))
    db.execute(delete(User))

    password_hash = hash_password(DEV_PASSWORD)
    for user_id, name, email, role in USERS:
        db.add(
            User(
                id=user_id,
                name=name,
                email=email,
                password_hash=password_hash,
                role=role,
            )
        )

    for (
        request_id,
        title,
        description,
        author_id,
        status,
        merged_into,
        (created_days, created_hours),
        (updated_days, updated_hours),
    ) in REQUESTS:
        db.add(
            Request(
                id=request_id,
                title=title,
                description=description,
                author_id=author_id,
                status=status,
                merged_into=merged_into,
                created_at=days_ago(created_days, created_hours),
                updated_at=days_ago(updated_days, updated_hours),
            )
        )

    for request_id, user_id, d in VOTES:
        db.add(
            Vote(
                user_id=user_id,
                request_id=request_id,
                created_at=days_ago(d, 3),
            )
        )

    for i, (request_id, author_id, body, d) in enumerate(COMMENTS, start=1):
        db.add(
            Comment(
                id=f"c-{i}",
                request_id=request_id,
                author_id=author_id,
                body=body,
                created_at=days_ago(d, 5),
            )
        )

    for request_id, author_id, body, d in RESPONSES:
        db.add(
            OfficialResponse(
                request_id=request_id,
                author_id=author_id,
                body=body,
                created_at=days_ago(d),
                updated_at=days_ago(d),
            )
        )

    for i, (request_id, type_, actor_id, detail, d) in enumerate(ACTIVITY, start=1):
        db.add(
            ActivityEntry(
                id=f"a-{i}",
                request_id=request_id,
                type=type_,
                actor_id=actor_id,
                detail=detail,
                created_at=days_ago(d, 2),
            )
        )

    db.add(Counter(name="request", value=len(REQUESTS)))
    db.add(Counter(name="comment", value=len(COMMENTS)))
    db.add(Counter(name="activity", value=len(ACTIVITY)))

    db.commit()


def main() -> None:
    with SessionLocal() as db:
        seed(db)
    print("Seeded feature_vote.db: 12 users, 12 requests, 70 votes, 8 comments, 3 responses, 26 activity entries.")


if __name__ == "__main__":
    main()