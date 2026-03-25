import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // We now expect a documentType ('cv' or 'coverLetter')
    const { profileMarkdown, jobDescription, documentType, templateType, personalInfo } = body;

    if (!profileMarkdown || !jobDescription || !documentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Dynamically adjust the prompt based on what button the user clicked
    const isCV = documentType === 'cv';
    
    let templateInstructions = "";
    if (isCV) {
      if (templateType === 'phd-germany') {
        templateInstructions = "Format as a German Academic CV (Lebenslauf). Must be highly detailed, strictly chronological, prioritizing Education, Research Experience, Publications, Relevant Projects and Academic Conferences.";
      } else if (templateType === 'job-germany') {
        templateInstructions = "Format as a standard German Professional CV (Lebenslauf). Keep it structured, formal, and objective. Include a strict timeline of experience and education, Releavant Projects. No overly aggressive marketing language.";
      } else if (templateType === 'job-india') {
        templateInstructions = "Format as an Indian Professional CV. Highlight technical skills prominently at the top, emphasize project scopes, team sizes, and quantifiable metrics/achievements.";
      }
    } else {
      if (templateType === 'phd') {
        templateInstructions = "Format as an Academic Cover Letter for a PhD position. Focus heavily on research interests, alignment with the lab/professor's work, methodology, and academic potential.";
      } else {
        templateInstructions = "Format as a standard Professional Cover Letter. Focus on how the candidate's skills solve the company's specific needs as outlined in the Job Description.";
      }
    }
    const jsonSchema = isCV 
      ? `{
          "summary": "Professional summary paragraph",
          "experience": [
            { "role": "Job Title", "company": "Company Name", "date": "MM/YYYY - MM/YYYY", "location": "City, Country", "achievements": ["Bullet 1", "Bullet 2"] }
          ],
          "education": [
            { "degree": "Degree Name", "institution": "University Name", "date": "YYYY - YYYY", "location": "City, Country", "Focus": "Relevant Focus Area", "Grade": "Final Grade" }
          ],
          "skills": [
            { "category": "Skill Group", "items": ["Skill1", "Skill2"] }
          ],
          "publications": [
            { "title": "Publication Title", "journal": "Journal Name", "date": "YYYY", "link": "URL" }
          ],
          "projects": [
            { "name": "Project Name", "description": "Brief description of the project, technologies used, and outcomes.", "keywords": ["Keyword1", "Keyword2"] }
          ],
          "Languages": [
            { "language": "Language Name", "proficiency": "Proficiency Level" }
          ]
        }`
      : `{
          "recipientName": "Hiring Manager or Name",
          "recipientTitle": "Title or Department",
          "companyName": "Company Name",
          "date": "Today's Date",
          "greeting": "Dear [Name],",
          "paragraphs": ["Opening paragraph...", "Body paragraph 1...", "Body paragraph 2...","Body paragraph 3...", "Closing paragraph..."],
          "signOff": "Sincerely,"
        }`;

    const SYSTEM_PROMPT = `Act as an expert career coach. Respond in English.
              Generate an ATS-optimized ${isCV ? 'CV' : 'Cover Letter'}. 

              CRITICAL RULE - NO HALLUCINATION: 
              Extract  relevantfacts, skills, and projects STRICTLY from the Master Profile. NEVER invent details or copy experiences from the Job Description. Use the Job Description ONLY as a filter to decide which parts of the Master Profile are relevant.
              Do not include every skill or project or language from the Master Profile - only those that are relevant to the Job Description. If a skill or project is not relevant to the job, omit it entirely.
            ${isCV 
              ? 'CV RULES: Be concise. List only profile skills relevant to the job. Include max 3 most relevant projects.' 
              : 'COVER LETTER RULES: Write a persuasive narrative linking the candidate\'s actual background to job needs without being cliché.'}

            TEMPLATE RULES:
            ${templateInstructions}

            OUTPUT FORMAT: Return ONLY a raw, valid JSON object matching the schema below. NO markdown (\`\`\`json) and NO conversational text.
            ${jsonSchema}`;

      const USER_PROMPT = `Personal Context (Exclude from JSON unless required):
          ${JSON.stringify(personalInfo)}

          MASTER PROFILE (Source of Truth - ONLY use facts from here):
          ${profileMarkdown}

          JOB DESCRIPTION (Filter - Use ONLY to determine relevance):
          ${jobDescription}`;

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: SYSTEM_PROMPT,
      prompt: USER_PROMPT,
    });

    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const documentData = JSON.parse(cleanedText);

    return NextResponse.json({ documentData });

  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate document. Ensure the AI returned valid JSON." }, { status: 500 });
  }
}
