import { groq } from '@ai-sdk/groq'; // 1. Swapped the import
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

// MODULAR PROMPT: We can easily move this to a separate /lib/prompts.ts file later
const SYSTEM_PROMPT = `
You are an expert executive CV writer. Your goal is to take a user's master Markdown profile and a Job Description, and output a highly tailored, professional CV.
CRITICAL INSTRUCTION: You must output ONLY valid HTML. Do not include markdown code blocks (\`\`\`html). 
Wrap the CV in semantic tags (<h1>, <h2>, <ul>, <p>, etc.).
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profileMarkdown, jobDescription } = body;

    if (!profileMarkdown || !jobDescription) {
      return NextResponse.json({ error: "Missing profile or JD" }, { status: 400 });
    }

    // 2. Swapped the model provider to Groq and selected Llama 3
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'), 
      system: SYSTEM_PROMPT,
      prompt: `Here is the user's master profile:\n${profileMarkdown}\n\nHere is the Job Description:\n${jobDescription}\n\nPlease generate the HTML CV.`,
    });

    return NextResponse.json({ generatedHtml: text });

  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate CV" }, { status: 500 });
  }
}