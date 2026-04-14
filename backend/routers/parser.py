# backend/parser.py
import json
import logging
import fitz
import pymupdf4llm
import unicodedata

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from groq import Groq

from schemas.schemas import MarkdownResponse, ProfileResponse
from dependencies import get_groq_client, GROQ_MODEL, GROQ_EXTRACTION_TEMPERATURE, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB
from prompts import build_extraction_prompt

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Parser"])

@router.post("/convert-to-md", response_model=MarkdownResponse)
async def convert_pdf(file: UploadFile = File(...)):
    pdf_bytes = await file.read()
    if len(pdf_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail=f"File size exceeds {MAX_FILE_SIZE_MB} MB.")
    
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF files are accepted.")
    
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        md_text = pymupdf4llm.to_markdown(doc) 
        md_text = unicodedata.normalize("NFC", md_text)
        return {"markdown": md_text}
        
    except Exception as e:
        logger.error("Failed to parse PDF", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to parse PDF")

@router.post("/extract-profile", response_model=ProfileResponse)
async def extract_profile(cv_markdown: str = Form(...), groq_client: Groq = Depends(get_groq_client)):
    try:
        prompt = build_extraction_prompt(cv_markdown)
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an elite data extraction bot. Output only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            model=GROQ_MODEL,
            response_format={"type": "json_object"},
            temperature=GROQ_EXTRACTION_TEMPERATURE, 
            timeout=30, 
        )

        extracted_data = json.loads(chat_completion.choices[0].message.content)
        return extracted_data

    except json.JSONDecodeError:
        logger.error("Failed to parse Groq response as JSON", exc_info=True)
        raise HTTPException(status_code=502, detail="AI service returned invalid response")

    except Exception as e:
        logger.error("Unexpected error in extract_profile", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to extract profile data")