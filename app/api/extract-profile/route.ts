import { NextResponse } from 'next/server';


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profileMarkdown } = body;

    if (!profileMarkdown) {
      return NextResponse.json({ error: "No profile provided" }, { status: 400 });
    }

    // Packaging it as formData for the endpoint
    const formData = new FormData();
    formData.append("cv_markdown", profileMarkdown);
    const pythonUrl = process.env.PARSER_URL || 'http://127.0.0.1:8000';
    const pythonResponse = await fetch(`${pythonUrl}/extract-profile`, {
      method: 'POST',
      headers: {
        "X-API-Key": process.env.INTERNAL_API_KEY || ""
      },
      body: formData,
    });

    if (!pythonResponse.ok) {
      throw new Error(`Python API responded with status ${pythonResponse.status}`);
    }

    // Return the beautifully structured JSON directly to the frontend
    const extractedData = await pythonResponse.json();
    return NextResponse.json(extractedData);

  } catch (error) {
    console.error("Extraction Proxy Error:", error);
    return NextResponse.json(
      { error: "Failed to extract profile data. Make sure the file contains readable text." }, 
      { status: 500 }
    );
  }
}
    