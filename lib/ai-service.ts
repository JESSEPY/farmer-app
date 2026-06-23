import { SYSTEM_PROMPT, MODEL_CONFIG, type Message } from "./prompts/assistant-config";
import { cleanResponse } from "./gemini-service";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

interface AiResponse {
  content: string;
  modelUsed?: string;
  error?: string;
}

let groqClient: import("groq-sdk").Groq | null = null;

async function getGroqClient() {
  if (!GROQ_API_KEY) return null;
  if (!groqClient) {
    const Groq = (await import("groq-sdk")).default;
    groqClient = new Groq({ apiKey: GROQ_API_KEY });
  }
  return groqClient;
}

function buildGroqMessages(messages: Message[]) {
  const formatted: { role: string; content: string }[] = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  for (const msg of messages) {
    const role = msg.role === "model" ? "assistant" : "user";
    formatted.push({ role, content: msg.content });
  }

  return formatted;
}

const GROQ_MODELS = [
  "llama-3.3-70b-specdec",
  "llama-3.1-8b-instant",
];

async function generateWithGroq(messages: Message[]): Promise<AiResponse | null> {
  const client = await getGroqClient();
  if (!client) return null;

  const groqMessages = buildGroqMessages(messages);

  for (const model of GROQ_MODELS) {
    try {
      const completion = await client.chat.completions.create({
        model,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messages: groqMessages as any,
        temperature: MODEL_CONFIG.temperature,
        max_tokens: MODEL_CONFIG.maxOutputTokens,
        top_p: MODEL_CONFIG.topP,
      });

      const text = completion.choices?.[0]?.message?.content || "";
      const cleaned = cleanResponse(text);
      return { content: cleaned, modelUsed: `groq/${model}` };
    } catch (err) {
      console.warn(`Groq model ${model} failed:`, err);
      continue;
    }
  }

  return null;
}

export async function generateResponse({ messages }: { messages: Message[] }): Promise<AiResponse> {
  const groqResult = await generateWithGroq(messages);
  if (groqResult) return groqResult;

  const { generateResponse: geminiFallback } = await import("./gemini-service");
  return geminiFallback({ messages });
}
