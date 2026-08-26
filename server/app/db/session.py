from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session, DeclarativeBase
from contextlib import contextmanager

from app.core.config import settings

engine = create_engine(settings.database_url, echo=False, pool_pre_ping=True)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False,
    class_=Session,
)

class Base(DeclarativeBase):
    pass

@contextmanager
def session_manager():
    session = SessionLocal()
    try:
        yield session
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def get_db():
    with session_manager() as session:
        yield session


def init_db():
    Base.metadata.create_all(bind=engine)