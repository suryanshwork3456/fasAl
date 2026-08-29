# from datetime import datetime

# from sqlalchemy import BigInteger, DateTime, String
# from sqlalchemy.orm import Mapped, mapped_column
# from app.db.session import Base


# class User(Base):
#     __tablename__ = "users"

#     id: Mapped[int] = mapped_column(
#         BigInteger,
#         primary_key=True,
#         autoincrement=True,
#     )
#     phone: Mapped[str] = mapped_column(
#         String(10),
#         unique=True,
#         nullable=False,
#         index=True,
#     )
#     created_at: Mapped[datetime] = mapped_column(
#         DateTime(timezone=True),
#         default=datetime.utcnow,
#     )
