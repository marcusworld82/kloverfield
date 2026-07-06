import { NextRequest, NextResponse } from "next/server";
import { pollJob, getResult } from "@/lib/fal/client";

export async function GET(req: NextRequest) {
  const model = req.nextUrl.searchParams.get("model");
  const requestId = req.nextUrl.searchParams.get("requestId");

  if (!model || !requestId) {
    return NextResponse.json(
      { error: "Missing 'model' or 'requestId' query param" },
      { status: 400 }
    );
  }

  try {
    const status = await pollJob(model, requestId);
    if (status.status === "COMPLETED") {
      const result = await getResult(model, requestId);
      return NextResponse.json({
        status: "COMPLETED",
        data: result.data,
        mock: result.mock,
      });
    }
    return NextResponse.json({ status: status.status, mock: status.mock });
  } catch (err) {
    const message = err instanceof Error ? err.message : "FAL poll failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
