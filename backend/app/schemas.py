from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from enum import Enum


class TravelStyle(str, Enum):
    BUDGET = "Budget"
    STANDARD = "Standard"
    LUXURY = "Luxury"


class Interest(str, Enum):
    ADVENTURE = "Adventure"
    FOOD = "Food"
    NATURE = "Nature"
    HISTORY = "History"
    SHOPPING = "Shopping"
    BEACHES = "Beaches"
    RELAXATION = "Relaxation"


class TransportationType(str, Enum):
    FLIGHT = "Flight"
    TRAIN = "Train"
    BUS = "Bus"
    CAR = "Car"
    FERRY = "Ferry"
    MIXED = "Mixed"


class AccommodationType(str, Enum):
    HOSTEL = "Hostel"
    HOTEL = "Hotel"
    RESORT = "Resort"
    AIRBNB = "Airbnb"
    CAMPING = "Camping"
    BOUTIQUE = "Boutique"


class TripCreate(BaseModel):
    starting_city: str = Field(..., min_length=1, max_length=255)
    destination: str = Field(..., min_length=1, max_length=255)
    start_date: date
    end_date: date
    travelers: int = Field(..., ge=1, le=20)
    budget: float = Field(..., ge=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    travel_style: TravelStyle = TravelStyle.STANDARD
    interests: List[Interest] = Field(default_factory=list)
    transportation: TransportationType = TransportationType.FLIGHT
    accommodation: AccommodationType = AccommodationType.HOTEL
    special_requirements: Optional[str] = None

    @validator('end_date')
    def end_after_start(cls, v, values):
        if 'start_date' in values and v < values['start_date']:
            raise ValueError('End date must be after start date')
        return v


class TripUpdate(BaseModel):
    title: Optional[str] = None
    destination: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    travelers: Optional[int] = None
    budget: Optional[float] = None
    currency: Optional[str] = None
    travel_style: Optional[TravelStyle] = None
    interests: Optional[List[Interest]] = None
    preferences: Optional[Dict[str, Any]] = None
    special_requirements: Optional[str] = None


class TripResponse(BaseModel):
    id: int
    title: str
    destination: str
    start_date: datetime
    end_date: datetime
    travelers: int
    budget: float
    currency: str
    travel_style: str
    interests: List[str]
    preferences: Dict[str, Any]
    special_requirements: Optional[str]
    itinerary: Optional[Dict[str, Any]]
    budget_breakdown: Optional[Dict[str, Any]]
    weather_data: Optional[Dict[str, Any]]
    map_data: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    is_demo: bool

    class Config:
        from_attributes = True


class DestinationResponse(BaseModel):
    id: int
    name: str
    country: str
    region: Optional[str]
    description: Optional[str]
    image_url: Optional[str]
    category: Optional[str]
    best_time_to_visit: Optional[str]
    recommended_duration: int
    estimated_budget: float
    currency: str
    latitude: Optional[float]
    longitude: Optional[float]
    is_sample: bool

    class Config:
        from_attributes = True


class WeatherResponse(BaseModel):
    destination: str
    current: Optional[Dict[str, Any]]
    forecast: List[Dict[str, Any]]
    source: str
    note: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    ai_service: str
    database: str
    version: str


class BudgetBreakdown(BaseModel):
    transportation: float = 0
    accommodation: float = 0
    food: float = 0
    activities: float = 0
    local_transport: float = 0
    miscellaneous: float = 0
    total: float = 0
    per_person: float = 0
    daily_average: float = 0
    remaining_budget: float = 0


class ItineraryDay(BaseModel):
    day: int
    date: str
    activities: List[Dict[str, Any]]
    total_estimated_cost: float


class ItineraryResponse(BaseModel):
    overview: str
    days: List[ItineraryDay]
    budget_breakdown: BudgetBreakdown
    tips: List[str]
    is_demo: bool = False


class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None