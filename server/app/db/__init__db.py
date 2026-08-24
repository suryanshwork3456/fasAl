import asyncio
from app.db.session import init_db as _init_db
from app.models import leaf_scan   



async def main():
    print("Creating tables...")
    await _init_db()
    print("Done. Tables created (if they didn't already exist).")


if __name__ == "__main__":
    asyncio.run(main())