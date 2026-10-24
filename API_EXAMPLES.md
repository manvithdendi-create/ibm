# API Request/Response Examples

## POST /api/trips - Create Trip

### Request
```json
{
  "starting_city": "New York",
  "destination": "Paris",
  "start_date": "2024-06-01",
  "end_date": "2024-06-07",
  "travelers": 2,
  "budget": 3000,
  "currency": "USD",
  "travel_style": "Standard",
  "interests": ["Culture", "Food", "History"],
  "transportation": "Flight",
  "accommodation": "Hotel",
  "special_requirements": "Vegetarian meals preferred"
}
```

### Response (201 Created)
```json
{
  "id": 1,
  "title": "Paris Trip",
  "destination": "Paris",
  "start_date": "2024-06-01T00:00:00",
  "end_date": "2024-06-07T00:00:00",
  "travelers": 2,
  "budget": 3000,
  "currency": "USD",
  "travel_style": "Standard",
  "interests": ["Culture", "Food", "History"],
  "preferences": {
    "transportation": "Flight",
    "accommodation": "Hotel"
  },
  "special_requirements": "Vegetarian meals preferred",
  "itinerary": {
    "overview": "7-day cultural and culinary journey through Paris...",
    "days": [
      {
        "day": 1,
        "date": "2024-06-01",
        "activities": [
          {
            "time": "09:00",
            "activity": "Arrival & Check-in",
            "description": "Arrive at CDG, transfer to hotel, check-in",
            "location": "Hotel Le Marais",
            "duration_hours": 2,
            "estimated_cost": 50,
            "category": "transportation",
            "transportation": "Taxi",
            "notes": "Pre-book airport transfer"
          }
        ],
        "total_estimated_cost": 150
      }
    ],
    "budget_breakdown": {
      "transportation": 800,
      "accommodation": 1400,
      "food": 600,
      "activities": 400,
      "local_transport": 200,
      "miscellaneous": 100,
      "total": 3500,
      "per_person": 1750,
      "daily_average": 500,
      "remaining_budget": 0
    },
    "tips": [
      "Book Louvre tickets in advance",
      "Try croissants at Du Pain et des Idées",
      "Use Metro for efficient travel"
    ],
    "is_demo": false
  },
  "budget_breakdown": {
    "transportation": 800,
    "accommodation": 1400,
    "food": 600,
    "activities": 400,
    "local_transport": 200,
    "miscellaneous": 100,
    "total": 3500,
    "per_person": 1750,
    "daily_average": 500,
    "remaining_budget": 0,
    "currency": "USD"
  },
  "weather_data": {
    "destination": "Paris",
    "current": {
      "temperature": 18,
      "condition": "Clouds",
      "description": "overcast clouds"
    },
    "forecast": [
      {
        "date": "2024-06-01",
        "temp_min": 14,
        "temp_max": 22,
        "condition": "Rain",
        "description": "light rain"
      }
    ],
    "source": "OpenWeatherMap"
  },
  "map_data": {
    "destination": "Paris",
    "center": [48.8566, 2.3522],
    "zoom": 12,
    "markers": [
      {
        "type": "destination",
        "name": "Paris",
        "latitude": 48.8566,
        "longitude": 2.3522
      }
    ]
  },
  "created_at": "2024-05-15T10:30:00",
  "updated_at": "2024-05-15T10:30:00",
  "is_demo": false
}
```

## GET /api/trips - List Trips

### Response (200 OK)
```json
[
  {
    "id": 1,
    "title": "Paris Trip",
    "destination": "Paris",
    "start_date": "2024-06-01T00:00:00",
    "end_date": "2024-06-07T00:00:00",
    "travelers": 2,
    "budget": 3000,
    "currency": "USD",
    "travel_style": "Standard",
    "interests": ["Culture", "Food"],
    "preferences": {
      "transportation": "Flight",
      "accommodation": "Hotel"
    },
    "special_requirements": null,
    "itinerary": {...},
    "budget_breakdown": {...},
    "weather_data": {...},
    "map_data": {...},
    "created_at": "2024-05-15T10:30:00",
    "updated_at": "2024-05-15T10:30:00",
    "is_demo": false
  }
]
```

## GET /api/destinations - List Destinations

### Query Parameters
- `category` (optional): Filter by category (e.g., "Beaches")
- `min_budget` (optional): Minimum budget
- `max_budget` (optional): Maximum budget
- `duration` (optional): Max recommended duration in days
- `search` (optional): Search term

### Response (200 OK)
```json
[
  {
    "id": 1,
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
    "is_sample": true
  }
]
```

## GET /api/weather/{destination} - Weather Forecast

### Query Parameters
- `start_date` (required): Start date (YYYY-MM-DD)
- `end_date` (required): End date (YYYY-MM-DD)

### Response (200 OK)
```json
{
  "destination": "Paris",
  "current": {
    "temperature": 18,
    "feels_like": 17,
    "condition": "Clouds",
    "description": "overcast clouds",
    "humidity": 72,
    "wind_speed": 3.5,
    "icon": "04d",
    "timestamp": "2024-05-15T10:30:00"
  },
  "forecast": [
    {
      "date": "2024-06-01",
      "temp_min": 14,
      "temp_max": 22,
      "condition": "Rain",
      "description": "light rain",
      "icon": "10d",
      "humidity": 80,
      "wind_speed": 5.2
    }
  ],
  "source": "OpenWeatherMap",
  "note": "Forecast only covers up to 5 days"
}
```

## GET /api/health - Health Check

### Response (200 OK)
```json
{
  "status": "healthy",
  "database": "healthy",
  "ai_service": {
    "status": "healthy",
    "available_models": ["granite3.2:4b", "llama3:8b"],
    "granite_available": true
  },
  "version": "1.0.0"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "End date must be after start date",
  "error_code": "VALIDATION_ERROR"
}
```

### 404 Not Found
```json
{
  "detail": "Trip not found",
  "error_code": "NOT_FOUND"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Failed to generate itinerary: AI service unavailable",
  "error_code": "AI_SERVICE_ERROR"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "budget"],
      "msg": "Budget must be greater than 0",
      "type": "value_error"
    }
  ]
}
```