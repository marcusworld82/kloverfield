"use client";

// Create Image tab (plan §4): history grid background + Higgsfield-style
// generate bar. Soul mode + color transfer activate via the character chip.

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GenerateBar } from "@/components/shared/generate-bar";
import { GenerationGrid } from "@/components/shared/generation-grid";
import { useCreateTab } from "@/lib/generation/use-create";
import type { GenerationRecord } from "@/store/generations-store";

function CreateImageInner() {
  const searchParams = useSearchParams();
  const create = useCreateTab("image", "image");

  function reuse(rec: GenerationRecord) {
    window.location.href = `/image?q=${encodeURIComponent(rec.prompt)}`;
  }

  return (
    <div className="relative flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-44 pt-4">
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-full bg-bg-card px-4 py-1.5 text-xs font-medium text-text-primary">
            History
          </span>
          <span
            className="cursor-not-allowed rounded-full border border-border-default px-4 py-1.5 text-xs text-text-muted opacity-60"
            title="Coming later"
          >
            Community
          </span>
        </div>
        <GenerationGrid
          tab="image"
          pendingCount={create.pendingCount}
          onRegenerate={(rec) =>
            create.run({
              prompt: rec.prompt,
              model: rec.model.startsWith("higgsfield") ? "fal-ai/flux-pro" : rec.model,
              quality: "high",
              resolution: "2K",
              aspectRatio: "auto",
              batchSize: 1,
              attachments: [],
              mentions: [],
              characterId: null,
              characterStrength: 0.8,
              colorBoardId: null,
              startFrame: null,
              endFrame: null,
              duration: null,
              extraParams: {},
            })
          }
          onReuse={reuse}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-4 pb-5">
        <div className="pointer-events-auto w-full max-w-4xl">
          {create.error && (
            <div className="mb-2 flex items-center justify-between rounded-2xl border border-error bg-bg-card p-3">
              <p className="pr-3 text-xs text-error">{create.error}</p>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={create.retry}
                  className="rounded-lg bg-accent-red px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-red-hover"
                >
                  Retry
                </button>
                <button
                  onClick={create.reset}
                  className="rounded-lg border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:text-white"
                >
                  Edit Prompt &amp; Retry
                </button>
              </div>
            </div>
          )}
          <GenerateBar
            category="image"
            onGenerate={create.run}
            busy={create.busy}
            initialPrompt={searchParams.get("q") ?? ""}
            enableColorTransfer
          />
        </div>
      </div>
    </div>
  );
}

export default function CreateImagePage() {
  return (
    <Suspense>
      <CreateImageInner />
    </Suspense>
  );
}
