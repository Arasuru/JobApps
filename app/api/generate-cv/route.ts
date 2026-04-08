import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // We now expect a documentType ('cv' or 'coverLetter')
    const { profileMarkdown, jobDescription, documentType, templateType, personalInfo } = body;

    if (!profileMarkdown || !jobDescription || !documentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    //API Endpoint expects Form data
    const formData = new FormData();
    formData.append("cv_markdown", profileMarkdown);
    formData.append("job_description", jobDescription);

    //Choosing endpoint URL based in react tab
    const pythonUrl = process.env.PARSER_URL || "http://127.0.0.1:8000"; // Default to localhost for local development
    // Dynamically adjust the prompt based on what button the user clicked
    const endpoint = documentType === 'cv' ? "/tailor-resume" : "/generate-cover-letter";

    const pythonResponse = await fetch(`${pythonUrl}${endpoint}`, {
      method: "POST",
      body: formData,
    });

    let data = await pythonResponse.json();

    // safeguardHandle the case where tailored_resume is a JSON string
    if (data.tailored_resume && typeof data.tailored_resume === "string") {
       data = JSON.parse(data.tailored_resume);
    } else if (data.tailored_resume) {
       data = data.tailored_resume;
    }

    return NextResponse.json({ documentData: data });
  
  } catch (error: any) {
    console.error("API Route Error:", error.message || error);
    return NextResponse.json({ error: "An error occurred while processing your request." }, { status: 500 });
  }

}
