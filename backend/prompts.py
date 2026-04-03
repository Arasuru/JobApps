def build_extraction_prompt(cv_markdown: str) -> str:
    return f"""
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

def build_cover_letter_prompt(cv_markdown: str, job_description: str) -> str:
    return f"""
    Write a persuasive narrative linking the candidate's actual background to job needs without being cliché.
    CRITICAL RULE - NO HALLUCINATION:
          Extract relevant facts, skills, and projects STRICTLY from the Master Profile. NEVER invent details or copy experiences from the Job Description. Use the Job Description ONLY as a filter to decide which parts of the Master Profile are relevant.
          Do not include every skill or project or language from the Master Profile - only those that are relevant to the Job Description. If a skill or project is not relevant to the job, omit it entirely.

    Return ONLY a raw, valid JSON object matching the schema below. NO markdown and NO conversational text.
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

def build_tailor_resume_prompt(cv_markdown: str, job_description: str) -> str:
    return f"""
    You are an expert resume writer. Your task is to take the candidate's full CV (Master Profile) and the Job Description, and produce a tailored resume that highlights only the most relevant skills, experiences, and projects for that specific job.

    CRITICAL RULE - NO HALLUCINATION:
          Extract relevant facts, skills, and projects STRICTLY from the Master Profile. NEVER invent details or copy experiences from the Job Description. Use the Job Description ONLY as a filter to decide which parts of the Master Profile are relevant.
          Do not include every skill or project or language from the Master Profile - only those that are relevant to the job. If a skill or project is not relevant to the job, omit it entirely.
          Be concise. List only profile skills relevant to the job. Include max 3 most relevant projects.

    Return ONLY a raw, valid JSON object matching the schema below. NO markdown and NO conversational text.
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
      ]
    }}

    CV(Source of Truth - ONLY use facts from here):
    {cv_markdown}

    JD(Filter - Use ONLY to determine relevance):
    {job_description}
    """
