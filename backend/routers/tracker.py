# backend/tracker.py
import os
import httpx

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.application_tracker import ApplicationTracker
from schemas.schemas import ApplicationCreate, ApplicationResponse, ApplicationUpdate, MessageResponse, ExtensionPayload

import logging
logger = logging.getLogger(__name__)


# API ROUTER & ENDPOINTS
router = APIRouter(
    prefix="/tracker",
    tags=["Application Tracker"]
)

NLP_ENGINE_URL = os.getenv("NLP_ENGINE_URL", "http://localhost:8001/extract")

@router.post("/extract-and-save", response_model=ApplicationResponse)
async def extract_and_save_job(payload: ExtensionPayload, db: Session = Depends(get_db)):
    
    # 1. Ask the NLP microservice to analyze the text
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                NLP_ENGINE_URL,
                json={"raw_text": payload.raw_text},
                timeout=15.0
            )
            response.raise_for_status()
            nlp_data = response.json()
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"NLP Engine is down: {e}")

    extracted_data = {
        "company_name": "",
        "job_title": "",
        "job_location": None,
        "job_url": payload.url,
        "status": "Wishlist", # Strictly adheres to VALID_STATUSES
        "notes": ""
    }

    extra_details = []

    # Map the NLP labels securely
    for entity in nlp_data.get("entities", []):
        label = entity.get("label")
        value = entity.get("value", "").strip()

        if label == "COMPANY" and value:
            extracted_data["company_name"] = value
        elif label == "JOB_TITLE" and value:
            extracted_data["job_title"] = value
        elif label == "LOCATION" and value:
            extracted_data["job_location"] = value
        elif label in ["SALARY", "EXPERIENCE", "EMPLOYMENT_TYPE"] and value:
            extra_details.append(f"{label}: {value}")

    # 3. APPLY FALLBACKS FOR REQUIRED FIELDS
    if not extracted_data["company_name"]:
        extracted_data["company_name"] = "Unknown Company"
    if not extracted_data["job_title"]:
        extracted_data["job_title"] = "Unknown Title"

    if extra_details:
        extracted_data["notes"] = "\n".join(extra_details)
    else:
        extracted_data["notes"] = None

    # 4. VALIDATE & SAVE
    try:
        # Pass the perfectly cleaned dictionary through your Pydantic schema
        valid_app_data = ApplicationCreate(**extracted_data)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=f"Internal Validation Error: {e}")

    # Dump the validated data into the database
    db_app = ApplicationTracker(**valid_app_data.model_dump())
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    
    return db_app

@router.post("/applications", response_model=ApplicationResponse)
async def create_application(app_in: ApplicationCreate, db: Session = Depends(get_db)):
    db_app = ApplicationTracker(**app_in.model_dump())
    try:
        db.add(db_app)
        db.commit()
        db.refresh(db_app)
        return db_app
    except Exception:
        logger.error("Failed to create application", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create application")
    

@router.get("/applications", response_model=list[ApplicationResponse])
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


@router.delete("/applications/{app_id}", response_model = MessageResponse)
async def delete_application(app_id: int, db: Session = Depends(get_db)):
    db_app = db.query(ApplicationTracker).filter(ApplicationTracker.id == app_id).first()
    
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    db.delete(db_app)
    db.commit()
    return {"message": "Application deleted successfully"}