# Feature Request & Voting Platform

Users submit feature requests and vote on them; admins triage, plan, ship, merge, and respond. The frontend (React + Vite + shadcn) talks to a FastAPI backend in `backend/` over HTTP (`VITE_API_URL`, see [Backend](#backend)); `frontend/src/api/` is the thin HTTP client layer.

Domain glossary: [`CONTEXT.md`](./CONTEXT.md). Architecture rationale: [`docs/adr/`](./docs/adr/).

## API contract

The backend implements the contract below. Responses and error codes match the original mock exactly: camelCase DTOs, `ApiError` with a machine-readable `code`, and server-side rule enforcement.

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | public | Email/password → `{ token, user }` |
| `GET` | `/session` | bearer | Current user (`user` \| `admin`) |
| `GET` | `/requests` | all | List requests; query params `q`, `status`, `sort` (`support` \| `newest`) |
| `GET` | `/requests/:id` | all | Detail incl. description, pipeline status, votes, comments, official response, activity, `mergedInto` |
| `POST` | `/requests` | user | Create a request (status `under_review`) |
| `PATCH` | `/requests/:id` | author or admin | Edit title/description |
| `DELETE` | `/requests/:id` | author or admin | Delete |
| `PUT` | `/requests/:id/status` | admin | Set status; rejects `redirected` (merge product) |
| `POST` | `/requests/:id/merge` | admin | Merge this (absorbed) request into `{ into: requestId }` |
| `PUT` | `/requests/:id/vote` | user | Vote (idempotent; second `PUT` is a no-op) |
| `DELETE` | `/requests/:id/vote` | user | Unvote (idempotent) |
| `GET` | `/requests/:id/comments` | all | List comments (newest first) |
| `POST` | `/requests/:id/comments` | user | Add a comment |
| `PUT` | `/requests/:id/response` | admin | Set/edit official response (0..1 per request) |
| `DELETE` | `/requests/:id/response` | admin | Remove official response |
| `GET` | `/stats` | admin | KPIs (total, active, support, released), status distribution, top-voted, votes-over-time |

## Enforcement summary

- **Vote-once** — unique `(userId, requestId)` constraint; repeat `PUT` is a no-op via `INSERT OR IGNORE`, never a second row.
- **Voting closed** — votes rejected on terminal statuses (`released`, `declined`, `redirected`).
- **Admin-only** — status change, merge, official response, stats reject `role !== 'admin'`.
- **Author-or-admin** — request edit/delete rejects anyone else.
- **Merge dedup** — survivor Support = union of voters (see ADR-0001).

## Backend

A FastAPI service in `backend/` (Python 3.12, SQLite + SQLAlchemy 2.0, Alembic migrations) implements the full contract above: authentication (JWT), requests, voting with vote-once integrity, comments, official response, merge (union of voters), admin status change, and stats. The JSON DTO shapes, error codes, and business rules mirror the original mock exactly (see [ADR-0004](./docs/adr/0004-fastapi-backend-stack.md)).

### Setup

From `backend/`, using the existing `myenv/` virtualenv (or your own):

```sh
cd backend
myenv\Scripts\python.exe -m pip install -r requirements.txt   # Windows
# myenv/bin/python -m pip install -r requirements.txt         # macOS / Linux
myenv\Scripts\python.exe -m alembic upgrade head              # create schema
myenv\Scripts\python.exe seed.py                              # seed mock data
```

### Run

```sh
myenv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

Interactive API docs: http://127.0.0.1:8000/docs

Seeded dev users all have password `password`:
- Admin: `lee@example.com` (Lee Park)
- Users: `sam@example.com` (Sam Rivera), `alex@example.com`, ...

### Test

```sh
cd backend
myenv\Scripts\python.exe -m pytest
```

Errors return `{ "code": "...", "message": "..." }` with the same codes and HTTP statuses as the contract (see [ADR-0006](./docs/adr/0006-error-body-contract.md)).

## Development

The frontend talks to the backend over HTTP. Set `VITE_API_URL` (defaults to `http://localhost:8000`) if the backend runs elsewhere, e.g. copy `frontend/.env.example` to `frontend/.env`.

```sh
# terminal 1 — backend
cd backend
myenv\Scripts\python.exe -m uvicorn main:app --reload --port 8000

# terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Sign in with a seeded dev account: admin `lee@example.com` or user `sam@example.com`, password `password`.

Verify: `npm run lint` and `npm run build` must stay clean.