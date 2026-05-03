// lib/gemini-service.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT, MODEL_CONFIG, Message } from "./prompts/assistant-config";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const genAI = new GoogleGenerativeAI(apiKey);

const PRIMARY_MODEL = "gemma-4-26b-a4b-it";
const FALLBACK_MODELS = ["gemini-2.0-flash-lite"];

const GEMINI_MODEL_CHAIN = [PRIMARY_MODEL, ...FALLBACK_MODELS].filter(
  (model, index, arr) => arr.indexOf(model) === index
);

export interface GenerateResponseParams {
  messages: Message[];
}

export interface GeminiResponse {
  content: string;
  modelUsed?: string;
  error?: string;
}

function isGeminiTransientError(error: unknown): boolean {
  const message = (error instanceof Error ? error.message : String(error)).toLowerCase();
  return [
    "503",
    "service unavailable",
    "high demand",
    "unavailable",
    "429",
    "resource_exhausted",
    "rate limit",
    "overloaded",
  ].some((token) => message.includes(token));
}

function cleanResponse(text: string): string {
  const lines = text.split("\n");
  const cleanedLines: string[] = [];
  let captureMode = false;
  let foundQuickAnswer = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const firstChar = trimmed.charAt(0);
    const firstWord = trimmed.split(" ")[0].toLowerCase();

    if (
      trimmed.startsWith("*") ||
      trimmed.startsWith("(") ||
      firstWord === "user" ||
      firstWord === "role:" ||
      firstWord === "goal:" ||
      firstWord === "constraints:" ||
      firstWord === "check:" ||
      firstWord === "drafting" ||
      firstWord === "refining" ||
      firstWord === "final" ||
      firstWord === "wait," ||
      trimmed.toLowerCase().includes("self-correction") ||
      trimmed.toLowerCase().includes("internal") ||
      (trimmed.includes(":") && firstWord !== "🌾" && firstWord !== "📋" && firstWord !== "💡" && firstWord !== "⚠️" && firstWord !== "📅" && !trimmed.startsWith("N:") && !trimmed.startsWith("P:") && !trimmed.startsWith("K:"))
    ) {
      if (trimmed.startsWith("🌾 QUICK ANSWER:") || trimmed.startsWith("📋 DETAILS:") || trimmed.startsWith("💡 TIPS:") || trimmed.startsWith("⚠️ IMPORTANT:") || trimmed.startsWith("📅 NEXT STEPS:")) {
        captureMode = true;
        foundQuickAnswer = true;
        cleanedLines.push(trimmed);
      }
      continue;
    }

    if (foundQuickAnswer) {
      if (trimmed === "") {
        continue;
      }
      cleanedLines.push(trimmed);
    } else if (trimmed.startsWith("🌾") || trimmed.startsWith("📋") || trimmed.startsWith("💡") || trimmed.startsWith("⚠️") || trimmed.startsWith("📅")) {
      foundQuickAnswer = true;
      cleanedLines.push(trimmed);
    }
  }

  return cleanedLines.join("\n").trim();
}

function buildPrompt(messages: Message[]): string {
  const conversation = messages
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n\n");

  return `${SYSTEM_PROMPT}\n\nConversation:\n${conversation}\n\nAssistant:`;
}

async function generateWithFallback(prompt: string): Promise<{ text: string; modelName: string }> {
  let lastError: unknown = null;

  for (const modelName of GEMINI_MODEL_CHAIN) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: MODEL_CONFIG.temperature,
          maxOutputTokens: MODEL_CONFIG.maxOutputTokens,
          topP: MODEL_CONFIG.topP,
          topK: MODEL_CONFIG.topK,
        },
      });

      const result = await model.generateContent(prompt);
      return { text: result.response.text().trim(), modelName };
    } catch (error) {
      lastError = error;
      if (isGeminiTransientError(error)) {
        console.warn(`Model ${modelName} unavailable, trying fallback.`, error);
        continue;
      }
      throw error;
    }
  }

  throw new Error(
    `All configured models are temporarily unavailable. Last error: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`
  );
}

export async function generateResponse({ messages }: GenerateResponseParams): Promise<GeminiResponse> {
  try {
    const prompt = buildPrompt(messages);
    const { text, modelName } = await generateWithFallback(prompt);
    const cleanedText = cleanResponse(text);

    return { content: cleanedText, modelUsed: modelName };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Gemini service error:", errorMessage);
    return { content: "", error: errorMessage };
  }
}