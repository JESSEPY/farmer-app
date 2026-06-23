// app/api/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import { generateResponse } from "@/lib/ai-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array required" },
        { status: 400 }
      );
    }

    const result = await generateResponse({ messages });

    if (result.error) {
      return NextResponse.json(
        { error: result.error, content: "" },
        { status: 500 }
      );
    }

    return NextResponse.json({ content: result.content });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}