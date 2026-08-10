/**
 * OpenRouter API wrapper - server-side only.
 * Never import this in client components — it uses process.env.OPENROUTER_API_KEY.
 */

export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";
export const DEFAULT_MODEL = "openai/gpt-4.1-mini";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterOptions {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json_object";
}

export interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: { role: "assistant"; content: string };
    finish_reason: string;
  }>;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterError extends Error {
  status: number;
  data?: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "OpenRouterError";
  }
}

/**
 * Call the OpenRouter chat completions endpoint.
 */
export async function callOpenRouter(opts: OpenRouterOptions): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new OpenRouterError(
      "OPENROUTER_API_KEY is not configured on the server.",
      500
    );
  }

  const model = opts.model ?? DEFAULT_MODEL;
  const body: Record<string, unknown> = {
    model,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.4,
    max_tokens: opts.maxTokens ?? 1500,
  };
  if (opts.responseFormat === "json_object") {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(OPENROUTER_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://smartthatu.app",
      "X-Title": "SmartThattu",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new OpenRouterError(
      `OpenRouter request failed with ${res.status}: ${text.slice(0, 500)}`,
      res.status
    );
  }

  const data = (await res.json()) as OpenRouterResponse;
  const content = data.choices?.[0]?.message?.content ?? "";
  return content.trim();
}

/**
 * Call OpenRouter expecting a valid JSON object back.
 */
export async function callOpenRouterJSON<T = unknown>(
  opts: Omit<OpenRouterOptions, "responseFormat">
): Promise<T> {
  const content = await callOpenRouter({ ...opts, responseFormat: "json_object" });
  try {
    return JSON.parse(content) as T;
  } catch {
    // Try to extract JSON from a code fence
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      return JSON.parse(match[1]) as T;
    }
    throw new OpenRouterError(
      `Failed to parse JSON from model response: ${content.slice(0, 300)}`,
      502
    );
  }
}
