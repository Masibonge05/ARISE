from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from backend.config.settings import settings
from backend.config.database import init_db

# ─── Routers ───────────────────────────────────────────────────────────────────
from backend.routers import (
    auth,
    users,
    jobs,
    freelance,
    launchpad,
    fundmatch,
    mentors,
    investors,
    ecs,
    govlink,
)

# Routers from combined router file
from backend.routers.core import (
    messages_router,
    marketboost_router,
    safety_router,
    trustid_router,
)

# ─── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("arise")


# ─── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Starting ARISE API...")
    init_db()

    logger.info(f"✅ ARISE API running | Debug: {settings.DEBUG}")
    logger.info(f"📡 Frontend URL: {settings.FRONTEND_URL}")
    logger.info(f"🌍 Huawei Region: {settings.HUAWEI_REGION}")

    yield

    # Shutdown
    logger.info("🛑 ARISE API shutting down...")


# ─── App Instance ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="ARISE API",
    description="""
    ## ARISE — AI-Powered Enterprise Operating System

    The backend API for ARISE — a verified digital identity and opportunity
    platform connecting South Africa's youth and women entrepreneurs to
    employment, freelance work, funding, mentorship, and business tools.

    ### Personas
    - **Sphiwe** — Job Seeker & Freelancer
    - **Sipho** — Service Provider & Freelancer
    - **Zama** — Woman Entrepreneur

    ### Powered by Huawei Cloud
    - ModelArts: AI matching & grant eligibility
    - OCR: Identity & document verification
    - GES: Knowledge graph for mentor/investor matching
    - NLP: Scam detection & session note generation
    - OBS: Encrypted document storage
    - SIS: Voice-based language assessment
    """,
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)


# ─── Middleware ────────────────────────────────────────────────────────────────

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Trusted Hosts (extra security)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"] if settings.DEBUG else ["arise.co.za", "api.arise.co.za"],
)


# ─── Routers ───────────────────────────────────────────────────────────────────

API_PREFIX = "/api/v1"

# Core platform routers
app.include_router(auth.router,         prefix=f"{API_PREFIX}/auth",        tags=["Authentication"])
app.include_router(users.router,        prefix=f"{API_PREFIX}/users",       tags=["Users"])
app.include_router(jobs.router,         prefix=f"{API_PREFIX}/jobs",        tags=["Jobs (Sphiwe)"])
app.include_router(freelance.router,    prefix=f"{API_PREFIX}/freelance",   tags=["Freelance (Sipho)"])
app.include_router(launchpad.router,    prefix=f"{API_PREFIX}/launchpad",   tags=["LaunchPad (Zama)"])
app.include_router(fundmatch.router,    prefix=f"{API_PREFIX}/fundmatch",   tags=["FundMatch (Zama)"])
app.include_router(mentors.router,      prefix=f"{API_PREFIX}/mentors",     tags=["MentorNet"])
app.include_router(investors.router,    prefix=f"{API_PREFIX}/investors",   tags=["Investor Connect"])
app.include_router(ecs.router,          prefix=f"{API_PREFIX}/ecs",         tags=["ECS Score"])
app.include_router(govlink.router,      prefix=f"{API_PREFIX}/govlink",     tags=["GovLink (DSBD)"])

# New combined routers
app.include_router(trustid_router,      prefix=f"{API_PREFIX}/trustid",     tags=["TrustID Verification"])
app.include_router(messages_router,     prefix=f"{API_PREFIX}/messages",    tags=["Messages"])
app.include_router(marketboost_router,  prefix=f"{API_PREFIX}/marketboost", tags=["MarketBoost"])
app.include_router(safety_router,       prefix=f"{API_PREFIX}/safety",      tags=["Safety & Reporting"])


# ─── Health Check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {
        "platform": "ARISE",
        "status": "running",
        "version": settings.APP_VERSION,
        "message": "Empowering South Africa's youth and women entrepreneurs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "huawei_region": settings.HUAWEI_REGION,
        "debug_mode": settings.DEBUG,
    }


# ─── Global Exception Handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)

    return JSONResponse(
        status_code=500,
        content={
            "detail": "An unexpected error occurred. Please try again.",
            "type": "internal_server_error",
        },
    )


# ─── Run directly ──────────────────────────────────────────────────────────────
# python backend/main.py
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="debug" if settings.DEBUG else "info",
    )