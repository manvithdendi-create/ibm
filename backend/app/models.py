from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    travelers = Column(Integer, default=1)
    budget = Column(Float, default=0.0)
    currency = Column(String(10), default="USD")
    travel_style = Column(String(50), default="Standard")
    interests = Column(JSON, default=list)
    preferences = Column(JSON, default=dict)
    special_requirements = Column(Text, nullable=True)
    itinerary = Column(JSON, nullable=True)
    budget_breakdown = Column(JSON, nullable=True)
    weather_data = Column(JSON, nullable=True)
    map_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_demo = Column(Integer, default=0)  # 0 = AI generated, 1 = demo/mock

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "destination": self.destination,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "travelers": self.travelers,
            "budget": self.budget,
            "currency": self.currency,
            "travel_style": self.travel_style,
            "interests": self.interests,
            "preferences": self.preferences,
            "special_requirements": self.special_requirements,
            "itinerary": self.itinerary,
            "budget_breakdown": self.budget_breakdown,
            "weather_data": self.weather_data,
            "map_data": self.map_data,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "is_demo": bool(self.is_demo)
        }


class Destination(Base):
    __tablename__ = "destinations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    country = Column(String(255), nullable=False)
    region = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    category = Column(String(100), nullable=True)
    best_time_to_visit = Column(String(255), nullable=True)
    recommended_duration = Column(Integer, default=7)
    estimated_budget = Column(Float, default=0.0)
    currency = Column(String(10), default="USD")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_sample = Column(Integer, default=1)  # 1 = sample data, 0 = live data

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "country": self.country,
            "region": self.region,
            "description": self.description,
            "image_url": self.image_url,
            "category": self.category,
            "best_time_to_visit": self.best_time_to_visit,
            "recommended_duration": self.recommended_duration,
            "estimated_budget": self.estimated_budget,
            "currency": self.currency,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "is_sample": bool(self.is_sample)
        }