from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import spacy

app = FastAPI(
    title="NLP Engine API",
    description="Microservice for extracting job data using Spacy",
    version="1.0.0",
)


try: 
    print("Loading Spacy model...")
    nlp = spacy.load("en_core_web_sm")
    print("Spacy model loaded successfully.")
except OSError as e:
    raise RuntimeError("Model not found. Run: python -m spacy download en_core_web_sm")

class ExtractionRequest(BaseModel):
    raw_text: str

class ExtractedEntity(BaseModel):
    value: str
    label: str

class ExtractionResponse(BaseModel):
    entities: list[ExtractedEntity]

@app.post("/extract", response_model=ExtractionResponse)
async def extract_data(request: ExtractionRequest):
    if not request.raw_text.strip():
         raise HTTPException(status_code=400, detail="Provided text is empty.")
    
    doc = nlp(request.raw_text)

    # Grab the labeled entities
    found_entities = []
    for ent in doc.ents:
        found_entities.append(ExtractedEntity(
            label=ent.label_,
            value=ent.text
        ))

    return ExtractionResponse(entities=found_entities)

@app.get("/health")
async def health_check():
    return {"status": "ok"}
