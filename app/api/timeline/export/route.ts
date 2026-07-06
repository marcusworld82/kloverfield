import { NextRequest, NextResponse } from "next/server";

// Timeline export (Section 5.6). The Remotion Player powers the in-app preview;
// final MP4 export runs Remotion's server-side render. On Vercel serverless the
// render must run on Remotion Lambda or a dedicated render worker — this route
// accepts the job and reports status. In mock/dev mode it simulates the queue.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.tracks) {
      return NextResponse.json(
        { error: "tracks payload is required" },
        { status: 400 }
      );
    }

    const hasRenderer =
      !!process.env.REMOTION_LAMBDA_FUNCTION_NAME ||
      !!process.env.REMOTION_RENDER_WORKER_URL;

    if (!hasRenderer) {
      return NextResponse.json({
        jobId: `mock-render-${Date.now()}`,
        status: "queued",
        mock: true,
        note: "Mock render — configure Remotion Lambda (REMOTION_LAMBDA_FUNCTION_NAME) or a render worker (REMOTION_RENDER_WORKER_URL) for real MP4 exports.",
      });
    }

    // Real render dispatch would go here (Remotion Lambda / worker call).
    return NextResponse.json({
      jobId: `render-${Date.now()}`,
      status: "queued",
      mock: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
