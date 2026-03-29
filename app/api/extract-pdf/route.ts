import { NextResponse } from 'next/server';

export async function POST() {
  // Returns a polite 200 OK response so the frontend doesn't crash if accidentally triggered
  return NextResponse.json(
    { message: "This feature is currently disabled." }, 
    { status: 200 }
  );
}