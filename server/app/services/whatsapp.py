"""
SMS alerting via Twilio — sends a simple health-score warning to a
farmer's phone. Switched from WhatsApp because Twilio's Content
Template API (required for WhatsApp messages outside an active
session) is not available on trial accounts. SMS has no such
restriction and works immediately on a trial account.

Note: Twilio trial accounts can ONLY send SMS to numbers that have
been verified in the Twilio Console (Phone Numbers -> Verified
Caller IDs) — this is a trial-account limitation, not a bug. Verify
the recipient's number there if this fails with an "unverified"
error.
"""

from datetime import datetime, date
from twilio.rest import Client

from app.core.config import settings

_alerted_today: dict[int, date] = {}

ALERT_THRESHOLD = 60


def _get_client() -> Client | None:
    if not settings.twilio_account_sid or not settings.twilio_auth_token:
        print("Twilio not configured — skipping SMS alert.")
        return None
    return Client(settings.twilio_account_sid, settings.twilio_auth_token)


def maybe_send_health_alert(field_id: int, field_name: str, soil_type: str,
                            health_score: int, mobile_number: str) -> bool:
    """
    Sends an SMS alert if health_score is below the threshold AND
    this field hasn't already triggered an alert today.
    """
    if health_score >= ALERT_THRESHOLD:
        return False

    today = datetime.now().date()
    if _alerted_today.get(field_id) == today:
        return False

    client = _get_client()
    if not client:
        return False

    message_body = (
        f"FasAI Alert: Field '{field_name}' (soil: {soil_type}) has a "
        f"health score of {health_score}/100. Please inspect soon — "
        f"check for water stress, pests, or nutrient deficiency."
    )

    try:
        to_number = mobile_number if mobile_number.startswith(
            "+") else f"+{mobile_number}"
        client.messages.create(
            from_=settings.twilio_sms_number,
            to=to_number,
            body=message_body,
        )
        _alerted_today[field_id] = today
        print(f"SMS alert sent for field {field_id}")
        return True
    except Exception as e:
        print(f"SMS alert failed for field {field_id}: {e}")
        return False
