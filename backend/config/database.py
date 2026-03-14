from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from .settings import settings


# ─── Engine Setup ──────────────────────────────────────────────────────────────
# Handles both SQLite (dev) and PostgreSQL (production)
# based on the DATABASE_URL in .env

if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite needs special args for FastAPI's async nature
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    # PostgreSQL for production
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,       # test connections before using them
        pool_size=10,             # max persistent connections
        max_overflow=20,          # extra connections allowed under load
        pool_recycle=3600,        # recycle connections every hour
    )


# ─── Session Factory ───────────────────────────────────────────────────────────
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ─── Base Class ────────────────────────────────────────────────────────────────
# All models inherit from this
Base = declarative_base()


# ─── Dependency ────────────────────────────────────────────────────────────────
# Used in every FastAPI route that needs DB access:
# def my_route(db: Session = Depends(get_db)):
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─── Init DB ───────────────────────────────────────────────────────────────────
# Called once on startup to create all tables
def init_db():
    # Import all models here so Base knows about them
    from backend.models import (   # noqa: F401
        user,
        trustid,
        job,
        project,
        business,
        grant,
        mentor,
        investor,
        ecs,
        message,
        course,
    )
    Base.metadata.create_all(bind=engine)
    print("✅ ARISE database tables created successfully")