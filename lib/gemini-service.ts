// lib/gemini-service.ts

import { SYSTEM_PROMPT, MODEL_CONFIG, Message } from "./prompts/assistant-config";

export interface GenerateResponseParams {
  messages: Message[];
}

export interface GeminiResponse {
  content: string;
  error?: string;
}

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent";

function buildPrompt(messages: Message[]): string {
  const conversation = messages
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n\n");

  return `${SYSTEM_PROMPT}\n\nConversation:\n${conversation}\n\nAssistant:`;
}

export async function generateResponse({ messages }: GenerateResponseParams): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      content: "",
      error: "API key not configured. Please set GEMINI_API_KEY in your environment.",
    };
  }

  try {
    const prompt = buildPrompt(messages);

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: MODEL_CONFIG.temperature,
          maxOutputTokens: MODEL_CONFIG.maxOutputTokens,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      return {
        content: "",
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      return {
        content: "",
        error: "Invalid response format from API",
      };
    }

    return {
      content: data.candidates[0].content.parts[0].text,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Gemini service error:", errorMessage);
    return {
      content: "",
      error: errorMessage,
    };
  }
}