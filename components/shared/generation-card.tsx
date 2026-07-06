"use client";

// Visual half of the Section 6.3 state machine. Renders queued / processing /
// failed / complete states around any generation, with Retry and
// Edit Prompt & Retry actions.

import { Loader2, RotateCcw, Pencil, Download, Save } from "lucide-react";
import type { GenerationStatus } from "@/lib/mock-data";
import type { GenerationResultData } from "@/lib/generation/use-generation";

export function GenerationCard({
  status,
  error,
  result,
  onRetry,
  onEditPrompt,
  onRegenerate,
  onSave,
}: {
  status: GenerationStatus;
  error: string | null;
  result: GenerationResultData | null;
  onRetry: () => void;
  onEditPrompt: () => void;
  onRegenerate?: () => void;
  onSave?: () => void;
}) {
  if (status === "idle") return null;

  if (status === "queued") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border-default bg-bg-card p-4">
        <span className="kf-pulse h-2.5 w-2.5 rounded-full bg-warning" />
        <span className="text-sm text-text-secondary">Queued...</span>
      </div>
    );
  }

  if (status === "processing") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border-default bg-bg-card p-4">
        <Loader2 size={16} className="animate-spin text-accent-red" />
        <span className="text-sm text-text-secondary">Generating...</span>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="rounded-2xl border border-error bg-bg-card p-4">
        <p className="text-sm text-error">{error ?? "Generation failed"}</p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 rounded-lg bg-accent-red px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-red-hover"
          >
            <RotateCcw size={12} /> Retry
          </button>
          <button
            onClick={onEditPrompt}
            className="flex items-center gap-1.5 rounded-lg border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent-red hover:text-white"
          >
            <Pencil size={12} /> Edit Prompt &amp; Retry
          </button>
        </div>
      </div>
    );
  }

  // complete
  const imageUrl = result?.images?.[0]?.url;
  const mediaUrl =
    imageUrl ?? result?.video?.url ?? result?.audio?.url ?? null;

  return (
    <div className="rounded-2xl border border-border-default bg-bg-card p-4">
      {imageUrl ? (
        <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-xl bg-bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Generation result"
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <p className="mb-3 break-all text-xs text-text-secondary">
          Result ready{mediaUrl ? `: ${mediaUrl}` : ""}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1.5 rounded-lg border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent-red hover:text-white"
          >
            <RotateCcw size={12} /> Regenerate
          </button>
        )}
        {onSave && (
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 rounded-lg border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent-red hover:text-white"
          >
            <Save size={12} /> Save
          </button>
        )}
        {mediaUrl && (
          <a
            href={mediaUrl}
            download
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent-red hover:text-white"
          >
            <Download size={12} /> Download
          </a>
        )}
      </div>
    </div>
  );
}
