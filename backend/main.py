"""
EduSpark AI — FastAPI application entry point.

Run with:
    uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router
from database.db import engine
from database.models import Base

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all DB tables if they don't exist
    Base.metadata.create_all(bind=engine)
    logger.info("═══════════════════════════════════════════════")
    logger.info("  EduSpark AI backend starting …")
    logger.info("  Docs:  http://localhost:8000/docs")
    logger.info("═══════════════════════════════════════════════")
    yield


app = FastAPI(
    title="EduSpark AI",
    description="Local AI-powered backend for classroom observation analysis.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
