from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.database import get_db
from app.schemas import (
    TripCreate, TripUpdate, TripResponse, DestinationResponse,
    WeatherResponse, ErrorResponse, ItineraryResponse
)
from app.services.itinerary_service import (
    create_trip, get_trip, get_trips, update_trip, delete_trip,
    search_trips, init_sample_data, get_sample_destinations
)
from app.services.weather_service import get_weather_for_destination
from app.models import Trip

router = APIRouter(prefix="/api/trips", tags=["trips"])


@router.post("", response_model=TripResponse, status_code=201)
async def create_new_trip(trip_data: TripCreate, db: Session = Depends(get_db)):
    """Create a new trip with AI-generated itinerary."""
    try:
        trip = await create_trip(db, trip_data)
        return trip.to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create trip: {str(e)}")


@router.get("", response_model=List[TripResponse])
async def list_trips(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """List all trips with optional search."""
    if search:
        trips = search_trips(db, search, skip, limit)
    else:
        trips = get_trips(db, skip, limit)
    return [trip.to_dict() for trip in trips]


@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip_by_id(trip_id: int, db: Session = Depends(get_db)):
    """Get a specific trip by ID."""
    trip = get_trip(db, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip.to_dict()


@router.put("/{trip_id}", response_model=TripResponse)
async def update_existing_trip(trip_id: int, trip_update: TripUpdate, db: Session = Depends(get_db)):
    """Update a trip."""
    trip = update_trip(db, trip_id, trip_update)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip.to_dict()


@router.delete("/{trip_id}", status_code=204)
async def delete_existing_trip(trip_id: int, db: Session = Depends(get_db)):
    """Delete a trip."""
    success = delete_trip(db, trip_id)
    if not success:
        raise HTTPException(status_code=404, detail="Trip not found")
    return None


@router.post("/{trip_id}/regenerate", response_model=TripResponse)
async def regenerate_trip_itinerary(trip_id: int, db: Session = Depends(get_db)):
    """Regenerate itinerary for an existing trip."""
    trip = get_trip(db, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Recreate trip data for AI
    from app.services.itinerary_service import create_trip as create_trip_func
    from app.schemas import TripCreate, TravelStyle, Interest, TransportationType, AccommodationType

    trip_create = TripCreate(
        starting_city=trip.preferences.get("starting_city", "Unknown"),
        destination=trip.destination,
        start_date=date.fromisoformat(trip.start_date.isoformat().split("T")[0]) if trip.start_date else date.today(),
        end_date=date.fromisoformat(trip.end_date.isoformat().split("T")[0]) if trip.end_date else date.today(),
        travelers=trip.travelers,
        budget=trip.budget,
        currency=trip.currency,
        travel_style=TravelStyle(trip.travel_style),
        interests=[Interest(i) for i in trip.interests],
        transportation=TransportationType(trip.preferences.get("transportation", "Flight")),
        accommodation=AccommodationType(trip.preferences.get("accommodation", "Hotel")),
        special_requirements=trip.special_requirements
    )

    # Delete old trip and create new one with regenerated itinerary
    delete_trip(db, trip_id)
    new_trip = await create_trip_func(db, trip_create)
    return new_trip.to_dict()


# Destinations router
destinations_router = APIRouter(prefix="/api/destinations", tags=["destinations"])


@destinations_router.get("", response_model=List[DestinationResponse])
async def list_destinations(
    category: Optional[str] = Query(None),
    min_budget: Optional[float] = Query(None),
    max_budget: Optional[float] = Query(None),
    duration: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """List destinations with filters."""
    from app.models import Destination

    query = db.query(Destination).filter(Destination.is_sample == 1)

    if category:
        query = query.filter(Destination.category.ilike(f"%{category}%"))
    if min_budget is not None:
        query = query.filter(Destination.estimated_budget >= min_budget)
    if max_budget is not None:
        query = query.filter(Destination.estimated_budget <= max_budget)
    if duration:
        query = query.filter(Destination.recommended_duration <= duration)
    if search:
        query = query.filter(
            (Destination.name.ilike(f"%{search}%")) |
            (Destination.country.ilike(f"%{search}%")) |
            (Destination.description.ilike(f"%{search}%"))
        )

    destinations = query.limit(50).all()
    return [dest.to_dict() for dest in destinations]


@destinations_router.get("/{destination_id}", response_model=DestinationResponse)
async def get_destination(destination_id: int, db: Session = Depends(get_db)):
    """Get a specific destination."""
    from app.models import Destination
    dest = db.query(Destination).filter(Destination.id == destination_id).first()
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    return dest.to_dict()


@destinations_router.post("/init-sample")
async def initialize_sample_destinations(db: Session = Depends(get_db)):
    """Initialize sample destination data."""
    init_sample_data(db)
    return {"message": "Sample destinations initialized"}


# Weather router
weather_router = APIRouter(prefix="/api/weather", tags=["weather"])


@weather_router.get("/{destination}", response_model=WeatherResponse)
async def get_destination_weather(
    destination: str,
    start_date: date = Query(...),
    end_date: date = Query(...)
):
    """Get weather forecast for a destination."""
    weather_data = await get_weather_for_destination(destination, start_date, end_date)
    return weather_data


# Health router
health_router = APIRouter(prefix="/api", tags=["health"])


@health_router.get("/health", response_model=dict)
async def health_check():
    """Health check endpoint."""
    from app.services.granite_service import check_ollama_health
    from app.database import engine
    from sqlalchemy import text

    # Check database
    db_status = "healthy"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception:
        db_status = "unhealthy"

    # Check AI service
    ai_status = await check_ollama_health()

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "ai_service": ai_status,
        "version": "1.0.0"
    }