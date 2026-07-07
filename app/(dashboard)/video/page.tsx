"use client";

// Create Video tab (plan §5): video history grid + generate bar with
// start/end frame slots and duration.

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GenerateBar } from "@/components/shared/generate-bar";
import { GenerationGrid } from "@/components/shared/generation-grid";
import { useCreateTab } from "@/lib/generation/use-create";
import type { GenerationRecord } from "@/store/generations-store";

function CreateVideoInner() {
  const searchParams = useSearchParams();
  const create = useCreateTab("video", "video");

  function reuse(rec: GenerationRecord) {
    window.location.href = `/video?q=${encodeURIComponent(rec.prompt)}`;
  }

  return (
    <div className="relative flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-44 pt-4">
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-full bg-bg-card px-4 py-1.5 text-xs font-medium text-text-primary">
            History
          </span>
        </div>
        <GenerationGrid
          tab="video"
          pendingCount={create.pendingCount}
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
            category="video"
            onGenerate={create.run}
            busy={create.busy}
            initialPrompt={searchParams.get("q") ?? ""}
            showStartEnd
            showDuration
            defaultAspect="16:9"
          />
        </div>
      </div>
    </div>
  );
}

export default function CreateVideoPage() {
  return (
    <Suspense>
      <CreateVideoInner />
    </Suspense>
  );
}
