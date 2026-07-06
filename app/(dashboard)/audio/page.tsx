"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AudioLines, Sparkles, ArrowRightToLine } from "lucide-react";
import { useGeneration } from "@/lib/generation/use-generation";
import { GenerationCard } from "@/components/shared/generation-card";
import { useTimelineStore, DEFAULT_CLIP_FRAMES } from "@/store/timeline-store";

const GENRES = [
  "Trap",
  "Ambient",
  "Cinematic",
  "Lo-fi",
  "House",
  "Orchestral",
  "SFX",
  "Voiceover bed",
];

interface AudioAsset {
  id: string;
  label: string;
  genre: string;
  duration: number;
  url: string | null;
}

const MOCK_LIBRARY: AudioAsset[] = [
  { id: "a1", label: "Dark ambient trap loop", genre: "Trap", duration: 30, url: null },
  { id: "a2", label: "Rainy city pad", genre: "Ambient", duration: 60, url: null },
  { id: "a3", label: "Riser + hit (brand sting)", genre: "SFX", duration: 5, url: null },
];

export default function AudioPage() {
  const [genre, setGenre] = useState("Cinematic");
  const [duration, setDuration] = useState(30);
  const [prompt, setPrompt] = useState("");
  const [library, setLibrary] = useState<AudioAsset[]>(MOCK_LIBRARY);
  const gen = useGeneration();
  const addClip = useTimelineStore((s) => s.addClip);
  const router = useRouter();

  function generate() {
    if (!prompt.trim()) return;
    gen.run({
      model: "fal-ai/stable-audio",
      input: {
        prompt: `${genre}: ${prompt.trim()}`,
        seconds_total: duration,
        batch_size: 1,
      },
    });
  }

  function saveToLibrary() {
    setLibrary((prev) => [
      {
        id: `a-${Date.now()}`,
        label: prompt.trim() || "Untitled audio",
        genre,
        duration,
        url: (gen.result?.audio as { url: string } | undefined)?.url ?? null,
      },
      ...prev,
    ]);
  }

  function attachToTimeline(asset: AudioAsset) {
    addClip("audio", {
      label: asset.label,
      start: 0,
      duration: asset.duration * 30 || DEFAULT_CLIP_FRAMES,
      src: asset.url,
    });
    router.push("/timeline");
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <h1 className="text-2xl font-bold text-text-primary">Audio Assets</h1>
      <p className="mt-1 text-sm text-text-muted">
        Generate music, SFX, and voiceover beds — attach anything straight to
        the Timeline.
      </p>

      <div className="mt-6 rounded-3xl border border-border-default bg-bg-card p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={
                genre === g
                  ? "rounded-full bg-accent-red px-3 py-1.5 text-xs font-medium text-white"
                  : "rounded-full border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent-red hover:text-white"
              }
            >
              {g}
            </button>
          ))}
        </div>

        <div className="mb-3 flex items-center gap-3">
          <label className="text-xs text-text-muted">Duration</label>
          <input
            type="range"
            min={5}
            max={120}
            step={5}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="flex-1 accent-[#C8102E]"
          />
          <span className="w-12 text-right text-xs text-text-secondary">
            {duration}s
          </span>
        </div>

        <div className="flex gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder="Describe the sound... e.g. moody keys over sparse 808s"
            className="flex-1 rounded-lg border border-border-default bg-bg-secondary px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-red"
          />
          <button
            onClick={generate}
            disabled={gen.status === "queued" || gen.status === "processing"}
            className="flex items-center gap-1.5 rounded-full bg-accent-red px-5 py-2 text-xs font-semibold text-white hover:bg-accent-red-hover disabled:opacity-60"
          >
            <Sparkles size={13} /> Generate
          </button>
        </div>

        <div className="mt-3">
          <GenerationCard
            status={gen.status}
            error={gen.error}
            result={gen.result}
            onRetry={gen.retry}
            onEditPrompt={gen.reset}
            onRegenerate={generate}
            onSave={saveToLibrary}
          />
        </div>
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold text-text-secondary">
        Library
      </h2>
      <div className="space-y-2">
        {library.map((asset) => (
          <div
            key={asset.id}
            className="kf-card flex items-center gap-4 p-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-red-muted text-accent-red">
              <AudioLines size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">
                {asset.label}
              </p>
              <p className="text-xs text-text-muted">
                {asset.genre} · {asset.duration}s
              </p>
            </div>
            <button
              onClick={() => attachToTimeline(asset)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent-red hover:text-white"
            >
              <ArrowRightToLine size={12} /> Attach to Timeline
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
