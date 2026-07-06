import { NextRequest, NextResponse } from "next/server";
import { generateSoulImage, getSoulGeneration } from "@/lib/higgsfield/client";
import {
  assertBatchSize,
  assertDailyCeiling,
  recordSpend,
  GuardrailError,
  DEMO_USER_ID,
} from "@/lib/guardrails";

const SOUL_COST_ESTIMATE_USD = 0.1;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.custom_reference_id || !body.prompt) {
      return NextResponse.json(
        { error: "custom_reference_id and prompt are required" },
        { status: 400 }
      );
    }

    assertBatchSize(body.batch_size);
    await assertDailyCeiling(DEMO_USER_ID);

    const job = await generateSoulImage(body);
    await recordSpend(
      DEMO_USER_ID,
      SOUL_COST_ESTIMATE_USD * Number(body.batch_size ?? 1)
    );

    return NextResponse.json(job);
  } catch (err) {
    if (err instanceof GuardrailError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: 429 }
      );
    }
    const message =
      err instanceof Error ? err.message : "Soul generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing 'id' param" }, { status: 400 });
  }
  try {
    const result = await getSoulGeneration(id);
    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Soul result fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
