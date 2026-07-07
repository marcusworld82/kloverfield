"use client";

// Bridges the GenerateBar to providers (plan §4-6): maps a GenerateRequest to
// a payload, runs it through the Section 6.3 state machine (FAL path) or the
// Soul route (Higgsfield path), and lands completed results in the history
// grid store.

import { useEffect, useRef, useState } from "react";
import { useGeneration } from "@/lib/generation/use-generation";
import { RESOLUTION_PX, type GenerateRequest } from "@/lib/generation/types";
import { useGenerationsStore, type GenTab } from "@/store/generations-store";

export function buildInput(req: GenerateRequest): Record<string, unknown> {
  const elementRefs = req.mentions
    .filter((m) => m.kind === "element" && m.url)
    .map((m) => m.url);
  return {
    prompt: req.prompt,
    quality: req.quality,
    resolution: RESOLUTION_PX[req.resolution],
    ...(req.aspectRatio !== "auto" ? { aspect_ratio: req.aspectRatio } : {}),
    batch_size: req.batchSize,
    ...(req.attachments.length
      ? { reference_images: req.attachments.map((a) => a.url) }
      : {}),
    ...(elementRefs.length ? { element_images: elementRefs } : {}),
    ...(req.startFrame ? { image_url: req.startFrame } : {}),
    ...(req.endFrame ? { end_image_url: req.endFrame } : {}),
    ...(req.duration ? { duration: req.duration } : {}),
    ...(req.colorBoardId ? { color_board_id: req.colorBoardId } : {}),
    ...req.extraParams,
  };
}

export function useCreateTab(tab: GenTab, type: "image" | "video") {
  const gen = useGeneration();
  const add = useGenerationsStore((s) => s.add);
  const lastReq = useRef<GenerateRequest | null>(null);
  const [soulBusy, setSoulBusy] = useState(false);
  const [soulError, setSoulError] = useState<string | null>(null);
  const harvested = useRef<string | null>(null);

  // Harvest FAL results into the history grid once complete
  useEffect(() => {
    if (gen.status !== "complete" || !gen.result || !lastReq.current) return;
    const key = JSON.stringify(gen.result).slice(0, 120) + lastReq.current.prompt;
    if (harvested.current === key) return;
    harvested.current = key;
    const req = lastReq.current;
    const urls: string[] =
      gen.result.images?.map((i) => i.url) ??
      (gen.result.video?.url ? [gen.result.video.url] : []);
    urls.forEach((url) =>
      add({
        tab,
        type,
        prompt: req.prompt,
        model: req.model,
        params: buildInput(req),
        url,
      })
    );
  }, [gen.status, gen.result, add, tab, type]);

  async function runSoul(req: GenerateRequest) {
    setSoulBusy(true);
    setSoulError(null);
    try {
      const res = await fetch("/api/higgsfield/soul", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          custom_reference_id: req.characterId,
          prompt: req.prompt,
          width_and_height: req.aspectRatio === "auto" ? "1024x1024" : req.aspectRatio,
          quality: req.quality,
          custom_reference_strength: req.characterStrength,
          batch_size: req.batchSize,
          ...(req.colorBoardId ? { color_board_id: req.colorBoardId } : {}),
        }),
      });
      const job = await res.json();
      if (!res.ok) throw new Error(job.error ?? "Soul generation failed");

      // Poll for the result (mock completes immediately)
      for (let i = 0; i < 240; i++) {
        const poll = await fetch(`/api/higgsfield/soul?id=${encodeURIComponent(job.id)}`);
        const data = await poll.json();
        if (!poll.ok) throw new Error(data.error ?? "Soul poll failed");
        if (data.status === "completed") {
          const results = (data.results ?? []) as { url: string }[];
          results.forEach((r) =>
            add({
              tab,
              type,
              prompt: req.prompt,
              model: "higgsfield/soul",
              params: { custom_reference_id: req.characterId },
              url: r.url,
            })
          );
          return;
        }
        if (data.status === "failed") throw new Error("Soul job failed");
        await new Promise((r) => setTimeout(r, 2500));
      }
      throw new Error("Generation timed out, please retry");
    } catch (err) {
      setSoulError(err instanceof Error ? err.message : "Soul generation failed");
    } finally {
      setSoulBusy(false);
    }
  }

  function run(req: GenerateRequest) {
    lastReq.current = req;
    if (req.characterId && tab === "image") {
      runSoul(req);
      return;
    }
    gen.run({ model: req.model, input: buildInput(req) });
  }

  const busy = soulBusy || gen.status === "queued" || gen.status === "processing";

  return {
    run,
    busy,
    status: gen.status,
    error: soulError ?? gen.error,
    retry: () => {
      if (lastReq.current) run(lastReq.current);
    },
    reset: () => {
      setSoulError(null);
      gen.reset();
    },
    pendingCount: busy ? (lastReq.current?.batchSize ?? 1) : 0,
  };
}
