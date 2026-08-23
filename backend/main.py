import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

load_dotenv()

from db.session import engine, SessionLocal
from db.base import Base
from api import (
    auth,
    cart,
    category,
    interactions,
    look,
    order,
    payment,
    product,
    profile,
    recommendations,
    review,
    size,
    wishlist,
)

ENV = os.getenv("ENV", "dev")

# ---------------------------------------------------------------------------
# Schema management
#   - Development (ENV != prod): convenient `create_all` so a fresh local DB
#     picks up every table without running migrations.
#   - Production (ENV == prod): schema is managed ONLY by Alembic
#     (`alembic upgrade head` at deploy time). `create_all` is intentionally
#     skipped so it can never diverge from the migration history.
# ---------------------------------------------------------------------------
if ENV != "prod":
    Base.metadata.create_all(bind=engine)

if ENV == "prod":
    app = FastAPI(title="WearIt API", docs_url=None, redoc_url=None)
else:
    app = FastAPI(title="WearIt API")

# ---------------------------------------------------------------------------
# CORS
# The production deployment is SAME-ORIGIN (nginx serves the SPA and proxies
# /api/v1), so no cross-origin config is strictly needed there. When an API is
# reached from a different origin, configure CORS_ORIGINS (comma-separated),
# e.g. CORS_ORIGINS=https://wearit.inderforge.app
#
# Wildcard origins cannot be combined with credentials. The app authenticates
# with the Authorization header (bearer JWT), not cookies, so credentials are
# only enabled when explicit non-wildcard origins are configured.
# ---------------------------------------------------------------------------
allowed_origins = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "").split(",")
    if o.strip()
]
if not allowed_origins:
    # Dev convenience default. Production should set CORS_ORIGINS explicitly.
    allowed_origins = ["*"] if ENV != "prod" else []
allow_credentials = allowed_origins != ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    """Basic liveness: the process is up and responding."""
    return {"status": "ok"}


@app.get("/health/ready")
def health_ready():
    """Readiness: application is up AND the database is reachable.

    Lightweight, reveals nothing about the database (no URL/user/version in
    the response). Suitable for a Docker container healthcheck.
    """
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
    except Exception:
        raise HTTPException(status_code=503, detail="Database not ready")
    return {"status": "ok"}


@app.get("/")
def root():
    return {"wearit_backend": "running"}


app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(product.router)
app.include_router(category.router)
app.include_router(size.router)
app.include_router(cart.router)
app.include_router(payment.router)
app.include_router(order.router)
app.include_router(review.router)
app.include_router(wishlist.router)
app.include_router(recommendations.router)
app.include_router(look.router)
app.include_router(interactions.router)
