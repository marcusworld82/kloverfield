"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  Clapperboard,
  FileDown,
  ArrowRightToLine,
  ImagePlus,
  X,
} from "lucide-react";
import { SceneCard } from "@/components/storyboard/scene-card";
import { useTimelineStore } from "@/store/timeline-store";
import type { StoryboardScene } from "@/app/api/storyboard/generate/route";

function StoryboardInner() {
  const searchParams = useSearchParams();
  const [concept, setConcept] = useState(searchParams.get("q") ?? "");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [scenes, setScenes] = useState<StoryboardScene[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addClipsFromStoryboard = useTimelineStore((s) => s.addClipsFromStoryboard);
  const router = useRouter();

  async function breakdown() {
    if (!concept.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/storyboard/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept: concept.trim(),
          hasReferenceImage: !!referenceImage,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Scene breakdown failed");
      setScenes(json.scenes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function pushToTimeline() {
    addClipsFromStoryboard(
      scenes.map((s) => ({ label: `Scene ${s.order}: ${s.title}`, src: s.video_url ?? s.image_url }))
    );
    router.push("/timeline");
  }

  return (
    <div className="flex h-full flex-col px-6 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-text-primary">Storyboard</h1>
        <p className="mt-1 text-sm text-text-muted">
          Describe your story — the LLM breaks it into scenes you can generate
          frame by frame.
        </p>

        <div className="mt-5 rounded-3xl border border-border-default bg-bg-card p-4">
          <textarea
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="e.g. A 30-second brand film: an artist walks through a rainy city at night toward a single red spotlight..."
            rows={3}
            className="w-full resize-none bg-transparent px-2 py-1 text-sm text-text-primary outline-none placeholder:text-text-muted"
          />
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="flex cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-border-default px-3 py-1.5 text-xs text-text-muted hover:border-accent-red hover:text-white">
                <ImagePlus size={13} />
                {referenceImage ? "Starter image ✓" : "Start from image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setReferenceImage(URL.createObjectURL(f));
                  }}
                />
              </label>
              {referenceImage && (
                <span className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={referenceImage}
                    alt="Reference"
                    className="h-9 w-9 rounded-lg border border-border-default object-cover"
                  />
                  <button
                    onClick={() => setReferenceImage(null)}
                    aria-label="Remove reference image"
                    className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-bg-card text-text-muted hover:text-error"
                  >
                    <X size={9} />
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={breakdown}
              disabled={loading || !concept.trim()}
              className="flex items-center gap-2 rounded-full bg-accent-red px-5 py-2 text-sm font-semibold text-white hover:bg-accent-red-hover disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Clapperboard size={14} />
              )}
              {loading ? "Breaking down..." : "Break into scenes"}
            </button>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-error">{error}</p>}
      </div>

      {scenes.length > 0 && (
        <div className="mt-8 min-h-0 flex-1">
          <div className="mb-4 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-text-secondary">
              {scenes.length} scenes
            </h2>
            <div className="flex gap-2 print:hidden">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent-red hover:text-white"
              >
                <FileDown size={12} /> Export PDF
              </button>
              <button
                onClick={pushToTimeline}
                className="flex items-center gap-1.5 rounded-lg bg-accent-red px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-red-hover"
              >
                <ArrowRightToLine size={12} /> Push to Timeline
              </button>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 print:flex-col">
            {scenes.map((scene, i) => (
              <SceneCard
                key={scene.order}
                scene={scene}
                referenceImage={referenceImage}
                onPromptChange={(prompt) =>
                  setScenes((prev) =>
                    prev.map((s, j) => (j === i ? { ...s, prompt } : s))
                  )
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StoryboardPage() {
  return (
    <Suspense>
      <StoryboardInner />
    </Suspense>
  );
}
