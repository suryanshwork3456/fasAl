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

    current_resp = requests.get(f"{BASE_URL}/weather", params=params, timeout=10)
    forecast_resp = requests.get(f"{BASE_URL}/forecast", params=params, timeout=10)

    if current_resp.status_code != 200 or forecast_resp.status_code != 200:
        raise Exception("Weather API provider failed to return data.")

    return current_resp.json(), forecast_resp.json()