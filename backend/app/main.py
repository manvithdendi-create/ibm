from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import init_db, engine
from app.routers import trips, health_router
from app.models import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    print("Database initialized")
    print(f"AI Service: {'Demo Mode' if settings.DEMO_MODE else 'Granite via Ollama'}")
    print(f"Ollama URL: {settings.OLLAMA_BASE_URL}")
    print(f"Model: {settings.GRANITE_MODEL}")
    yield
    # Shutdown
    print("Shutting down...")


app = FastAPI(
    title="TravelMate AI API",
    description="Smart Travel Planner powered by Granite 4.2B",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(trips.router)
app.include_router(trips.destinations_router)
app.include_router(trips.weather_router)
app.include_router(health_router)


@app.get("/")
async def root():
    return {
        "name": "TravelMate AI API",
        "version": "1.0.0",
        "description": "Smart Travel Planner powered by Granite 4.2B",
        "docs": "/docs",
        "health": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)