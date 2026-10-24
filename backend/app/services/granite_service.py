import json
import logging
import asyncio
from typing import Dict, Any, Optional, List
from datetime import date
import httpx
from pydantic import ValidationError

from app.config import settings
from app.schemas import ItineraryResponse, ItineraryDay, BudgetBreakdown, Interest, TravelStyle

logger = logging.getLogger(__name__)


ITINERARY_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "overview": {"type": "string"},
        "days": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "day": {"type": "integer"},
                    "date": {"type": "string"},
                    "activities": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "time": {"type": "string"},
                                "activity": {"type": "string"},
                                "description": {"type": "string"},
                                "location": {"type": "string"},
                                "duration_hours": {"type": "number"},
                                "estimated_cost": {"type": "number"},
                                "category": {"type": "string"},
                                "transportation": {"type": "string"},
                                "notes": {"type": "string"}
                            },
                            "required": ["time", "activity", "description", "location", "duration_hours", "estimated_cost", "category"]
                        }
                    },
                    "total_estimated_cost": {"type": "number"}
                },
                "required": ["day", "date", "activities", "total_estimated_cost"]
            }
        },
        "budget_breakdown": {
            "type": "object",
            "properties": {
                "transportation": {"type": "number"},
                "accommodation": {"type": "number"},
                "food": {"type": "number"},
                "activities": {"type": "number"},
                "local_transport": {"type": "number"},
                "miscellaneous": {"type": "number"},
                "total": {"type": "number"},
                "per_person": {"type": "number"},
                "daily_average": {"type": "number"},
                "remaining_budget": {"type": "number"}
            },
            "required": ["transportation", "accommodation", "food", "activities", "local_transport", "miscellaneous", "total", "per_person", "daily_average", "remaining_budget"]
        },
        "tips": {"type": "array", "items": {"type": "string"}}
    },
    "required": ["overview", "days", "budget_breakdown", "tips"]
}


def build_itinerary_prompt(trip_data: Dict[str, Any]) -> str:
    """Build a detailed prompt for itinerary generation."""
    start_date = trip_data.get("start_date")
    end_date = trip_data.get("end_date")
    days_count = (end_date - start_date).days + 1 if start_date and end_date else 7

    interests_str = ", ".join(trip_data.get("interests", [])) if trip_data.get("interests") else "general sightseeing"

    prompt = f"""You are an expert travel planner. Create a detailed, personalized day-by-day itinerary.

TRIP DETAILS:
- Starting City: {trip_data.get('starting_city', 'Not specified')}
- Destination: {trip_data.get('destination', 'Not specified')}
- Dates: {start_date} to {end_date} ({days_count} days)
- Travelers: {trip_data.get('travelers', 1)}
- Total Budget: {trip_data.get('budget', 0)} {trip_data.get('currency', 'USD')}
- Travel Style: {trip_data.get('travel_style', 'Standard')}
- Interests: {interests_str}
- Preferred Transportation: {trip_data.get('transportation', 'Mixed')}
- Accommodation Preference: {trip_data.get('accommodation', 'Hotel')}
- Special Requirements: {trip_data.get('special_requirements', 'None')}

REQUIREMENTS:
1. Create a day-by-day itinerary for {days_count} days
2. Include specific times, activities, locations, durations, and estimated costs
3. Provide a budget breakdown by category
4. Include practical travel tips
5. Match the travel style and interests
6. Stay within the specified budget
7. Return ONLY valid JSON matching the schema

The JSON must include:
- overview: string summary
- days: array of day objects with day number, date, activities array, and total_estimated_cost
- budget_breakdown: object with transportation, accommodation, food, activities, local_transport, miscellaneous, total, per_person, daily_average, remaining_budget
- tips: array of practical travel tips

Each activity must have: time, activity, description, location, duration_hours, estimated_cost, category, transportation, notes"""

    return prompt


async def call_ollama(prompt: str, model: str = None) -> Optional[str]:
    """Call Ollama API to generate response."""
    model = model or settings.GRANITE_MODEL
    url = f"{settings.OLLAMA_BASE_URL}/api/generate"

    payload = {
        "model": model,
        "prompt": prompt,
        "format": "json",
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
            "num_predict": 4096
        },
        "stream": False
    }

    try:
        async with httpx.AsyncClient(timeout=settings.OLLAMA_TIMEOUT) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            return data.get("response", "")
    except httpx.TimeoutException:
        logger.error(f"Ollama request timed out after {settings.OLLAMA_TIMEOUT}s")
        return None
    except httpx.RequestError as e:
        logger.error(f"Ollama connection error: {e}")
        return None
    except Exception as e:
        logger.error(f"Ollama unexpected error: {e}")
        return None


def validate_itinerary_json(json_str: str) -> Optional[Dict[str, Any]]:
    """Validate and parse itinerary JSON from model output."""
    try:
        # Try to extract JSON from the response
        json_str = json_str.strip()
        if json_str.startswith("```json"):
            json_str = json_str[7:]
        if json_str.endswith("```"):
            json_str = json_str[:-3]
        json_str = json_str.strip()

        data = json.loads(json_str)

        # Validate with Pydantic
        itinerary = ItineraryResponse(**data)
        return itinerary.model_dump()
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {e}")
        return None
    except ValidationError as e:
        logger.error(f"Validation error: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected validation error: {e}")
        return None


async def generate_itinerary_with_granite(trip_data: Dict[str, Any], max_retries: int = 2) -> Optional[Dict[str, Any]]:
    """Generate itinerary using Granite 4.2B via Ollama."""
    if settings.DEMO_MODE:
        logger.info("Demo mode enabled, skipping Granite call")
        return None

    prompt = build_itinerary_prompt(trip_data)

    for attempt in range(max_retries + 1):
        logger.info(f"Calling Granite (attempt {attempt + 1}/{max_retries + 1})")
        response = await call_ollama(prompt)

        if response:
            validated = validate_itinerary_json(response)
            if validated:
                logger.info("Successfully generated and validated itinerary")
                return validated
            else:
                logger.warning(f"Attempt {attempt + 1}: Invalid JSON from model")
        else:
            logger.warning(f"Attempt {attempt + 1}: No response from Ollama")

        if attempt < max_retries:
            await asyncio.sleep(2 ** attempt)  # Exponential backoff

    logger.error("All attempts to generate itinerary with Granite failed")
    return None


def create_demo_itinerary(trip_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a demo itinerary for testing when AI is unavailable."""
    from datetime import datetime, timedelta

    start_date = trip_data.get("start_date")
    end_date = trip_data.get("end_date")
    if isinstance(start_date, str):
        start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
    if isinstance(end_date, str):
        end_date = datetime.strptime(end_date, "%Y-%m-%d").date()

    days_count = (end_date - start_date).days + 1 if start_date and end_date else 7
    budget = trip_data.get("budget", 2000)
    travelers = trip_data.get("travelers", 1)
    destination = trip_data.get("destination", "Paris")
    interests = trip_data.get("interests", ["Sightseeing", "Food"])

    # Calculate budget breakdown
    transport_cost = budget * 0.3
    accommodation_cost = budget * 0.35
    food_cost = budget * 0.2
    activities_cost = budget * 0.1
    local_transport_cost = budget * 0.03
    misc_cost = budget * 0.02

    days = []
    for i in range(days_count):
        current_date = start_date + timedelta(days=i)
        day_activities = [
            {
                "time": "09:00",
                "activity": "Breakfast",
                "description": f"Enjoy local breakfast at a nearby cafe",
                "location": "Hotel area",
                "duration_hours": 1.5,
                "estimated_cost": 15 * travelers,
                "category": "food",
                "transportation": "Walk",
                "notes": "Try local specialties"
            },
            {
                "time": "11:00",
                "activity": f"Explore {destination} - Day {i+1}",
                "description": f"Visit top attractions matching your interests: {', '.join(interests[:2])}",
                "location": f"Central {destination}",
                "duration_hours": 4,
                "estimated_cost": 50 * travelers,
                "category": "activities",
                "transportation": "Walk/Metro",
                "notes": "Wear comfortable shoes"
            },
            {
                "time": "15:30",
                "activity": "Lunch",
                "description": "Local restaurant with regional cuisine",
                "location": "City center",
                "duration_hours": 1.5,
                "estimated_cost": 30 * travelers,
                "category": "food",
                "transportation": "Walk",
                "notes": "Ask for daily specials"
            },
            {
                "time": "17:30",
                "activity": "Afternoon Activity",
                "description": "Museum, park, or cultural site visit",
                "location": "Nearby attraction",
                "duration_hours": 2.5,
                "estimated_cost": 25 * travelers,
                "category": "activities",
                "transportation": "Metro",
                "notes": "Check opening hours"
            },
            {
                "time": "20:00",
                "activity": "Dinner",
                "description": "Dinner at recommended local restaurant",
                "location": "Popular dining area",
                "duration_hours": 2,
                "estimated_cost": 40 * travelers,
                "category": "food",
                "transportation": "Walk/Taxi",
                "notes": "Reservations recommended"
            }
        ]

        day_cost = sum(a["estimated_cost"] for a in day_activities)
        days.append(ItineraryDay(
            day=i + 1,
            date=current_date.isoformat(),
            activities=day_activities,
            total_estimated_cost=day_cost
        ).model_dump())

    total_daily = sum(d["total_estimated_cost"] for d in days)
    total = transport_cost + accommodation_cost + total_daily + local_transport_cost + misc_cost
    per_person = total / travelers if travelers > 0 else total
    daily_avg = total / days_count if days_count > 0 else total

    return {
        "overview": f"Demo {days_count}-day trip to {destination} tailored for {', '.join(interests)} enthusiasts. This is a sample itinerary generated in demo mode.",
        "days": days,
        "budget_breakdown": BudgetBreakdown(
            transportation=transport_cost,
            accommodation=accommodation_cost,
            food=food_cost,
            activities=activities_cost,
            local_transport=local_transport_cost,
            miscellaneous=misc_cost,
            total=total,
            per_person=per_person,
            daily_average=daily_avg,
            remaining_budget=max(0, budget - total)
        ).model_dump(),
        "tips": [
            "Book accommodations and popular attractions in advance",
            "Check visa requirements for your destination",
            "Get travel insurance for peace of mind",
            "Download offline maps for the area",
            "Learn basic phrases in the local language",
            "Notify your bank about international travel",
            "Pack appropriate clothing for the weather",
            "Keep digital copies of important documents"
        ],
        "is_demo": True
    }


async def check_ollama_health() -> Dict[str, Any]:
    """Check if Ollama service is available."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            if response.status_code == 200:
                models = response.json().get("models", [])
                model_names = [m.get("name", "") for m in models]
                granite_available = any(settings.GRANITE_MODEL in name for name in model_names)
                return {
                    "status": "healthy",
                    "available_models": model_names,
                    "granite_available": granite_available
                }
    except Exception as e:
        logger.warning(f"Ollama health check failed: {e}")
    return {"status": "unhealthy", "available_models": [], "granite_available": False}