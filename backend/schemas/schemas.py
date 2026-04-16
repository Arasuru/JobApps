from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime

#Models for database connection
VALID_STATUSES = ["Wishlist", "Applied", "Interview", "Offer", "Rejected"]

class ApplicationCreate(BaseModel):
    company_name: str
    job_title: str
    status: str = Field(default="Wishlist")
    job_url: Optional[str] = None
    job_location: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in VALID_STATUSES:
            raise ValueError(f"status must be one of {VALID_STATUSES}")
        return v

class ExtensionPayload(BaseModel):
    url: str
    raw_text: str
    
class ApplicationUpdate(BaseModel):
    new_status: str

    @field_validator("new_status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in VALID_STATUSES:
            raise ValueError(f"status must be one of {VALID_STATUSES}")
        return v

class ApplicationResponse(BaseModel):
    id: int
    company_name: str
    job_title: str
    status: str
    job_url: Optional[str] = None
    job_location: Optional[str] = None
    notes: Optional[str] = None
    date_added: datetime

    model_config = {"from_attributes": True}

class MessageResponse(BaseModel):
    message: str
    
#pydantic models for validation
#Response Models for API Endpoints
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
