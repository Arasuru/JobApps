# backend/main.py
from dotenv import load_dotenv
import os
import logging
from contextlib import asynccontextmanager # For lifespan context manager

from groq import Groq
from fastapi import FastAPI, Depends

#database dependencies
from database import Base, engine
from models.application_tracker import ApplicationTracker # noqa: F401 - needed for Base to register the model

#Import routers and dependencies
#from dependencies import verify_api_key
from routers.parser import router as parser_router
from routers.generator import router as generator_router
from routers.tracker import router as tracker_router

#Logging Setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__) # Create a logger for this module

#ENV variables
if os.getenv("GROQ_API_KEY") is None:
  load_dotenv()


#Lifespan context manager to initialize Groq client
@asynccontextmanager
async def lifespan(app: FastAPI):
    #DB setup
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully.")

    #groq client setup
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        logger.error("GROQ_API_KEY is not set in environment variables.")
        raise RuntimeError("GROQ_API_KEY is required to run the application.")
    
    app.state.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    logger.info("Groq client initialized successfully.")

    yield

    logger.info("Shutting down application.")

#Main APP
app = FastAPI(
    title="AI-Powered CV Builder API",
    lifespan=lifespan,
)

#connect modular routers
app.include_router(parser_router)
app.include_router(generator_router)
app.include_router(tracker_router)
