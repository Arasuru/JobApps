# parser-service/main.py
from fastapi import FastAPI, UploadFile, File
import pymupdf4llm # An incredible library for PDF to Markdown
import fitz
import unicodedata

app = FastAPI()

@app.post("/convert-to-md")
async def convert_pdf(file: UploadFile = File(...)):
    try:
        # 1. Read the file into memory
        pdf_bytes = await file.read()
        
        # 2. Convert the raw bytes into a PyMuPDF Document
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        # 3. Convert the structured Document into Markdown
        md_text = pymupdf4llm.to_markdown(doc) 
        md_text = unicodedata.normalize("NFC", md_text) # Normalize Unicode to prevent weird characters
        return {"markdown": md_text}
        
    except Exception as e:
        # This will print the actual error if it fails, instead of dumping the PDF to your terminal!
        print(f"Python Error: {str(e)}")
        return {"error": "Failed to parse PDF"}