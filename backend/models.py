from pydantic import BaseModel

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
