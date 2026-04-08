# backend/dependencies.py
from fastapi import Depends, HTTPException, Request
from groq import Groq


#Configurations
GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_EXTRACTION_TEMPERATURE = 0.1 
GROQ_GENERATION_TEMPERATURE = 0.5 
MAX_FILE_SIZE_MB = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024


#App State Injection
# We use Request to safely access app.state from external router files
def get_groq_client(request: Request) -> Groq:
    return request.app.state.groq_client