import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Call the backend API
    const response = await fetch(`${BACKEND_URL}/generate-skill-tree`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating skill tree:", error);
    return NextResponse.json(
      { error: "Failed to generate skill tree" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Skill Tree API" });
}

