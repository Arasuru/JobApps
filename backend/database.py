# backend/database.py
import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

logger = logging.getLogger(__name__)

#Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cv_builder.db")

#Base Class
class Base(DeclarativeBase):
    pass

#Engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # SQLite only
    echo=False,  # Set to True to log all SQL queries during debugging
)

#Session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

#Dependency
def get_db():
    db = SessionLocal()
    try:
        logger.debug("DB session opened")
        yield db
    except Exception:
        logger.error("DB session error, rolling back", exc_info=True)
        db.rollback()
        raise
    finally:
        logger.debug("DB session closed")
        db.close()