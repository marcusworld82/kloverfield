// OpenRouter client wrapper (Section 4.3) — OpenAI-compatible schema via
// plain fetch (no SDK dependency needed for chat completions).
// Server-side only. Falls back to mock mode when OPENROUTER_API_KEY is missing.

import { routeModel, type TaskType } from "./router";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export const isOpenRouterMockMode = () => !process.env.OPENROUTER_API_KEY;

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionResult {
  content: string;
  model: string;
  mock: boolean;
}

export async function chatCompletion(options: {
  messages: ChatMessage[];
  taskType?: TaskType;
  model?: string; // explicit model overrides task routing
  temperature?: number;
  maxTokens?: number;
}): Promise<ChatCompletionResult> {
  const model = options.model ?? routeModel(options.taskType);

  if (isOpenRouterMockMode()) {
    return {
      content:
        "Mock LLM response — set OPENROUTER_API_KEY in .env.local to get real completions. " +
        `(Would have used model: ${model})`,
      model,
      mock: true,
    };
  }

  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter request failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  return {
    content: json.choices?.[0]?.message?.content ?? "",
    model: json.model ?? model,
    mock: false,
  };
}
