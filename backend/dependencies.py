# backend/dependencies.py
import os
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, Request
from fastapi.security import APIKeyHeader
from groq import Groq

if os.getenv("INTERNAL_API_KEY") is None:
    load_dotenv()

#Configurations
GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_EXTRACTION_TEMPERATURE = 0.1 
GROQ_GENERATION_TEMPERATURE = 0.5 
MAX_FILE_SIZE_MB = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

#Security
API_KEY = os.getenv("INTERNAL_API_KEY")
api_key_header = APIKeyHeader(name="X-API-Key")

def verify_api_key(key: str = Depends(api_key_header)):
    if key != API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized"
        )

#App State Injection
# We use Request to safely access app.state from external router files
def get_groq_client(request: Request) -> Groq:
    return request.app.state.groq_client