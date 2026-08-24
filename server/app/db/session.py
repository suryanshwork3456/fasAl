
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from contextlib import asynccontextmanager

from app.core.config import settings

engine = create_async_engine(settings.database_url,echo=False, pool_pre_ping=True)

AsyncSessionLocal = async_sessionmaker(
    bind = engine,
    autoflush=False,
    expire_on_commit=False,
    class_=AsyncSession,
)

class Base(DeclarativeBase):
    pass

@asynccontextmanager
async def session_manager():
    session = AsyncSessionLocal()
    try:
        yield session
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()


async def get_db():
    async with session_manager() as session:
        yield session


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)