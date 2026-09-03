# JWT bearer auth replaces the mock role switcher

The mock exposed a dev role switcher (`GET /session`, `PUT /session`) with no passwords. The backend implements real authentication: `POST /auth/login` (email + bcrypt-verified password) issues an HS256 JWT, protected endpoints require an `Authorization: Bearer <token>` header, and `GET /session` returns the user for a valid token. The `PUT /session` role switcher is dropped — role comes from the token, not a mutable global.

Read endpoints (list/detail) stay anonymous-accessible; `votedByMe` and `canVote` are derived from the token when one is present. Seeded users gain `email` and `password_hash` columns (shared dev password `password`).