from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from database import Base

class ApplicationTracker(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, index=True)
    job_title = Column(String)
    status = Column(String, default="Wishlist")
    job_url = Column(String, nullable=True)
    job_location = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    date_added = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)