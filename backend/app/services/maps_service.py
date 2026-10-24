from typing import Dict, Any, List, Optional
import logging
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderUnavailable

logger = logging.getLogger(__name__)

# Initialize geocoder with a user agent
geolocator = Nominatim(user_agent="travelmate-ai")


def geocode_location(location: str) -> Optional[Dict[str, float]]:
    """Geocode a location name to coordinates."""
    try:
        result = geolocator.geocode(location, timeout=10)
        if result:
            return {"latitude": result.latitude, "longitude": result.longitude}
    except (GeocoderTimedOut, GeocoderUnavailable) as e:
        logger.warning(f"Geocoding failed for '{location}': {e}")
    except Exception as e:
        logger.error(f"Unexpected geocoding error for '{location}': {e}")
    return None


def get_map_data_for_trip(destination: str, days: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate map data for a trip including destination and activity markers."""
    map_data = {
        "destination": destination,
        "center": None,
        "zoom": 12,
        "markers": [],
        "routes": [],
        "note": None
    }

    # Geocode main destination
    dest_coords = geocode_location(destination)
    if dest_coords:
        map_data["center"] = [dest_coords["latitude"], dest_coords["longitude"]]
        map_data["markers"].append({
            "type": "destination",
            "name": destination,
            "latitude": dest_coords["latitude"],
            "longitude": dest_coords["longitude"],
            "description": f"Main destination: {destination}"
        })
    else:
        map_data["note"] = f"Could not geocode destination: {destination}. Map features limited."
        # Default to a reasonable center
        map_data["center"] = [0, 0]
        map_data["zoom"] = 2

    # Process activities from itinerary days
    activity_count = 0
    for day in days:
        activities = day.get("activities", [])
        for activity in activities:
            location = activity.get("location", "")
            if location and location.lower() not in ["hotel area", "city center", "nearby attraction", "popular dining area"]:
                coords = geocode_location(f"{location}, {destination}")
                if coords:
                    activity_count += 1
                    map_data["markers"].append({
                        "type": "activity",
                        "name": activity.get("activity", "Activity"),
                        "latitude": coords["latitude"],
                        "longitude": coords["longitude"],
                        "description": activity.get("description", ""),
                        "day": day.get("day", 0),
                        "time": activity.get("time", ""),
                        "estimated_cost": activity.get("estimated_cost", 0),
                        "category": activity.get("category", "general")
                    })

    # Add accommodation marker (approximate)
    if dest_coords:
        map_data["markers"].append({
            "type": "accommodation",
            "name": "Accommodation Area",
            "latitude": dest_coords["latitude"] + 0.01,
            "longitude": dest_coords["longitude"] + 0.01,
            "description": "Approximate accommodation area"
        })

    if activity_count == 0:
        map_data["note"] = (map_data["note"] or "") + " No activity locations could be geocoded."

    return map_data


def get_destination_map_data(destinations: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate map data for multiple destinations."""
    map_data = {
        "markers": [],
        "center": [0, 0],
        "zoom": 2
    }

    valid_coords = []
    for dest in destinations:
        lat = dest.get("latitude")
        lon = dest.get("longitude")
        if lat is not None and lon is not None:
            valid_coords.append([lat, lon])
            map_data["markers"].append({
                "type": "destination",
                "name": dest.get("name", "Unknown"),
                "country": dest.get("country", ""),
                "latitude": lat,
                "longitude": lon,
                "description": dest.get("description", ""),
                "category": dest.get("category", ""),
                "estimated_budget": dest.get("estimated_budget", 0),
                "currency": dest.get("currency", "USD")
            })

    if valid_coords:
        # Calculate center as average of all coordinates
        avg_lat = sum(c[0] for c in valid_coords) / len(valid_coords)
        avg_lon = sum(c[1] for c in valid_coords) / len(valid_coords)
        map_data["center"] = [avg_lat, avg_lon]
        map_data["zoom"] = 3

    return map_data


async def get_route_data(origin: str, destination: str) -> Optional[Dict[str, Any]]:
    """Get route data between two locations (requires routing service)."""
    # This would require a routing API like OSRM, GraphHopper, or Mapbox
    # For now, return None to indicate unavailable
    logger.info(f"Routing requested from {origin} to {destination} - service not configured")
    return None


def create_leaflet_map_config(map_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create configuration for Leaflet map initialization."""
    return {
        "center": map_data.get("center", [0, 0]),
        "zoom": map_data.get("zoom", 12),
        "markers": map_data.get("markers", []),
        "tile_layer": {
            "url": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            "attribution": "© OpenStreetMap contributors"
        }
    }