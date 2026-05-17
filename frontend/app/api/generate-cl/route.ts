import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profileMarkdown, jobDescription} = body;

    if (!profileMarkdown || !jobDescription) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    //API Endpoint expects Form data
    const formData = new FormData();
    formData.append("cv_markdown", profileMarkdown);
    formData.append("job_description", jobDescription);

    //Choosing endpoint URL based in react tab
    const pythonUrl = process.env.PARSER_URL || "http://127.0.0.1:8000"; // Default to localhost for local development
    const endpoint = "/generate-cover-letter";

    const pythonResponse = await fetch(`${pythonUrl}${endpoint}`, {
      method: "POST",
      body: formData,
    });

    let data = await pythonResponse.json();

    // safeguardHandle the case where cover_letter is a JSON string
    if (data.cover_letter && typeof data.cover_letter === "string") {
       data = JSON.parse(data.cover_letter);
    } else if (data.cover_letter) {
       data = data.cover_letter;
    }

    return NextResponse.json({ documentData: data });
  
  } catch (error: any) {
    console.error("API Route Error:", error.message || error);
    return NextResponse.json({ error: "An error occurred while processing your request." }, { status: 500 });
  }

}
