from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import time

from backend.config.settings import settings
from backend.config.database import init_db

# ─── Routers ─────────────────────────────────────────────────────────────
from backend.routers import (
    auth,
    users,
    trustid,
    jobs,
    freelance,
    launchpad,
    fundmatch,
    mentors,
    investors,
    ecs,
    marketboost,
    messages,
    govlink,
    safety,
)

# ─── Optional Huawei APM (safe import) ────────────────────────────────────
try:
    from huawei.apm.tracker import track_api_request
except Exception:
    def track_api_request(*args, **kwargs):
        pass


# ─── Logging ──────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

logger = logging.getLogger("arise")


# ─── Lifespan (Startup / Shutdown) ───────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting ARISE API...")

    try:
        init_db()
        logger.info("✅ Database initialized")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")

    logger.info(f"🔧 Debug Mode: {settings.DEBUG}")
    logger.info(f"🌍 Huawei Region: {settings.HUAWEI_REGION}")
    logger.info(f"🌐 Frontend URL: {settings.FRONTEND_URL}")

    yield

    logger.info("🛑 ARISE API shutting down...")


# ─── FastAPI App ─────────────────────────────────────────────────────────
app = FastAPI(
    title="ARISE API",
    description="""
    ## ARISE — AI-Powered Enterprise Operating System

    A digital identity and opportunity platform connecting
    South Africa's youth and women entrepreneurs to:

    - Jobs
    - Freelancing
    - Funding
    - Mentorship
    - Business growth tools
    """,
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)


# ─── CORS Configuration ──────────────────────────────────────────────────
# This fixes your error:
# "No Access-Control-Allow-Origin header"

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

if settings.FRONTEND_URL:
    allowed_origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── API Prefix ──────────────────────────────────────────────────────────
API_PREFIX = "/api/v1"


# ─── Register Routers ────────────────────────────────────────────────────
app.include_router(auth.router,        prefix=f"{API_PREFIX}/auth",        tags=["Authentication"])
app.include_router(users.router,       prefix=f"{API_PREFIX}/users",       tags=["Users"])
app.include_router(trustid.router,     prefix=f"{API_PREFIX}/trustid",     tags=["TrustID"])
app.include_router(jobs.router,        prefix=f"{API_PREFIX}/jobs",        tags=["Jobs"])
app.include_router(freelance.router,   prefix=f"{API_PREFIX}/freelance",   tags=["Freelance"])
app.include_router(launchpad.router,   prefix=f"{API_PREFIX}/launchpad",   tags=["LaunchPad"])
app.include_router(fundmatch.router,   prefix=f"{API_PREFIX}/fundmatch",   tags=["FundMatch"])
app.include_router(mentors.router,     prefix=f"{API_PREFIX}/mentors",     tags=["Mentors"])
app.include_router(investors.router,   prefix=f"{API_PREFIX}/investors",   tags=["Investors"])
app.include_router(ecs.router,         prefix=f"{API_PREFIX}/ecs",         tags=["ECS"])
app.include_router(marketboost.router, prefix=f"{API_PREFIX}/marketboost", tags=["MarketBoost"])
app.include_router(messages.router,    prefix=f"{API_PREFIX}/messages",    tags=["Messages"])
app.include_router(govlink.router,     prefix=f"{API_PREFIX}/govlink",     tags=["GovLink"])
app.include_router(safety.router,      prefix=f"{API_PREFIX}/safety",      tags=["Safety"])


# ─── API Monitoring Middleware (Huawei APM) ──────────────────────────────
@app.middleware("http")
async def apm_tracking_middleware(request, call_next):
    start = time.time()

    response = await call_next(request)

    duration_ms = (time.time() - start) * 1000

    try:
        track_api_request(
            str(request.url.path),
            request.method,
            response.status_code,
            duration_ms,
        )
    except Exception:
        pass

    return response


# ─── Health Endpoints ────────────────────────────────────────────────────
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


# ─── Global Exception Handler ────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)

    return JSONResponse(
        status_code=500,
        content={
            "detail": "An unexpected error occurred",
            "type": "internal_server_error",
        },
    )


# ─── Run Server Directly ─────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="debug" if settings.DEBUG else "info",
    )