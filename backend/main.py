# backend/main.py
import json
from dotenv import load_dotenv
import os

import pymupdf4llm 
import fitz
import unicodedata

from groq import Groq
from prompts import build_extraction_prompt, build_cover_letter_prompt, build_tailor_resume_prompt

import logging

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Request
from pydantic import BaseModel
from contextlib import asynccontextmanager # For lifespan context manager
from fastapi.security import APIKeyHeader
    
#Logging Setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__) # Create a logger for this module

#ENV variables
if os.getenv("GROQ_API_KEY") is None:
  load_dotenv()

# Groq Config
GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_EXTRACTION_TEMPERATURE = 0.1 # 👈 Low temperature for strict data extraction
GROQ_GENERATION_TEMPERATURE = 0.5 # 👈 Moderate temperature for creative generation (cover letters, tailoring)

#File Upload Limits
MAX_FILE_SIZE_MB = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

#pydantic models for validation
#Response Models
class ProfileResponse(BaseModel):
    Firstname: str = ""
    Lastname: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    IndustryPortfolio: str = ""
    PhDPortfolio: str = ""

class ExperienceItem(BaseModel):
    role: str = ""
    company: str = ""
    date: str = ""
    location: str = ""
    achievements: list[str] = []

class EducationItem(BaseModel):
    degree: str = ""
    institution: str = ""
    date: str = ""
    location: str = ""
    Focus: str = ""
    Grade: str = ""

class SkillGroup(BaseModel):
    category: str = ""
    items: list[str] = []

class Publication(BaseModel):
    title: str = ""
    journal: str = ""
    date: str = ""
    link: str = ""

class Project(BaseModel):
    name: str = ""
    description: str = ""
    keywords: list[str] = []

class Language(BaseModel):
    language: str = ""
    proficiency: str = ""

class Certification(BaseModel):
    name: str = ""
    issuer: str = ""
    date: str = ""
    link: str = ""

class TailoredResume(BaseModel):
    summary: str = ""
    researchInterests: list[str] = []
    experience: list[ExperienceItem] = []
    education: list[EducationItem] = []
    skills: list[SkillGroup] = []
    publications: list[Publication] = []
    projects: list[Project] = []
    Languages: list[Language] = []
    certifications: list[Certification] = []

class TailoredResumeResponse(BaseModel):
    tailored_resume: TailoredResume

class CoverLetter(BaseModel):
    recipientName: str = ""
    recipientTitle: str = ""
    companyName: str = ""
    date: str = ""
    greeting: str = ""
    paragraphs: list[str] = []
    signOff: str = ""

class MarkdownResponse(BaseModel):
    markdown: str

class ErrorResponse(BaseModel):
    error: str

API_KEY = os.getenv("INTERNAL_API_KEY")
api_key_header = APIKeyHeader(name="X-API-Key")

def verify_api_key(key: str = Depends(api_key_header)):
    if key != API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized"
        )

#Lifespan context manager to initialize Groq client
@asynccontextmanager
async def lifespan(app: FastAPI):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        logger.error("GROQ_API_KEY is not set in environment variables.")
        raise RuntimeError("GROQ_API_KEY is required to run the application.")
    
    app.state.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    logger.info("Groq client initialized successfully.")

    yield

    logger.info("Shutting down application.")

#Main APP
app = FastAPI(lifespan=lifespan,
              dependencies=[Depends(verify_api_key)], # Apply API key verification to all endpoints
)

#dependency to get Groq client from app state
def get_groq_client() -> Groq:
    return app.state.groq_client

#Endpoints
@app.post("/convert-to-md", response_model=MarkdownResponse)
async def convert_pdf(file: UploadFile = File(...)):
    pdf_bytes = await file.read()
    if len(pdf_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail=f"File size exceeds the maximum limit of {MAX_FILE_SIZE_MB} MB.")
    
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF files are accepted.")
    
    try:
        #Convert the raw bytes into a PyMuPDF Document
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        #Convert the structured Document into Markdown
        md_text = pymupdf4llm.to_markdown(doc) 
        md_text = unicodedata.normalize("NFC", md_text) # Normalize Unicode to prevent weird characters
        return {"markdown": md_text}
        
    except Exception as e:
        # This will print the actual error if it fails, instead of dumping the PDF to your terminal!
        logger.error("Failed to parse PDF", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to parse PDF")


@app.post("/extract-profile", response_model=ProfileResponse)
async def extract_profile(cv_markdown: str = Form(...), groq_client: Groq = Depends(get_groq_client)):
    try:
        prompt = build_extraction_prompt(cv_markdown)

        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an elite data extraction bot. Output only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            model= GROQ_MODEL,
            response_format={"type": "json_object"},
            temperature=GROQ_EXTRACTION_TEMPERATURE, 
            timeout= 30, # Set a timeout for the request to prevent hanging
        )

        extracted_data = json.loads(chat_completion.choices[0].message.content)
        return extracted_data

    except json.JSONDecodeError:
        logger.error("Failed to parse Groq response as JSON", exc_info=True)
        raise HTTPException(status_code=502, detail="AI service returned invalid response")

    except Exception as e:
        logger.error("Unexpected error in extract_profile", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to extract profile data")


@app.post("/generate-cover-letter", response_model=CoverLetter)
async def generate_cover_letter(cv_markdown: str = Form(...), job_description: str = Form(...), groq_client: Groq = Depends(get_groq_client)):
    try:
        prompt = build_cover_letter_prompt(cv_markdown, job_description)
        #Use Groq to send the prompt to the LLM and get back a structured JSON response
        chat_completion = groq_client.chat.completions.create(
            messages=[{"role": "system", "content": "You are an elite career coach. Write a professional, highly targeted cover letter based on this Profile and Job Description."},
                      {"role": "user", "content": prompt}],
            model = GROQ_MODEL,
            response_format = {"type": "json_object"},
            temperature = GROQ_GENERATION_TEMPERATURE,
            timeout= 30, # Set a timeout for the request to prevent hanging
        )

        cover_letter = json.loads(chat_completion.choices[0].message.content)
        return cover_letter
    
    except json.JSONDecodeError:
        logger.error("Failed to parse Groq response as JSON", exc_info=True)
        raise HTTPException(status_code=502, detail="AI service returned invalid response")

    except Exception as e:
        logger.error("Unexpected error in generate_cover_letter", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate cover letter")


@app.post("/tailor-resume", response_model=TailoredResumeResponse)
async def tailor_resume(cv_markdown: str = Form(...), job_description: str = Form(...), groq_client: Groq = Depends(get_groq_client)):
    try:
        prompt = build_tailor_resume_prompt(cv_markdown, job_description)

        #Use Groq to send the prompt to the LLM and get back a structured JSON response
        chat_completion = groq_client.chat.completions.create(
            messages=[{"role": "system", "content": "You are an elite resume writer. Write a concise, highly targeted resume in Markdown format based on this Profile and Job Description."},
                      {"role": "user", "content": prompt}],
            model = GROQ_MODEL,
            response_format={"type": "json_object"},
            temperature = GROQ_GENERATION_TEMPERATURE,
            timeout= 30, # Set a timeout for the request to prevent hanging
        )

        tailored_resume = json.loads(chat_completion.choices[0].message.content)
        return {"tailored_resume": tailored_resume}
    
    except json.JSONDecodeError:
        logger.error("Failed to parse Groq response as JSON", exc_info=True)
        raise HTTPException(status_code=502, detail="AI service returned invalid response")

    except Exception as e:
        logger.error("Unexpected error in tailor_resume", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to tailor resume")