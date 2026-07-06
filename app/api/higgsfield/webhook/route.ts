import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

// Higgsfield calls this on Soul job completion (Section 4.2 webhook support).
// Register it via the `webhook: { url, secret }` field on POST /v1/text2image/soul.

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (
    process.env.HIGGSFIELD_WEBHOOK_SECRET &&
    secret !== process.env.HIGGSFIELD_WEBHOOK_SECRET
  ) {
    return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
  }

  try {
    const payload = await req.json();
    const admin = getSupabaseAdmin();
    if (admin && payload?.id) {
      await admin
        .from("generations")
        .update({
          status: payload.status === "completed" ? "complete" : "failed",
          result_url: payload?.results?.[0]?.url ?? null,
        })
        .eq("params->>higgsfield_job_id", String(payload.id));
    }
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
