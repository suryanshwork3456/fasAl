from app.db.session import SessionLocal
from sqlalchemy import text

db = SessionLocal()

try:
    # Check if any user exists
    user = db.execute(text('SELECT id FROM users LIMIT 1')).fetchone()

    if user:
        user_id = user[0]
        print(f"Found user with ID: {user_id}")

        # Check if dashboard exists for this user
        existing = db.execute(
            text('SELECT id FROM dashboard WHERE user_id = :user_id'),
            {'user_id': user_id}
        ).fetchone()

        if not existing:
            # Create dashboard entry
            db.execute(
                text('''
                    INSERT INTO dashboard (user_id, crop_health, total_fields, active_alerts, next_irrigation)
                    VALUES (:user_id, 75.0, 0, 0, 2.0)
                '''),
                {'user_id': user_id}
            )
            db.commit()
            print(f'✅ Dashboard created for user {user_id}')
        else:
            print(f'ℹ️ Dashboard already exists for user {user_id}')
    else:
        print('❌ No users found. Create a user first.')
        print('Run this to create a test user:')
        print('python create_user.py')

except Exception as e:
    print(f"Error: {e}")
    db.rollback()
finally:
    db.close()
