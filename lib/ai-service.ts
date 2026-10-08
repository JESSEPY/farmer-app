import { SYSTEM_PROMPT, MODEL_CONFIG, type Message } from "./prompts/assistant-config";

interface AiResponse {
  content: string;
  modelUsed?: string;
  error?: string;
}

// Models available on our Groq account. Set GROQ_MODEL to override the first choice.
const GROQ_MODELS = [
  process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
].filter((model, index, arr) => arr.indexOf(model) === index);

let groqClient: import("groq-sdk").Groq | null = null;

async function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  if (!groqClient) {
    const Groq = (await import("groq-sdk")).default;
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

function buildGroqMessages(messages: Message[]) {
  return [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.map((msg) => ({
      role: msg.role === "model" ? "assistant" : "user",
      content: msg.content,
    })),
  ];
}

export async function generateResponse({ messages }: { messages: Message[] }): Promise<AiResponse> {
  const client = await getGroqClient();
  if (!client) {
    return { content: "", error: "GROQ_API_KEY is not defined" };
  }

  const groqMessages = buildGroqMessages(messages);
  let lastError: unknown = null;

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

      const text = (completion.choices?.[0]?.message?.content || "").trim();
      return { content: text, modelUsed: `groq/${model}` };
    } catch (err) {
      console.warn(`Groq model ${model} failed:`, err);
      lastError = err;
    }
  }

  const message = lastError instanceof Error ? lastError.message : "Unknown error";
  console.error("Groq service error:", message);
  return { content: "", error: `AI assistant is unavailable right now. ${message}` };
}
