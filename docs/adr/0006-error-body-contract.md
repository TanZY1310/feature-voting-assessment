# Flat {code, message} error body

Every domain error returns `{ "code": "NOT_FOUND", "message": "..." }` with the mock's HTTP mapping (`NOT_FOUND`→404, `UNAUTHORIZED`→401, `FORBIDDEN`→403, `NOT_OPEN`→409, `INVALID`→400, `REDIRECTED_LOCKED`→409), instead of FastAPI's default `{ "detail": ... }`.

We chose this to mirror the mock's `ApiError` shape (`code` + `message`), so the future HTTP reimplementation of `frontend/src/api/` can read `error.code` unchanged. Request-validation failures map to `{ "code": "INVALID" }` with a 400, consistent with the mock throwing `INVALID` for bad payloads.