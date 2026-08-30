from datetime import datetime
from fastapi import Depends, HTTPException, APIRouter
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.api.v1.endpoints.deps_auth import get_current_user
from app.weather.get_location import get_first_field_coords
from app.weather.get_weather import fetch_weather_by_coords

router = APIRouter()

@router.get("/first-field")
def get_first_field_weather(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        lat, lon = get_first_field_coords(db, user_id=current_user.id)  # <-- pass user_id through
    except ValueError as err:
        raise HTTPException(status_code=404, detail=str(err))

    try:
        curr_raw, forecast_raw = fetch_weather_by_coords(lat, lon)
    except Exception as err:
        raise HTTPException(status_code=502, detail=str(err))

    current_weather = {
        "temperature": round(curr_raw.get("main", {}).get("temp", 0)),
        "humidity": curr_raw.get("main", {}).get("humidity", 0),
        "rainfall": curr_raw.get("rain", {}).get("1h", 0.0),
        "wind_speed": round(curr_raw.get("wind", {}).get("speed", 0) * 3.6),
    }

    daily_forecasts = []
    for item in forecast_raw.get("list", []):
        if "12:00:00" in item.get("dt_txt", ""):
            dt_obj = datetime.fromtimestamp(item["dt"])
            daily_forecasts.append({
                "day": dt_obj.strftime("%a"),
                "temp": round(item["main"]["temp"]),
                "rain_probability": round(item.get("pop", 0) * 100),
                "condition": item["weather"][0]["main"],
            })
            if len(daily_forecasts) == 5:
                break

    if daily_forecasts:
        daily_forecasts[0]["day"] = "Today"

    return {
        "note": "Weather data fetched for your 1st registered field only.",
        "field_coordinates": {"lat": lat, "lon": lon},
        "current": current_weather,
        "forecast": daily_forecasts,
    }