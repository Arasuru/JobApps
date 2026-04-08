# backend/tracker.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.application_tracker import ApplicationTracker
from schemas.schemas import ApplicationCreate, ApplicationResponse, ApplicationUpdate

# API ROUTER & ENDPOINTS
router = APIRouter(
    prefix="/tracker",
)

@router.post("/applications", response_model=ApplicationResponse)
async def create_application(app_in: ApplicationCreate, db: Session = Depends(get_db)):
    db_app = ApplicationTracker(**app_in.model_dump())
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app

@router.get("/applications", response_model=List[ApplicationResponse])
async def get_all_applications(db: Session = Depends(get_db)):
    return db.query(ApplicationTracker).all()


@router.patch("/applications/{app_id}/status", response_model=ApplicationResponse)
async def update_application_status(app_id: int, update_data: ApplicationUpdate, db: Session = Depends(get_db)):
    db_app = db.query(ApplicationTracker).filter(ApplicationTracker.id == app_id).first()
    
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    db_app.status = update_data.new_status
    db.commit()
    db.refresh(db_app)
    return db_app


@router.delete("/applications/{app_id}")
async def delete_application(app_id: int, db: Session = Depends(get_db)):
    db_app = db.query(ApplicationTracker).filter(ApplicationTracker.id == app_id).first()
    
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    db.delete(db_app)
    db.commit()
    return {"message": "Application deleted successfully"}