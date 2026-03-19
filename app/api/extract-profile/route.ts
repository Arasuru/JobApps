import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

const EXTRACTION_PROMPT = `
You are a highly precise data extraction bot. 
Parse the user's resume/profile text and extract their personal details.

CRITICAL INSTRUCTION: You must respond with ONLY a valid, raw JSON object. 
Do not include any markdown formatting (like \`\`\`json), no introductory text, and no conversational filler.
If a field is missing from the text, leave the value as an empty string "".

Use EXACTLY this JSON structure:
{
  "Firstname": "Extracted Name",
  "Lastname": "Extracted Surname",
  "email": "Extracted Email",
  "phone": "Extracted Phone",
  "location": "City, State or Country",
  "linkedin": "LinkedIn URL or handle",
  "Portfolio": "Portfolio URL or handle"
}
`;

export async function POST(req: Request) {
  try {
    const { profileMarkdown } = await req.json();

    if (!profileMarkdown) {
      return NextResponse.json({ error: "No profile provided" }, { status: 400 });
    }

    // Use standard generateText
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: EXTRACTION_PROMPT,
      prompt: profileMarkdown,
    });

    // Clean the output just in case the AI included markdown blocks anyway
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Parse the string back into a standard JavaScript object
    const extractedData = JSON.parse(cleanedText);

    return NextResponse.json(extractedData);

  } catch (error) {
    console.error("Extraction Error:", error);
    return NextResponse.json({ error: "Failed to extract profile data. Make sure the file contains readable text." }, { status: 500 });
  }
}