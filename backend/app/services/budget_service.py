from typing import Dict, Any, Optional
from datetime import date
from app.schemas import BudgetBreakdown


# Base daily costs per person by travel style (in USD)
DAILY_COSTS = {
    "Budget": {
        "accommodation": 30,
        "food": 25,
        "local_transport": 10,
        "activities": 15,
        "miscellaneous": 10
    },
    "Standard": {
        "accommodation": 100,
        "food": 60,
        "local_transport": 25,
        "activities": 50,
        "miscellaneous": 25
    },
    "Luxury": {
        "accommodation": 300,
        "food": 150,
        "local_transport": 80,
        "activities": 150,
        "miscellaneous": 80
    }
}

# Transportation cost estimates (round trip per person)
TRANSPORT_COSTS = {
    "Flight": {"domestic": 300, "international": 800, "intercontinental": 1500},
    "Train": {"domestic": 100, "international": 300, "intercontinental": 0},
    "Bus": {"domestic": 50, "international": 150, "intercontinental": 0},
    "Car": {"domestic": 0.50, "international": 0.60, "intercontinental": 0},  # per km
    "Ferry": {"domestic": 50, "international": 200, "intercontinental": 0},
    "Mixed": {"domestic": 200, "international": 600, "intercontinental": 1200}
}

# Currency conversion rates (approximate, should use live API in production)
CURRENCY_RATES = {
    "USD": 1.0,
    "EUR": 0.92,
    "GBP": 0.79,
    "JPY": 150.0,
    "CHF": 0.88,
    "CAD": 1.35,
    "AUD": 1.52,
    "CNY": 7.2,
    "INR": 83.0,
    "BRL": 5.0,
    "MXN": 17.0,
    "IDR": 15500.0,
    "THB": 36.0,
    "VND": 24500.0,
    "KRW": 1330.0,
    "SGD": 1.35,
    "HKD": 7.8,
    "NZD": 1.63,
    "ZAR": 18.5,
    "PEN": 3.7,
    "AED": 3.67
}


def estimate_transport_cost(
    starting_city: str,
    destination: str,
    transport_type: str,
    travelers: int,
    currency: str = "USD"
) -> float:
    """Estimate transportation cost based on route and type."""
    # Simplified distance estimation
    # In production, use a proper distance API
    international_keywords = ["paris", "london", "tokyo", "rome", "barcelona", "amsterdam",
                             "berlin", "madrid", "dubai", "singapore", "hong kong",
                             "sydney", "melbourne", "toronto", "vancouver", "mexico city",
                             "buenos aires", "rio de janeiro", "cape town", "cairo",
                             "mumbai", "delhi", "bangkok", "bali", "phuket", "seoul"]

    dest_lower = destination.lower()
    start_lower = starting_city.lower()

    is_international = any(kw in dest_lower for kw in international_keywords)
    is_intercontinental = False  # Simplified

    if is_international:
        if "america" in start_lower or "usa" in start_lower or "canada" in start_lower:
            is_intercontinental = True

    transport_key = transport_type if transport_type in TRANSPORT_COSTS else "Mixed"

    if is_intercontinental:
        base_cost = TRANSPORT_COSTS[transport_key].get("intercontinental", 1200)
    elif is_international:
        base_cost = TRANSPORT_COSTS[transport_key].get("international", 600)
    else:
        base_cost = TRANSPORT_COSTS[transport_key].get("domestic", 200)

    return base_cost * travelers


def calculate_budget_breakdown(
    ai_breakdown: Dict[str, Any],
    total_budget: float,
    travelers: int,
    days: int,
    travel_style: str = "Standard",
    currency: str = "USD"
) -> Dict[str, Any]:
    """Calculate detailed budget breakdown combining AI estimates with calculated values."""

    # Use AI breakdown if available and reasonable, otherwise calculate
    if ai_breakdown and ai_breakdown.get("total", 0) > 0:
        # Validate AI breakdown
        transport = ai_breakdown.get("transportation", 0)
        accommodation = ai_breakdown.get("accommodation", 0)
        food = ai_breakdown.get("food", 0)
        activities = ai_breakdown.get("activities", 0)
        local_transport = ai_breakdown.get("local_transport", 0)
        miscellaneous = ai_breakdown.get("miscellaneous", 0)
    else:
        # Calculate from daily costs
        style_costs = DAILY_COSTS.get(travel_style, DAILY_COSTS["Standard"])
        accommodation = style_costs["accommodation"] * days * travelers
        food = style_costs["food"] * days * travelers
        local_transport = style_costs["local_transport"] * days * travelers
        activities = style_costs["activities"] * days * travelers
        miscellaneous = style_costs["miscellaneous"] * days * travelers
        transport = 0  # Will be calculated separately

    # Ensure we have transport cost
    if transport == 0:
        # This would need starting city - using a default estimate
        transport = 500 * travelers

    total = transport + accommodation + food + activities + local_transport + miscellaneous
    per_person = total / travelers if travelers > 0 else total
    daily_average = total / days if days > 0 else total
    remaining = max(0, total_budget - total)

    # Convert to target currency if needed
    if currency != "USD" and currency in CURRENCY_RATES:
        rate = CURRENCY_RATES[currency]
        transport = round(transport * rate, 2)
        accommodation = round(accommodation * rate, 2)
        food = round(food * rate, 2)
        activities = round(activities * rate, 2)
        local_transport = round(local_transport * rate, 2)
        miscellaneous = round(miscellaneous * rate, 2)
        total = round(total * rate, 2)
        per_person = round(per_person * rate, 2)
        daily_average = round(daily_average * rate, 2)
        remaining = round(remaining * rate, 2)

    return {
        "transportation": round(transport, 2),
        "accommodation": round(accommodation, 2),
        "food": round(food, 2),
        "activities": round(activities, 2),
        "local_transport": round(local_transport, 2),
        "miscellaneous": round(miscellaneous, 2),
        "total": round(total, 2),
        "per_person": round(per_person, 2),
        "daily_average": round(daily_average, 2),
        "remaining_budget": round(remaining, 2),
        "currency": currency,
        "note": "Estimated costs based on travel style averages. Actual costs may vary significantly."
    }


def recalculate_budget(
    current_breakdown: Dict[str, Any],
    changes: Dict[str, Any]
) -> Dict[str, Any]:
    """Recalculate budget when trip details change."""
    # Extract current values
    transport = current_breakdown.get("transportation", 0)
    accommodation = current_breakdown.get("accommodation", 0)
    food = current_breakdown.get("food", 0)
    activities = current_breakdown.get("activities", 0)
    local_transport = current_breakdown.get("local_transport", 0)
    miscellaneous = current_breakdown.get("miscellaneous", 0)
    travelers = changes.get("travelers", 1)
    days = changes.get("days", 7)
    travel_style = changes.get("travel_style", "Standard")
    currency = changes.get("currency", "USD")

    # Recalculate based on changes
    if "travelers" in changes or "days" in changes or "travel_style" in changes:
        style_costs = DAILY_COSTS.get(travel_style, DAILY_COSTS["Standard"])
        accommodation = style_costs["accommodation"] * days * travelers
        food = style_costs["food"] * days * travelers
        local_transport = style_costs["local_transport"] * days * travelers
        activities = style_costs["activities"] * days * travelers
        miscellaneous = style_costs["miscellaneous"] * days * travelers

    if "transportation" in changes:
        transport = changes["transportation"]

    total = transport + accommodation + food + activities + local_transport + miscellaneous
    per_person = total / travelers if travelers > 0 else total
    daily_average = total / days if days > 0 else total
    remaining = max(0, changes.get("budget", total) - total)

    return {
        "transportation": round(transport, 2),
        "accommodation": round(accommodation, 2),
        "food": round(food, 2),
        "activities": round(activities, 2),
        "local_transport": round(local_transport, 2),
        "miscellaneous": round(miscellaneous, 2),
        "total": round(total, 2),
        "per_person": round(per_person, 2),
        "daily_average": round(daily_average, 2),
        "remaining_budget": round(remaining, 2),
        "currency": currency
    }


def format_currency(amount: float, currency: str = "USD") -> str:
    """Format amount as currency string."""
    symbols = {
        "USD": "$", "EUR": "€", "GBP": "£", "JPY": "¥",
        "CHF": "CHF ", "CAD": "C$", "AUD": "A$", "CNY": "¥",
        "INR": "₹", "BRL": "R$", "MXN": "$", "IDR": "Rp",
        "THB": "฿", "VND": "₫", "KRW": "₩", "SGD": "S$",
        "HKD": "HK$", "NZD": "NZ$", "ZAR": "R", "PEN": "S/",
        "AED": "د.إ"
    }
    symbol = symbols.get(currency, currency + " ")
    return f"{symbol}{amount:,.2f}"