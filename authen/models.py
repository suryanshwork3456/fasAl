from sqlalchemy import BigInteger,  String, DateTime
from sqlalchemy.orm import DeclarativeBase,Mapped,mapped_column
from datetime import datetime

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(
        BigInteger, 
        primary_key=True, 
        autoincrement=True
        )
    phone: Mapped[str] = mapped_column(
        String(10), 
        unique=True, 
        nullable=False,
        index=True
        )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow
        )