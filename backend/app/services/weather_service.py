from typing import Dict, Any, List, Optional
import logging
import httpx
from datetime import date, datetime, timedelta

from app.config import settings

logger = logging.getLogger(__name__)


async def get_weather_for_destination(
    destination: str,
    start_date: date,
    end_date: date
) -> Dict[str, Any]:
    """Get weather forecast for a destination."""
    weather_data = {
        "destination": destination,
        "current": None,
        "forecast": [],
        "source": "OpenWeatherMap",
        "note": None
    }

    # If no API key, return mock/unavailable data
    if not settings.OPENWEATHER_API_KEY:
        weather_data["note"] = "Weather data unavailable: OpenWeatherMap API key not configured. Please add OPENWEATHER_API_KEY to your .env file."
        weather_data["source"] = "unavailable"
        return weather_data

    # Geocode destination to get coordinates
    coords = await geocode_for_weather(destination)
    if not coords:
        weather_data["note"] = f"Could not determine coordinates for {destination}."
        weather_data["source"] = "error"
        return weather_data

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            # Get current weather
            current_url = "https://api.openweathermap.org/data/2.5/weather"
            current_params = {
                "lat": coords["latitude"],
                "lon": coords["longitude"],
                "appid": settings.OPENWEATHER_API_KEY,
                "units": "metric"
            }
            current_response = await client.get(current_url, params=current_params)
            current_response.raise_for_status()
            current_data = current_response.json()

            weather_data["current"] = {
                "temperature": round(current_data["main"]["temp"]),
                "feels_like": round(current_data["main"]["feels_like"]),
                "condition": current_data["weather"][0]["main"],
                "description": current_data["weather"][0]["description"],
                "humidity": current_data["main"]["humidity"],
                "wind_speed": current_data["wind"]["speed"],
                "icon": current_data["weather"][0]["icon"],
                "timestamp": datetime.utcnow().isoformat()
            }

            # Get 5-day forecast (3-hour intervals)
            forecast_url = "https://api.openweathermap.org/data/2.5/forecast"
            forecast_params = {
                "lat": coords["latitude"],
                "lon": coords["longitude"],
                "appid": settings.OPENWEATHER_API_KEY,
                "units": "metric"
            }
            forecast_response = await client.get(forecast_url, params=forecast_params)
            forecast_response.raise_for_status()
            forecast_data = forecast_response.json()

            # Process forecast for trip dates
            trip_start = datetime.combine(start_date, datetime.min.time())
            trip_end = datetime.combine(end_date, datetime.max.time())

            daily_forecasts = {}
            for item in forecast_data.get("list", []):
                dt = datetime.fromtimestamp(item["dt"])
                if trip_start <= dt <= trip_end:
                    date_key = dt.date().isoformat()
                    if date_key not in daily_forecasts:
                        daily_forecasts[date_key] = {
                            "date": date_key,
                            "temps": [],
                            "conditions": [],
                            "descriptions": [],
                            "icons": [],
                            "humidity": [],
                            "wind_speeds": []
                        }
                    daily_forecasts[date_key]["temps"].append(item["main"]["temp"])
                    daily_forecasts[date_key]["conditions"].append(item["weather"][0]["main"])
                    daily_forecasts[date_key]["descriptions"].append(item["weather"][0]["description"])
                    daily_forecasts[date_key]["icons"].append(item["weather"][0]["icon"])
                    daily_forecasts[date_key]["humidity"].append(item["main"]["humidity"])
                    daily_forecasts[date_key]["wind_speeds"].append(item["wind"]["speed"])

            # Convert to daily summaries
            for date_key in sorted(daily_forecasts.keys()):
                day_data = daily_forecasts[date_key]
                weather_data["forecast"].append({
                    "date": date_key,
                    "temp_min": round(min(day_data["temps"])),
                    "temp_max": round(max(day_data["temps"])),
                    "condition": max(set(day_data["conditions"]), key=day_data["conditions"].count),
                    "description": max(set(day_data["descriptions"]), key=day_data["descriptions"].count),
                    "icon": day_data["icons"][len(day_data["icons"]) // 2],  # Midday icon
                    "humidity": round(sum(day_data["humidity"]) / len(day_data["humidity"])),
                    "wind_speed": round(sum(day_data["wind_speeds"]) / len(day_data["wind_speeds"]), 1)
                })

            # Check if forecast covers trip dates
            forecast_dates = set(daily_forecasts.keys())
            trip_dates = {(start_date + timedelta(days=i)).isoformat() for i in range((end_date - start_date).days + 1)}
            missing_dates = trip_dates - forecast_dates
            if missing_dates:
                weather_data["note"] = f"Forecast only covers up to 5 days. Missing data for: {', '.join(sorted(missing_dates))}"

    except httpx.HTTPStatusError as e:
        logger.error(f"Weather API error: {e.response.status_code} - {e.response.text}")
        weather_data["note"] = f"Weather API error: {e.response.status_code}"
        weather_data["source"] = "error"
    except httpx.TimeoutException:
        logger.error("Weather API request timed out")
        weather_data["note"] = "Weather service request timed out"
        weather_data["source"] = "error"
    except Exception as e:
        logger.error(f"Unexpected weather service error: {e}")
        weather_data["note"] = "Failed to retrieve weather data"
        weather_data["source"] = "error"

    return weather_data


async def geocode_for_weather(location: str) -> Optional[Dict[str, float]]:
    """Geocode location for weather API using OpenWeatherMap geocoding."""
    if not settings.OPENWEATHER_API_KEY:
        # Fallback to basic geocoding
        from app.services.maps_service import geocode_location
        return geocode_location(location)

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            url = "http://api.openweathermap.org/geo/1.0/direct"
            params = {
                "q": location,
                "limit": 1,
                "appid": settings.OPENWEATHER_API_KEY
            }
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            if data:
                return {"latitude": data[0]["lat"], "longitude": data[0]["lon"]}
    except Exception as e:
        logger.warning(f"OpenWeather geocoding failed for '{location}': {e}")

    # Fallback
    from app.services.maps_service import geocode_location
    return geocode_location(location)


def get_weather_recommendations(weather_data: Dict[str, Any]) -> List[str]:
    """Generate activity recommendations based on weather."""
    recommendations = []

    if not weather_data.get("forecast"):
        return ["Weather data unavailable - plan flexible indoor/outdoor activities"]

    for day in weather_data["forecast"]:
        condition = day.get("condition", "").lower()
        temp_min = day.get("temp_min", 20)
        temp_max = day.get("temp_max", 25)

        if condition in ["rain", "drizzle", "thunderstorm"]:
            recommendations.append(f"{day['date']}: Rain expected - consider museums, indoor markets, covered attractions")
        elif condition in ["snow"]:
            recommendations.append(f"{day['date']}: Snow expected - winter activities, warm indoor venues recommended")
        elif temp_max > 35:
            recommendations.append(f"{day['date']}: Very hot ({temp_max}°C) - plan early morning/evening activities, stay hydrated")
        elif temp_min < 5:
            recommendations.append(f"{day['date']}: Cold ({temp_min}°C) - dress warmly, consider indoor alternatives")
        elif condition in ["clear", "clouds"] and 15 <= temp_max <= 28:
            recommendations.append(f"{day['date']}: Pleasant weather - great for outdoor activities and sightseeing")

    if not recommendations:
        recommendations.append("Check daily forecasts closer to your trip for detailed planning")

    return recommendations