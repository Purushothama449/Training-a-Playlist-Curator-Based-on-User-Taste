from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routes import dataset, eda, models, predict, recommend, insights, config
from app.services.state import app_state

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    print("Starting AI Playlist Curator API...")
    app_state.initialize_default_dataset()
    yield
    # Shutdown logic
    print("Shutting down API...")

app = FastAPI(
    title="AI Playlist Curator ML Backend",
    description="Machine Learning REST API for Playlist Curation based on User Taste",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(config.router)
app.include_router(dataset.router)
app.include_router(eda.router)
app.include_router(models.router)
app.include_router(predict.router)
app.include_router(recommend.router)
app.include_router(insights.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
