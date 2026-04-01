# parser-service/main.py
import json
from dotenv import load_dotenv
import os
from fastapi import FastAPI, UploadFile, File, Form
import pymupdf4llm # An incredible library for PDF to Markdown
import fitz
import unicodedata
from groq import Groq

load_dotenv()

app = FastAPI()
groq_client = Groq()


@app.post("/convert-to-md")
async def convert_pdf(file: UploadFile = File(...)):
    try:
        
        pdf_bytes = await file.read()
        
        #Convert the raw bytes into a PyMuPDF Document
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        #Convert the structured Document into Markdown
        md_text = pymupdf4llm.to_markdown(doc) 
        md_text = unicodedata.normalize("NFC", md_text) # Normalize Unicode to prevent weird characters
        return {"markdown": md_text}
        
    except Exception as e:
        # This will print the actual error if it fails, instead of dumping the PDF to your terminal!
        print(f"Python Error: {str(e)}")
        return {"error": "Failed to parse PDF"}

@app.post("/extract-profile")
async def extract_profile(cv_markdown: str = Form(...)):
    try:
        prompt = f"""
        You are a highly precise data extraction bot. 
        Parse the user's resume/profile text and extract their personal details.

        CRITICAL INSTRUCTION: You must respond with ONLY a valid, raw JSON object. 
        If a field is missing from the text, leave the value as an empty string "".

        Use EXACTLY this JSON structure:
        {{
          "Firstname": "Extracted Name",
          "Lastname": "Extracted Surname",
          "email": "Extracted Email",
          "phone": "Extracted Phone",
          "location": "City, State or Country",
          "linkedin": "LinkedIn URL or handle",
          "IndustryPortfolio": "Portfolio URL or handle",
          "PhDPortfolio": "Portfolio URL or handle"
        }}

        CV TEXT TO PARSE:
        {cv_markdown}
        """

        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an elite data extraction bot. Output only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            temperature=0.1, # 👈 Low temperature for strict data extraction
        )

        extracted_data = json.loads(chat_completion.choices[0].message.content)
        return extracted_data

    except Exception as e:
        print(f"Python Extraction Error: {str(e)}")
        return {"error": "Failed to extract profile data"}
    


@app.post("/generate-cover-letter")
async def generate_cover_letter(cv_markdown: str = Form(...), job_description: str = Form(...)):
    try:
        prompt = f"""
        Write a persuasive narrative linking the candidate\'s actual background to job needs without being cliché.
        CRITICAL RULE - NO HALLUCINATION: 
              Extract  relevantfacts, skills, and projects STRICTLY from the Master Profile. NEVER invent details or copy experiences from the Job Description. Use the Job Description ONLY as a filter to decide which parts of the Master Profile are relevant.
              Do not include every skill or project or language from the Master Profile - only those that are relevant to the Job Description. If a skill or project is not relevant to the job, omit it entirely.

        Return ONLY a raw, valid JSON object matching the schema below. NO markdown (\`\`\`json) and NO conversational text.
        You MUST return a JSON object with exactly these keys:
        {{
          "recipientName": "Hiring Manager or Name",
          "recipientTitle": "Title or Department",
          "companyName": "Company Name",
          "date": "Today's Date",
          "greeting": "Dear [Name],",
          "paragraphs": ["Opening paragraph...", "Body paragraph 1...", "Body paragraph 2...","Body paragraph 3...", "Closing paragraph..."],
          "signOff": "Sincerely,"
        }}

        CV(Source of Truth - ONLY use facts from here):
        {cv_markdown}

        JD(Filter - Use ONLY to determine relevance):
        {job_description}
        """

        #Use Groq to send the prompt to the LLM and get back a structured JSON response
        chat_completion = groq_client.chat.completions.create(
            messages=[{"role": "system", "content": "You are an elite career coach. Write a professional, highly targeted cover letter based on this Profile and Job Description."},
                      {"role": "user", "content": prompt}],
            model = "llama-3.3-70b-versatile",
            response_format = {"type": "json_object"},
            temperature = 0.5,
        )

        cover_letter = json.loads(chat_completion.choices[0].message.content)
        return cover_letter
    
    except Exception as e:
        print(f"Python Error: {str(e)}")
        return {"error": "Failed to generate cover letter"}


@app.post("/tailor-resume")
async def tailor_resume(cv_markdown: str = Form(...), job_description: str = Form(...)):
    try:
        prompt = f"""
        You are an expert resume writer. Your task is to take the candidate's full CV (Master Profile) and the Job Description, and produce a tailored resume that highlights only the most relevant skills, experiences, and projects for that specific job. 

        CRITICAL RULE - NO HALLUCINATION: 
              Extract  relevantfacts, skills, and projects STRICTLY from the Master Profile. NEVER invent details or copy experiences from the Job Description. Use the Job Description ONLY as a filter to decide which parts of the Master Profile are relevant.
              Do not include every skill or project or language from the Master Profile - only those that are relevant to the job. If a skill or project is not relevant to the job, omit it entirely.
              Be concise. List only profile skills relevant to the job. Include max 3 most relevant projects.
        
        Return ONLY a raw, valid JSON object matching the schema below. NO markdown (\`\`\`json) and NO conversational text.
        You MUST return a JSON object with exactly these keys:
        {{
          "summary": "Professional summary paragraph",
          "researchInterests": ["Interest 1", "Interest 2"],
          "experience": [
            {{ "role": "Job Title", "company": "Company Name", "date": "MM/YYYY - MM/YYYY", "location": "City, Country", "achievements": ["Bullet 1", "Bullet 2"] }}
          ],
          "education": [
            {{ "degree": "Degree Name", "institution": "University Name", "date": "YYYY - YYYY", "location": "City, Country", "Focus": "Relevant Focus Area", "Grade": "Final Grade" }}
          ],
          "skills": [
            {{ "category": "Skill Group", "items": ["Skill1", "Skill2"] }}
          ],
          "publications": [
            {{ "title": "Publication Title", "journal": "Journal Name", "date": "YYYY", "link": "URL" }}
          ],
          "projects": [
            {{ "name": "Project Name", "description": "Brief description of the project, technologies used, and outcomes.", "keywords": ["Keyword1", "Keyword2"] }}
          ],
          "Languages": [
            {{ "language": "Language Name", "proficiency": "Proficiency Level" }}
          ],
          "certifications": [
            {{ "name": "Certification Name", "issuer": "Issuing Organization", "date": "MM/YYYY", "link": "URL" }}
          ],
        }}

        CV(Source of Truth - ONLY use facts from here):
        {cv_markdown}

        JD(Filter - Use ONLY to determine relevance):
        {job_description}
        """

        #Use Groq to send the prompt to the LLM and get back a structured JSON response
        chat_completion = groq_client.chat.completions.create(
            messages=[{"role": "system", "content": "You are an elite resume writer. Write a concise, highly targeted resume in Markdown format based on this Profile and Job Description."},
                      {"role": "user", "content": prompt}],
            model = "llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            temperature = 0.5,
        )

        tailored_resume = json.loads(chat_completion.choices[0].message.content)
        return {"tailored_resume": tailored_resume}
    
    except Exception as e:
        print(f"Python Error: {str(e)}")
        return {"error": "Failed to tailor resume"}