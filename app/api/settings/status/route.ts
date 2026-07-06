import { NextResponse } from "next/server";
import { DAILY_SPEND_CEILING_USD, getDailySpend, DEMO_USER_ID } from "@/lib/guardrails";

// Reports which providers are configured (booleans only — never the keys).

export async function GET() {
  const spentToday = await getDailySpend(DEMO_USER_ID);
  return NextResponse.json({
    providers: {
      fal: !!process.env.FAL_KEY,
      higgsfield:
        !!process.env.HIGGSFIELD_API_KEY && !!process.env.HIGGSFIELD_API_SECRET,
      openrouter: !!process.env.OPENROUTER_API_KEY,
      supabase:
        !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      upstash:
        !!process.env.UPSTASH_REDIS_REST_URL &&
        !!process.env.UPSTASH_REDIS_REST_TOKEN,
    },
    usage: {
      spentTodayUsd: spentToday,
      dailyCeilingUsd: DAILY_SPEND_CEILING_USD,
    },
  });
}
