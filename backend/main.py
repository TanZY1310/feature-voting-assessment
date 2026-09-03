from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from errors import AppError
from routers import auth, comments, requests, stats, votes

app = FastAPI(
    title="Feature Request & Voting API",
    description="Backend for the Feature Request & Voting Platform. Mirrors the contract of the frontend mock API (frontend/src/api).",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(requests.router)
app.include_router(votes.router)
app.include_router(comments.router)
app.include_router(stats.router)


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status, content={"code": exc.code, "message": exc.message}
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content={"code": "INVALID", "message": "Invalid request payload"},
    )


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}