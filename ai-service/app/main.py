from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings

# Configure logging
logging.basicConfig(level=settings.AI_LOG_LEVEL.upper())
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load models here
    logger.info("Starting up AI Service. Loading models...")
    yield
    # Shutdown: Clean up resources
    logger.info("Shutting down AI Service.")

app = FastAPI(
    title="SWACHH TECH AI - AI Microservice",
    description="AI services for waste prediction, complaint classification, and route optimization",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to SWACHH TECH AI - AI Microservice", "docs": "/docs"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
