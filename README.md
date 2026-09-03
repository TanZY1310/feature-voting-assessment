# Feature Request & Voting Platform

Users submit feature requests and vote on them; admins triage, plan, ship, merge, and respond. The frontend (React + Vite + shadcn) talks to a FastAPI backend in `backend/` over HTTP (`VITE_API_URL`, see [Backend](#backend)); `frontend/src/api/` is the thin HTTP client layer.

Domain glossary: [`CONTEXT.md`](./CONTEXT.md). Architecture rationale: [`docs/adr/`](./docs/adr/).

## Quick start (Docker)

The whole platform runs with Docker Compose: the FastAPI backend, the React (Vite) frontend with hot reload. On first start the backend runs migrations (`alembic upgrade head`) and seeds sample data automatically if the database is empty, so the app works out of the box.

Prerequisites: [Docker](https://docs.docker.com/get-docker/) with Compose v2.

```sh
# optional: customize settings (safe defaults apply if you skip this)
cp .env.example .env

# build and start the backend (:8000) + frontend (:5173); seeds sample data on first start
# Make sure docker desktop is running before running command below
docker compose up
```

- Frontend: http://localhost:5173
- Backend API docs: http://localhost:8000/docs
- Sign in with a seeded dev account: admin `lee@example.com` or user `sam@example.com`, password `password`.

Useful commands:

- `docker compose run --rm seed` — wipe the database and re-seed fresh sample data.
- `docker compose down` — stop the stack; add `-v` to also delete the SQLite volume (`backend_data`) so the next `up` starts from a clean, empty database.

Environment: `.env.example` ships with safe dev defaults only — no secrets. `JWT_SECRET` and `JWT_EXPIRE_MINUTES` configure backend auth; override `JWT_SECRET` in your own `.env` (never commit it).

## API contract

The backend implements the contract below. Responses and error codes match the original mock exactly: camelCase DTOs, `ApiError` with a machine-readable `code`, and server-side rule enforcement.

| Method   | Path                     | Access          | Description                                                                                           |
| -------- | ------------------------ | --------------- | ----------------------------------------------------------------------------------------------------- |
| `POST`   | `/auth/login`            | public          | Email/password → `{ token, user }`                                                                    |
| `GET`    | `/session`               | bearer          | Current user (`user` \| `admin`)                                                                      |
| `GET`    | `/requests`              | all             | List requests; query params `q`, `status`, `sort` (`support` \| `newest`)                             |
| `GET`    | `/requests/:id`          | all             | Detail incl. description, pipeline status, votes, comments, official response, activity, `mergedInto` |
| `POST`   | `/requests`              | user            | Create a request (status `under_review`)                                                              |
| `PATCH`  | `/requests/:id`          | author or admin | Edit title/description                                                                                |
| `DELETE` | `/requests/:id`          | author or admin | Delete                                                                                                |
| `PUT`    | `/requests/:id/status`   | admin           | Set status; rejects `redirected` (merge product)                                                      |
| `POST`   | `/requests/:id/merge`    | admin           | Merge this (absorbed) request into `{ into: requestId }`                                              |
| `PUT`    | `/requests/:id/vote`     | user            | Vote (idempotent; second `PUT` is a no-op)                                                            |
| `DELETE` | `/requests/:id/vote`     | user            | Unvote (idempotent)                                                                                   |
| `GET`    | `/requests/:id/comments` | all             | List comments (newest first)                                                                          |
| `POST`   | `/requests/:id/comments` | user            | Add a comment                                                                                         |
| `PUT`    | `/requests/:id/response` | admin           | Set/edit official response (0..1 per request)                                                         |
| `DELETE` | `/requests/:id/response` | admin           | Remove official response                                                                              |
| `GET`    | `/stats`                 | admin           | KPIs (total, active, support, released), status distribution, top-voted, votes-over-time              |

## Enforcement summary

- **Vote-once** — unique `(userId, requestId)` constraint; repeat `PUT` is a no-op via `INSERT OR IGNORE`, never a second row.
- **Voting closed** — votes rejected on terminal statuses (`released`, `declined`, `redirected`).
- **Admin-only** — status change, merge, official response, stats reject `role !== 'admin'`.
- **Author-or-admin** — request edit/delete rejects anyone else.
- **Merge dedup** — survivor Support = union of voters (see ADR-0001).

## Authorization, transactions, uniqueness & concurrency

How the backend enforces rules, keeps writes atomic, and preserves vote-once under real requests.

### Authorization

Authentication is JWT-based (see [ADR-0005](./docs/adr/0005-jwt-auth.md)). `POST /auth/login` verifies the bcrypt password hash and issues an HS256 token; protected endpoints require `Authorization: Bearer <token>`. The token carries the user id and role, and claims are re-checked against the `users` table on every request (`backend/auth.py`).

| Endpoint                                                                                                  | Guard                                                               |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `GET /requests`, `GET /requests/:id`, `GET /requests/:id/comments`                                        | anonymous OK; `votedByMe`/`canVote` derived from token when present |
| `POST /requests`, `PUT/DELETE /requests/:id/vote`, `POST /requests/:id/comments`                          | any signed-in user                                                  |
| `PATCH/DELETE /requests/:id`                                                                              | author **or** admin                                                 |
| `PUT /requests/:id/status`, `POST /requests/:id/merge`, `PUT/DELETE /requests/:id/response`, `GET /stats` | admin only                                                          |

Dependencies (`backend/auth.py:48-74`): `get_current_user` rejects anonymous requests with `401 UNAUTHORIZED`; `get_current_user_optional` returns `None` so read endpoints stay public; `require_admin` wraps `get_current_user` and rejects non-admins with `403 FORBIDDEN`. Author-or-admin checks compare `request.author_id != user.id and user.role != "admin"` at the route level. These are enforced server-side; the frontend merely hides/disable UI (`frontend/src/api/http.js` sends the stored token and clears it on any 401).

### Transactions

Each request gets its own SQLAlchemy `Session` via the `get_db` dependency (`backend/database.py:18-23`; `autoflush=False, autocommit=False`). Every mutating endpoint performs all of its writes and then calls `db.commit()` exactly once, so multi-statement operations are atomic:

- **Create** commits the `Request` + its `created` activity entry together.
- **Status change** commits the status update + `status_changed` activity entry together.
- **Merge** commits, in one transaction: absorbed → `redirected`, vote reassignment/union, and both `merged_into` activity entries.
- **Delete** commits the cascading deletes (votes, comments, activity, official response) plus the request row.

There is no explicit `begin()`/nested transaction usage — SQLAlchemy autobegins on the first statement and the single `commit()` ends it. On an unhandled exception the `get_db` `finally` closes the session, rolling back the implicit transaction. Note: rollback is implicit (session close), not an explicit `try/except: db.rollback()`.

### Uniqueness

Constraints live in the schema (`backend/migrations/versions/0001_initial.py`) and mirror the SQLAlchemy models:

- **Vote-once** — `votes` has a composite primary key `(user_id, request_id)`, which is also a `UNIQUE` constraint. `PUT /vote` uses SQLite `INSERT ... ON CONFLICT DO NOTHING` (`backend/routers/votes.py:31-35`), so a repeat vote is a true no-op and can never insert a second row — even under concurrency.
- **One user per email** — `users.email` is `UNIQUE`.
- **0..1 official response** — `official_responses.request_id` is the primary key, so a request can have at most one response; the route upserts it.
- **ID generation** — IDs come from a `counters` table via `UPDATE ... RETURNING` (`backend/helpers.py:18-29`).

### Concurrency

The backend runs on SQLite, which is **single-writer**: writes are serialized at the database level, so within one process the write paths cannot interleave. `check_same_thread=False` (`backend/database.py:8`) lets each thread-pool worker open its own connection. Support is computed as `COUNT(*)` over vote rows (`backend/serializers.py:22-25`), never a stored counter, so it is always consistent with the rows after a commit.

Known concurrency caveats (fine for local dev, worth addressing before production):

- No optimistic concurrency (no `version` column) — a "last write wins" edit could silently overwrite a concurrent edit.
- **Merge** reads both requests' vote sets then rewrites rows; two merges racing on the same pair could conflict, though the unique constraint backstops duplicate reassignments. The redirected-lock check is not atomic with the reassignment.
- **Counter-based IDs** assume single-writer SQLite; under multiple processes (or Postgres) two creations could read the same counter value without row-level locking/retry.
- SQLite's default journal mode means readers block a writer; enabling `WAL` would improve read/write concurrency.

## Backend

A FastAPI service in `backend/` (Python 3.12, SQLite + SQLAlchemy 2.0, Alembic migrations) implements the full contract above: authentication (JWT), requests, voting with vote-once integrity, comments, official response, merge (union of voters), admin status change, and stats. The JSON DTO shapes, error codes, and business rules mirror the original mock exactly (see [ADR-0004](./docs/adr/0004-fastapi-backend-stack.md)).

Run the whole stack with [Docker](#quick-start-docker), or run the backend standalone without Docker using the virtualenv steps below.

### Setup (local, no Docker)

From `backend/`, using the existing `myenv/` virtualenv (or your own):

```sh
cd backend
myenv\Scripts\activate # To activate virtualenv
myenv\Scripts\python.exe pip install -r requirements.txt   # Windows
# myenv/bin/python -m pip install -r requirements.txt         # macOS / Linux
myenv\Scripts\python.exe alembic upgrade head              # create schema
myenv\Scripts\python.exe seed.py                              # seed mock data
```

### Run

```sh
myenv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

OPENAPI docs: http://127.0.0.1:8000/docs

Seeded dev users all have password `password`:

- Admin: `lee@example.com` (Lee Park)
- Users: `sam@example.com` (Sam Rivera), `alex@example.com`, ...

### Test

```sh
cd backend
myenv\Scripts\python.exe pytest
```

Errors return `{ "code": "...", "message": "..." }` with the same codes and HTTP statuses as the contract (see [ADR-0006](./docs/adr/0006-error-body-contract.md)).

## Development

Running the frontend and backend without Docker (see [Quick start](#quick-start-docker) for the containerized path). The frontend talks to the backend over HTTP. Set `VITE_API_URL` (defaults to `http://localhost:8000`) if the backend runs elsewhere, e.g. copy `frontend/.env.example` to `frontend/.env`.

```sh
# terminal 1 — backend
cd backend
myenv\Scripts\python.exe uvicorn main:app --reload --port 8000

# terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Sign in with a seeded dev account: admin `lee@example.com` or user `sam@example.com`, password `password`.

Verify: `npm run lint` and `npm run build` must stay clean.
