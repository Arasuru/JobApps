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
          "paragraphs": ["Opening paragraph...", "Body paragraph...", "Closing paragraph..."],
          "signOff": "Sincerely,"
        }`;

    const SYSTEM_PROMPT = `
        You are an expert executive career coach and resume writer. 
        Create a highly tailored ${isCV ? 'CV' : 'Cover Letter'}. Use the provided profile and job description to refine data from the document that is optimized for ATS and human readers.
        ${isCV ? 'For CVs, focus on clear, concise formatting that highlights relevant experience and skills do not make the CV look like jammed with all the skills, just include the most relevant ones. and relevant Projects' :  
         '- For Cover Letters, craft a compelling narrative that connects the candidate\'s background to the specific requirements of the job. Use persuasive language(but don\'t be obvious) to demonstrate the candidate\'s unique value proposition.'}
        TEMPLATE RULES:
        ${templateInstructions}

        CRITICAL INSTRUCTION: You must respond with ONLY a valid, raw JSON object. 
        Do not include any markdown formatting (like \`\`\`json), no introductory text, and no conversational filler.

        Use EXACTLY this JSON structure:
        ${jsonSchema}
    `;

    const USER_PROMPT = `
      Personal Details (Use these to guide context, do not include them in the JSON body output unless necessary for the letter):
        ${JSON.stringify(personalInfo, null, 2)}

      Master Profile:
        ${profileMarkdown}

      Job Description:
        ${jobDescription}
    `;

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
