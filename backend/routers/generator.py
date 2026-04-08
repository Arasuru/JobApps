# backend/document.py
import json
import logging

from fastapi import APIRouter, Form, HTTPException, Depends
from groq import Groq

from schemas.schemas import CoverLetter, TailoredResumeResponse
from dependencies import get_groq_client, GROQ_MODEL, GROQ_GENERATION_TEMPERATURE
from prompts import build_cover_letter_prompt, build_tailor_resume_prompt

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/generate-cover-letter", response_model=CoverLetter)
async def generate_cover_letter(cv_markdown: str = Form(...), job_description: str = Form(...), groq_client: Groq = Depends(get_groq_client)):
    try:
        prompt = build_cover_letter_prompt(cv_markdown, job_description)
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an elite career coach. Write a professional, highly targeted cover letter based on this Profile and Job Description."},
                {"role": "user", "content": prompt}
            ],
            model=GROQ_MODEL,
            response_format={"type": "json_object"},
            temperature=GROQ_GENERATION_TEMPERATURE,
            timeout=30,
        )

        cover_letter = json.loads(chat_completion.choices[0].message.content)
        return cover_letter
    
    except json.JSONDecodeError:
        logger.error("Failed to parse Groq response as JSON", exc_info=True)
        raise HTTPException(status_code=502, detail="AI service returned invalid response")

    except Exception as e:
        logger.error("Unexpected error in generate_cover_letter", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate cover letter")

@router.post("/tailor-resume", response_model=TailoredResumeResponse)
async def tailor_resume(cv_markdown: str = Form(...), job_description: str = Form(...), groq_client: Groq = Depends(get_groq_client)):
    try:
        prompt = build_tailor_resume_prompt(cv_markdown, job_description)
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an elite resume writer. Write a concise, highly targeted resume in Markdown format based on this Profile and Job Description."},
                {"role": "user", "content": prompt}
            ],
            model=GROQ_MODEL,
            response_format={"type": "json_object"},
            temperature=GROQ_GENERATION_TEMPERATURE,
            timeout=30,
        )

        tailored_resume = json.loads(chat_completion.choices[0].message.content)
        return {"tailored_resume": tailored_resume}
    
    except json.JSONDecodeError:
        logger.error("Failed to parse Groq response as JSON", exc_info=True)
        raise HTTPException(status_code=502, detail="AI service returned invalid response")

    except Exception as e:
        logger.error("Unexpected error in tailor_resume", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to tailor resume")