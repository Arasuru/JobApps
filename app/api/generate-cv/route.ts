import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // We now expect a documentType ('cv' or 'coverLetter')
    const { profileMarkdown, jobDescription, documentType } = body;

    if (!profileMarkdown || !jobDescription || !documentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Dynamically adjust the prompt based on what button the user clicked
    const isCV = documentType === 'cv';
    const docName = isCV ? 'professional CV' : 'compelling, confident Cover Letter';

    const SYSTEM_PROMPT = `
You are an expert executive career coach. 
Take the user's master Markdown profile and the Job Description, and create a highly tailored ${docName}.

CRITICAL INSTRUCTION: Output ONLY valid HTML. Do not include markdown code blocks (\`\`\`html). 
Wrap the content in semantic tags (<h1>, <h2>, <ul>, <p>, etc.). Do not include any conversational filler.
    `;

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: SYSTEM_PROMPT,
      prompt: `Profile:\n${profileMarkdown}\n\nJob Description:\n${jobDescription}`,
    });

    return NextResponse.json({ generatedHtml: text });

  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate document" }, { status: 500 });
  }
}