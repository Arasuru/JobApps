// app/api/pdf-to-md/route.ts
export async function POST(request: Request) {
  const formData = await request.formData();
  
  const parserUrl = process.env.PARSER_URL || 'http://127.0.0.1:8000';
  // Forward the exact formData to your Python container
  const pythonResponse = await fetch(`${parserUrl}/convert-to-md`, {
    method: 'POST',
    body: formData,
    headers: {
        "X-API-Key": process.env.INTERNAL_API_KEY || ""
    }
  });

  const data = await pythonResponse.json();
  // 💡 TRANSLATION LAYER: 
  // Python sends { markdown: "..." }, but our React UI expects { text: "..." }
  // This maps it perfectly so the frontend doesn't crash!
  return Response.json({ text: data.markdown });
}