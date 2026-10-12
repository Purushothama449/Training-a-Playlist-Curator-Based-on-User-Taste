import os
from fastapi import APIRouter
from app.services.state import app_state

router = APIRouter(tags=["config"])

@router.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "service": "AI Playlist Curator ML Backend",
        "dataset_loaded": app_state.data_loader.df is not None,
        "model_trained": app_state.is_trained
    }

@router.get("/api/config")
async def get_config():
    return {
        "app_title": "AI Playlist Curator",
        "subtitle": "ML Based on User Taste",
        "github_url": os.getenv("GITHUB_URL", "https://github.com/user/playlist-curator-ml"),
        "doc_url": "/docs",
        "version": "1.0.0",
        "author": "ML Student Team"
    }
