import { NextRequest, NextResponse } from "next/server";
import { submitJob, isFalMockMode } from "@/lib/fal/client";
import { getModelConfig } from "@/lib/fal/models.config";
import {
  assertBatchSize,
  assertDailyCeiling,
  recordSpend,
  GuardrailError,
  DEMO_USER_ID,
} from "@/lib/guardrails";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { model, input } = body as {
      model: string;
      input: Record<string, unknown>;
    };

    if (!model || !input) {
      return NextResponse.json(
        { error: "Missing 'model' or 'input' in request body" },
        { status: 400 }
      );
    }

    assertBatchSize(input.batch_size as number | undefined);
    await assertDailyCeiling(DEMO_USER_ID);

    const submission = await submitJob(model, input);

    const cost = getModelConfig(model)?.estimatedCostUsd ?? 0.05;
    await recordSpend(
      DEMO_USER_ID,
      cost * Number(input.batch_size ?? 1)
    );

    return NextResponse.json({
      requestId: submission.requestId,
      mock: submission.mock || isFalMockMode(),
    });
  } catch (err) {
    if (err instanceof GuardrailError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: 429 }
      );
    }
    const message = err instanceof Error ? err.message : "FAL request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
