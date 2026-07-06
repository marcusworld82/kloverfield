"use client";

// Section 6.3 generation state machine, shared by every generation surface.
// idle -> queued -> processing -> complete | failed
// - Auto-retry up to 2x with backoff (2s, 8s) for network/5xx errors ONLY
// - 4xx errors surface directly (retrying won't fix a bad prompt)
// - Dead letter: >10 min in processing => failed with timeout message

import { useCallback, useRef, useState } from "react";
import type { GenerationStatus } from "@/lib/mock-data";

const RETRY_DELAYS_MS = [2000, 8000];
const DEAD_LETTER_MS = 10 * 60 * 1000;
const POLL_INTERVAL_MS = 2500;

export interface GenerationResultData {
  images?: { url: string }[];
  video?: { url: string };
  audio?: { url: string };
  [key: string]: unknown;
}

interface RunOptions {
  /** POST body sent to /api/fal/generate */
  model: string;
  input: Record<string, unknown>;
}

export function useGeneration() {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResultData | null>(null);
  const lastRequest = useRef<RunOptions | null>(null);
  const cancelled = useRef(false);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const run = useCallback(async (options: RunOptions) => {
    lastRequest.current = options;
    cancelled.current = false;
    setError(null);
    setResult(null);
    setStatus("queued");

    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
      try {
        const submitRes = await fetch("/api/fal/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(options),
        });

        if (!submitRes.ok) {
          const body = await submitRes.json().catch(() => ({}));
          const message = body.error ?? `Request failed (${submitRes.status})`;
          // 4xx (incl. 429 guardrails): surface directly, no auto-retry
          if (submitRes.status < 500) {
            setError(message);
            setStatus("failed");
            return;
          }
          throw new Error(message);
        }

        const { requestId } = await submitRes.json();
        setStatus("processing");

        const startedAt = Date.now();
        while (!cancelled.current) {
          if (Date.now() - startedAt > DEAD_LETTER_MS) {
            setError("Generation timed out, please retry");
            setStatus("failed");
            return;
          }

          const pollRes = await fetch(
            `/api/fal/status?model=${encodeURIComponent(options.model)}&requestId=${encodeURIComponent(requestId)}`
          );
          if (!pollRes.ok) {
            const body = await pollRes.json().catch(() => ({}));
            throw new Error(body.error ?? `Poll failed (${pollRes.status})`);
          }
          const poll = await pollRes.json();

          if (poll.status === "COMPLETED") {
            setResult(poll.data as GenerationResultData);
            setStatus("complete");
            return;
          }
          if (poll.status === "FAILED") {
            setError("Provider reported the job as failed");
            setStatus("failed");
            return;
          }
          await sleep(POLL_INTERVAL_MS);
        }
        return;
      } catch (err) {
        // network/5xx path — retry with backoff if attempts remain
        if (attempt < RETRY_DELAYS_MS.length) {
          await sleep(RETRY_DELAYS_MS[attempt]);
          continue;
        }
        setError(
          err instanceof Error ? err.message : "Generation failed after retries"
        );
        setStatus("failed");
        return;
      }
    }
  }, []);

  const retry = useCallback(() => {
    if (lastRequest.current) run(lastRequest.current);
  }, [run]);

  const reset = useCallback(() => {
    cancelled.current = true;
    setStatus("idle");
    setError(null);
    setResult(null);
  }, []);

  return { status, error, result, run, retry, reset };
}
