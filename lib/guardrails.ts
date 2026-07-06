// Cost circuit breakers & rate limiting (Section 6.2).
// Server-side only. Uses Supabase usage_daily when configured, otherwise an
// in-memory fallback so guardrails still apply in mock/dev mode.

import { getSupabaseAdmin } from "@/lib/supabase/server";

export const MAX_BATCH_SIZE = 10;
export const DAILY_SPEND_CEILING_USD = Number(
  process.env.DAILY_SPEND_CEILING_USD ?? 20
);
export const MAX_CONCURRENT_LLM_REQUESTS = 3;

export class GuardrailError extends Error {
  constructor(
    message: string,
    public readonly code: "BATCH_CAP" | "DAILY_CEILING" | "CONCURRENCY"
  ) {
    super(message);
    this.name = "GuardrailError";
  }
}

/** Reject any batch_size above the hard cap, regardless of what the UI sends. */
export function assertBatchSize(batchSize: number | undefined) {
  if ((batchSize ?? 1) > MAX_BATCH_SIZE) {
    throw new GuardrailError(
      `batch_size ${batchSize} exceeds the hard cap of ${MAX_BATCH_SIZE}`,
      "BATCH_CAP"
    );
  }
}

// ---- Daily spend ceiling ----------------------------------------------------

const memoryDailySpend = new Map<string, number>(); // key: `${userId}:${day}`

function todayKey(userId: string) {
  return `${userId}:${new Date().toISOString().slice(0, 10)}`;
}

export async function getDailySpend(userId: string): Promise<number> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data } = await admin
      .from("usage_daily")
      .select("total_cost_usd")
      .eq("user_id", userId)
      .eq("day", new Date().toISOString().slice(0, 10))
      .maybeSingle();
    return Number(data?.total_cost_usd ?? 0);
  }
  return memoryDailySpend.get(todayKey(userId)) ?? 0;
}

export async function assertDailyCeiling(userId: string) {
  const spent = await getDailySpend(userId);
  if (spent >= DAILY_SPEND_CEILING_USD) {
    throw new GuardrailError(
      `Daily spend ceiling of $${DAILY_SPEND_CEILING_USD} reached ($${spent.toFixed(2)} spent today). Generation blocked until tomorrow — raise DAILY_SPEND_CEILING_USD to override.`,
      "DAILY_CEILING"
    );
  }
}

export async function recordSpend(userId: string, costUsd: number) {
  const admin = getSupabaseAdmin();
  const day = new Date().toISOString().slice(0, 10);
  if (admin) {
    const current = await getDailySpend(userId);
    await admin
      .from("usage_daily")
      .upsert(
        {
          user_id: userId,
          day,
          total_cost_usd: current + costUsd,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,day" }
      );
    return;
  }
  const key = todayKey(userId);
  memoryDailySpend.set(key, (memoryDailySpend.get(key) ?? 0) + costUsd);
}

// ---- LLM concurrency cap ----------------------------------------------------

let activeLlmRequests = 0;

export async function withLlmSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (activeLlmRequests >= MAX_CONCURRENT_LLM_REQUESTS) {
    throw new GuardrailError(
      `Too many concurrent LLM requests (max ${MAX_CONCURRENT_LLM_REQUESTS}). Try again in a moment.`,
      "CONCURRENCY"
    );
  }
  activeLlmRequests++;
  try {
    return await fn();
  } finally {
    activeLlmRequests--;
  }
}

/** Demo user id used until Supabase Auth is wired to real sessions. */
export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";
