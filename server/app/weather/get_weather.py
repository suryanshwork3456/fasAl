import requests
from app.core.config import OPENWEATHER_API_KEY

BASE_URL = "https://api.openweathermap.org/data/2.5"
GEO_URL = "https://api.openweathermap.org/geo/1.0/direct"


def _geocode_location(location_name: str) -> tuple[float, float]:
    """
    Convert a free-text location string into lat/lon using OpenWeather's
    Geocoding API. Handles messy inputs like 'MNNIT Allahabad , Prayagraj'
    by trying the full string first, then falling back to the last
    comma-separated segment (usually the city) with country code 'IN'
    appended, since OpenWeather's geocoder requires a country code to
    reliably resolve Indian city names.
    """
    parts = [p.strip() for p in location_name.split(",") if p.strip()]

    candidates = [location_name]

    if parts:
        last_segment = parts[-1]
        candidates.append(f"{last_segment},IN")   # e.g. "Prayagraj,IN"
        candidates.append(last_segment)           # last resort, no country code

    for candidate in candidates:
        resp = requests.get(
            GEO_URL,
            params={"q": candidate, "limit": 1, "appid": OPENWEATHER_API_KEY},
            timeout=10,
        )
        if resp.status_code == 200 and resp.json():
            result = resp.json()[0]
            return result["lat"], result["lon"]

    raise ValueError(f"Location '{location_name}' was not recognized by weather service.")


def fetch_weather_by_location(location_name: str) -> tuple[dict, dict]:
    lat, lon = _geocode_location(location_name)

    params = {
        "lat": lat,
        "lon": lon,
        "units": "metric",
        "appid": OPENWEATHER_API_KEY,
    }

    current_resp = requests.get(
        f"{BASE_URL}/weather",
        params=params,
        timeout=10
    )

    forecast_resp = requests.get(
        f"{BASE_URL}/forecast",
        params=params,
        timeout=10
    )

    if current_resp.status_code != 200 or forecast_resp.status_code != 200:
        raise Exception("Weather API provider failed to return data.")

    return current_resp.json(), forecast_resp.json()


# ==========================================================
# Weather Score
# ==========================================================

def get_weather_score(current_weather: dict) -> int:
    """
    Score current conditions for general crop-growing suitability.

    Ideal ranges are intentionally broad/general-purpose, not
    crop-specific — a real refinement would vary this by field.crop_type.
    """

    temp = current_weather["main"]["temp"]
    humidity = current_weather["main"]["humidity"]

    # ------------------------------------------------------
    # Temperature Score
    # ------------------------------------------------------

    if 20 <= temp <= 30:
        temp_score = 100

    elif 15 <= temp < 20 or 30 < temp <= 35:
        temp_score = 75

    elif 10 <= temp < 15 or 35 < temp <= 40:
        temp_score = 50

    else:
        temp_score = 25

    # ------------------------------------------------------
    # Humidity Score
    # ------------------------------------------------------

    if 40 <= humidity <= 70:
        humidity_score = 100

    elif 30 <= humidity < 40 or 70 < humidity <= 80:
        humidity_score = 75

    elif 20 <= humidity < 30 or 80 < humidity <= 90:
        humidity_score = 50

    else:
        humidity_score = 25

    return round((temp_score + humidity_score) / 2)
