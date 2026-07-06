import { NextRequest, NextResponse } from "next/server";
import { chatCompletion, type ChatMessage } from "@/lib/openrouter/client";
import type { TaskType } from "@/lib/openrouter/router";
import { withLlmSlot, GuardrailError } from "@/lib/guardrails";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, taskType, model } = body as {
      messages: ChatMessage[];
      taskType?: TaskType;
      model?: string;
    };

    if (!messages?.length) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    const result = await withLlmSlot(() =>
      chatCompletion({ messages, taskType, model })
    );

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof GuardrailError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: 429 }
      );
    }
    const message = err instanceof Error ? err.message : "LLM request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
