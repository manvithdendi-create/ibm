from typing import Dict, Any, List, Optional
from datetime import date, datetime
from sqlalchemy.orm import Session

from app.models import Trip, Destination
from app.schemas import TripCreate, TripUpdate
from app.services.granite_service import generate_itinerary_with_granite, create_demo_itinerary
from app.services.budget_service import calculate_budget_breakdown
from app.services.weather_service import get_weather_for_destination
from app.services.maps_service import get_map_data_for_trip


async def create_trip(db: Session, trip_data: TripCreate, user_id: int = 1) -> Trip:
    """Create a new trip and generate itinerary."""
    # Create trip record
    trip = Trip(
        title=f"{trip_data.destination} Trip",
        destination=trip_data.destination,
        start_date=datetime.combine(trip_data.start_date, datetime.min.time()),
        end_date=datetime.combine(trip_data.end_date, datetime.min.time()),
        travelers=trip_data.travelers,
        budget=trip_data.budget,
        currency=trip_data.currency,
        travel_style=trip_data.travel_style.value,
        interests=[i.value for i in trip_data.interests],
        preferences={
            "transportation": trip_data.transportation.value,
            "accommodation": trip_data.accommodation.value
        },
        special_requirements=trip_data.special_requirements
    )

    db.add(trip)
    db.commit()
    db.refresh(trip)

    # Prepare data for AI generation
    ai_input = {
        "starting_city": trip_data.starting_city,
        "destination": trip_data.destination,
        "start_date": trip_data.start_date.isoformat(),
        "end_date": trip_data.end_date.isoformat(),
        "travelers": trip_data.travelers,
        "budget": trip_data.budget,
        "currency": trip_data.currency,
        "travel_style": trip_data.travel_style.value,
        "interests": [i.value for i in trip_data.interests],
        "transportation": trip_data.transportation.value,
        "accommodation": trip_data.accommodation.value,
        "special_requirements": trip_data.special_requirements
    }

    # Generate itinerary
    itinerary = await generate_itinerary_with_granite(ai_input)

    if not itinerary:
        # Fallback to demo itinerary
        itinerary = create_demo_itinerary(ai_input)

    # Calculate budget breakdown
    budget_breakdown = calculate_budget_breakdown(
        itinerary.get("budget_breakdown", {}),
        trip_data.budget,
        trip_data.travelers,
        (trip_data.end_date - trip_data.start_date).days + 1
    )

    # Get weather data
    weather_data = await get_weather_for_destination(trip_data.destination, trip_data.start_date, trip_data.end_date)

    # Get map data
    map_data = get_map_data_for_trip(trip_data.destination, itinerary.get("days", []))

    # Update trip with generated data
    trip.itinerary = itinerary
    trip.budget_breakdown = budget_breakdown
    trip.weather_data = weather_data
    trip.map_data = map_data

    db.commit()
    db.refresh(trip)

    return trip


def get_trip(db: Session, trip_id: int) -> Optional[Trip]:
    """Get a trip by ID."""
    return db.query(Trip).filter(Trip.id == trip_id).first()


def get_trips(db: Session, skip: int = 0, limit: int = 100) -> List[Trip]:
    """Get all trips with pagination."""
    return db.query(Trip).offset(skip).limit(limit).all()


def update_trip(db: Session, trip_id: int, trip_update: TripUpdate) -> Optional[Trip]:
    """Update a trip."""
    trip = get_trip(db, trip_id)
    if not trip:
        return None

    update_data = trip_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "interests" and value is not None:
            value = [i.value if hasattr(i, 'value') else i for i in value]
        if field == "travel_style" and value is not None:
            value = value.value if hasattr(value, 'value') else value
        setattr(trip, field, value)

    trip.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(trip)
    return trip


def delete_trip(db: Session, trip_id: int) -> bool:
    """Delete a trip."""
    trip = get_trip(db, trip_id)
    if not trip:
        return False
    db.delete(trip)
    db.commit()
    return True


def search_trips(db: Session, query: str = "", skip: int = 0, limit: int = 100) -> List[Trip]:
    """Search trips by destination or title."""
    q = db.query(Trip)
    if query:
        q = q.filter(
            (Trip.destination.ilike(f"%{query}%")) |
            (Trip.title.ilike(f"%{query}%"))
        )
    return q.offset(skip).limit(limit).all()


def get_sample_destinations(db: Session) -> List[Destination]:
    """Get sample destinations for demo."""
    return db.query(Destination).filter(Destination.is_sample == 1).limit(20).all()


def init_sample_data(db: Session):
    """Initialize sample destinations if database is empty."""
    if db.query(Destination).count() > 0:
        return

    sample_destinations = [
        {
            "name": "Paris",
            "country": "France",
            "region": "Europe",
            "description": "The City of Light, famous for art, fashion, gastronomy, and culture.",
            "image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
            "category": "Culture",
            "best_time_to_visit": "April-June, September-October",
            "recommended_duration": 5,
            "estimated_budget": 1500,
            "currency": "EUR",
            "latitude": 48.8566,
            "longitude": 2.3522,
            "is_sample": 1
        },
        {
            "name": "Tokyo",
            "country": "Japan",
            "region": "Asia",
            "description": "A vibrant metropolis blending ultramodern and traditional.",
            "image_url": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
            "category": "City Break",
            "best_time_to_visit": "March-May, September-November",
            "recommended_duration": 7,
            "estimated_budget": 2000,
            "currency": "JPY",
            "latitude": 35.6762,
            "longitude": 139.6503,
            "is_sample": 1
        },
        {
            "name": "Bali",
            "country": "Indonesia",
            "region": "Asia",
            "description": "Tropical paradise with beaches, temples, and rice terraces.",
            "image_url": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
            "category": "Beaches",
            "best_time_to_visit": "April-October",
            "recommended_duration": 7,
            "estimated_budget": 1200,
            "currency": "IDR",
            "latitude": -8.3405,
            "longitude": 115.0920,
            "is_sample": 1
        },
        {
            "name": "New York",
            "country": "USA",
            "region": "North America",
            "description": "The city that never sleeps, with iconic landmarks and diverse neighborhoods.",
            "image_url": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800",
            "category": "City Break",
            "best_time_to_visit": "April-June, September-November",
            "recommended_duration": 5,
            "estimated_budget": 2500,
            "currency": "USD",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "is_sample": 1
        },
        {
            "name": "Swiss Alps",
            "country": "Switzerland",
            "region": "Europe",
            "description": "Stunning mountain landscapes perfect for hiking and skiing.",
            "image_url": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800",
            "category": "Mountains",
            "best_time_to_visit": "June-September, December-March",
            "recommended_duration": 7,
            "estimated_budget": 3000,
            "currency": "CHF",
            "latitude": 46.8182,
            "longitude": 8.2275,
            "is_sample": 1
        },
        {
            "name": "Machu Picchu",
            "country": "Peru",
            "region": "South America",
            "description": "Ancient Incan citadel high in the Andes mountains.",
            "image_url": "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800",
            "category": "Adventure",
            "best_time_to_visit": "May-September",
            "recommended_duration": 5,
            "estimated_budget": 1800,
            "currency": "PEN",
            "latitude": -13.1631,
            "longitude": -72.5450,
            "is_sample": 1
        },
        {
            "name": "Santorini",
            "country": "Greece",
            "region": "Europe",
            "description": "Stunning island with white-washed buildings and blue domes.",
            "image_url": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800",
            "category": "Beaches",
            "best_time_to_visit": "April-October",
            "recommended_duration": 4,
            "estimated_budget": 1500,
            "currency": "EUR",
            "latitude": 36.3932,
            "longitude": 25.4615,
            "is_sample": 1
        },
        {
            "name": "Cape Town",
            "country": "South Africa",
            "region": "Africa",
            "description": "Diverse city with Table Mountain, beaches, and wine regions.",
            "image_url": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800",
            "category": "Nature",
            "best_time_to_visit": "November-March",
            "recommended_duration": 7,
            "estimated_budget": 1500,
            "currency": "ZAR",
            "latitude": -33.9249,
            "longitude": 18.4241,
            "is_sample": 1
        }
    ]

    for dest_data in sample_destinations:
        dest = Destination(**dest_data)
        db.add(dest)

    db.commit()