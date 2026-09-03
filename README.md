# Feature Request & Voting Platform

Users submit feature requests and vote on them; admins triage, plan, ship, merge, and respond. The frontend (React + Vite + shadcn) runs against a mock API layer in `frontend/src/api/`; the backend is a future placeholder.

Domain glossary: [`CONTEXT.md`](./CONTEXT.md). Architecture rationale: [`docs/adr/`](./docs/adr/).

## API contract (mock)

All endpoints are served by the mock layer in `frontend/src/api/` and behave like a real HTTP API — latency, error codes (`ApiError` with a machine-readable `code`), and server-side rule enforcement included. Rules below mirror what a real backend must enforce.

| Method | Path | Access | Description |
| --- | --- | --- | --- |
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
| `GET` | `/session` | all | Current user (`user` \| `admin`); mock-session identity |
| `PUT` | `/session` | all | Dev role switcher |

## Enforcement summary

- **Vote-once** — unique `(userId, requestId)`; repeat `PUT` is a no-op, never a second row.
- **Concurrent votes** — mock serializes per `(userId, requestId)`; real API requires write isolation.
- **Voting closed** — votes rejected on terminal statuses (`released`, `declined`, `redirected`).
- **Admin-only** — status change, merge, official response, stats reject `role !== 'admin'`.
- **Author-or-admin** — request edit/delete rejects anyone else.
- **Merge dedup** — survivor Support = union of voters (see ADR-0001).

## Development

```sh
cd frontend
npm install
npm run dev
```

Verify: `npm run lint` and `npm run build` must stay clean.