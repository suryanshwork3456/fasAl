import requests
from app.core.config import OPENWEATHER_API_KEY

BASE_URL = "https://api.openweathermap.org/data/2.5"


def fetch_weather_by_coords(lat: float, lon: float) -> tuple[dict, dict]:
    """
    Fetch current weather + 5-day forecast directly from OpenWeather using
    coordinates. No geocoding needed — coordinates are exact by definition,
    unlike free-text location names.
    """
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