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
