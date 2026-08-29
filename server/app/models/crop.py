from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, DateTime, JSON, create_engine
from sqlalchemy.orm import Mapped, mapped_column, sessionmaker
from app.db.session import Base

class CropAnalysis(Base):
    __tablename__ = "crop_analyses"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    crop_name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    disease_name: Mapped[str] = mapped_column(String(100), default="N/A")
    confidence: Mapped[str] = mapped_column(String(20), nullable=False)
    
    # Store list data as JSON arrays (compatible across SQL databases)
    symptoms: Mapped[List[str]] = mapped_column(JSON, nullable=False)
    treatment: Mapped[List[str]] = mapped_column(JSON, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<CropAnalysis(id={self.id}, crop_name='{self.crop_name}', status='{self.status}')>"