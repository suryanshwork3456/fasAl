from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, APIRouter
from sqlalchemy.orm import Session
from app.db.session import get_db  # Adjust import to match your session file
from app.weather.get_location import get_first_field_location
from app.weather.get_weather import fetch_weather_by_location

router = APIRouter()

@router.get("/first-field")
def get_first_field_weather(db: Session = Depends(get_db)):
    # 1. Fetch location from row 1 of field_form table
    try:
        location_name = get_first_field_location(db)
    except ValueError as err:
        raise HTTPException(status_code=404, detail=str(err))

    # 2. Retrieve raw weather data from API
    try:
        curr_raw, forecast_raw = fetch_weather_by_location(location_name)
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))
    except Exception as err:
        raise HTTPException(status_code=502, detail=str(err))

    # 3. Format top UI card values
    current_weather = {
    "temperature": round(curr_raw.get("main", {}).get("temp", 0)),
    "humidity": curr_raw.get("main", {}).get("humidity", 0),
    "rainfall": curr_raw.get("rain", {}).get("1h", 0.0),
    "wind_speed": round(curr_raw.get("wind", {}).get("speed", 0) * 3.6)  # m/s to km/h
}

    # 4. Format 5-day forecast UI values (selecting 12:00 PM snapshots)
    daily_forecasts = []
    for item in forecast_raw.get("list", []):
        if "12:00:00" in item.get("dt_txt", ""):
            dt_obj = datetime.fromtimestamp(item["dt"])
            daily_forecasts.append({
                "day": dt_obj.strftime("%a"),  # e.g., "Thu"
                "temp": round(item["main"]["temp"]),
                "rain_probability": round(item.get("pop", 0) * 100),
                "condition": item["weather"][0]["main"]
            })
            if len(daily_forecasts) == 5:
                break

    if daily_forecasts:
        daily_forecasts[0]["day"] = "Today"

    # 5. Output payload
    return {
        "note": "Weather data fetched for your 1st registered field only.",
        "field_location": location_name,
        "current": current_weather,
        "forecast": daily_forecasts
    }