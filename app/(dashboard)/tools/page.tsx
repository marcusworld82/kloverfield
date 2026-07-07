"use client";

// Utility tool grid (Section 5.7). Every tool runs through the shared
// Section 6.3 state machine. Viral Predictor routes to OpenRouter instead
// of FAL.

import { useState } from "react";
import {
  Camera,
  Grid3X3,
  Wand2,
  UserSquare2,
  GalleryHorizontal,
  TrendingUp,
  Palette,
  Upload,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useGeneration } from "@/lib/generation/use-generation";
import { GenerationCard } from "@/components/shared/generation-card";

interface ToolConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  model: string;
  needsImage: boolean;
  needsEndFrame?: boolean;
  batchSize?: number;
  promptPlaceholder: string;
  isLlm?: boolean;
}

const TOOLS: ToolConfig[] = [
  { id: "angles", title: "Angles", description: "Generate any camera angle from one image.", icon: Camera, model: "fal-ai/flux-pro", needsImage: true, promptPlaceholder: "e.g. low-angle three-quarter view, 35mm" },
  { id: "shots", title: "Shots", description: "9 unique shots from a single image, batched.", icon: Grid3X3, model: "fal-ai/flux-pro", needsImage: true, batchSize: 9, promptPlaceholder: "Describe the subject and mood" },
  { id: "upscaler", title: "Skin Enhancer / Upscaler", description: "Clarity upscale + face detailing.", icon: Wand2, model: "fal-ai/clarity-upscaler", needsImage: true, promptPlaceholder: "Optional guidance (e.g. natural skin texture)" },
  { id: "headshot", title: "Headshot Generator", description: "Portrait presets on your character.", icon: UserSquare2, model: "fal-ai/ideogram/character", needsImage: true, promptPlaceholder: "e.g. corporate headshot, grey backdrop, soft key light" },
  { id: "carousel", title: "Carousel Generator", description: "Multi-slide image set with auto layout.", icon: GalleryHorizontal, model: "fal-ai/ideogram/v3", needsImage: false, batchSize: 7, promptPlaceholder: "Carousel concept — one prompt, 7 slides" },
  { id: "viral", title: "Viral Predictor", description: "0-100 score on hook, pacing, captions.", icon: TrendingUp, model: "", isLlm: true, needsImage: false, promptPlaceholder: "Paste your hook / caption / script" },
  { id: "color", title: "Color Transfer", description: "Transfer a reference image's grade.", icon: Palette, model: "fal-ai/recraft-v3", needsImage: true, needsEndFrame: true, promptPlaceholder: "Describe the target look" },
];

function ToolPanel({ tool }: { tool: ToolConfig }) {
  const [prompt, setPrompt] = useState("");
  const [imageName, setImageName] = useState<string | null>(null);
  const [endFrameName, setEndFrameName] = useState<string | null>(null);
  const [llmResult, setLlmResult] = useState<string | null>(null);
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmError, setLlmError] = useState<string | null>(null);
  const gen = useGeneration();

  async function run() {
    if (tool.isLlm) {
      if (!prompt.trim() || llmLoading) return;
      setLlmLoading(true);
      setLlmError(null);
      setLlmResult(null);
      try {
        const res = await fetch("/api/openrouter/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskType: "creative_writing",
            messages: [
              {
                role: "system",
                content:
                  "You are a short-form content virality analyst. Score the user's content 0-100 on hook strength, pacing, and caption quality. Output: SCORE: <n>/100, then 3 short bullets of reasoning, then 1 concrete improvement.",
              },
              { role: "user", content: prompt },
            ],
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Analysis failed");
        setLlmResult(json.content);
      } catch (err) {
        setLlmError(err instanceof Error ? err.message : "Analysis failed");
      } finally {
        setLlmLoading(false);
      }
      return;
    }

    gen.run({
      model: tool.model,
      input: {
        prompt: prompt.trim(),
        batch_size: tool.batchSize ?? 1,
        ...(imageName ? { image_url: `upload://${imageName}` } : {}),
        ...(endFrameName ? { end_image_url: `upload://${endFrameName}` } : {}),
      },
    });
  }

  return (
    <div className="mt-3 border-t border-border-default pt-3">
      {tool.needsImage && (
        <label className="mb-2 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border-default px-3 py-2 text-xs text-text-muted hover:border-accent-red">
          <Upload size={12} />
          {imageName ?? "Upload start frame / source image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setImageName(e.target.files?.[0]?.name ?? null)}
          />
        </label>
      )}
      {tool.needsEndFrame && (
        <label className="mb-2 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border-default px-3 py-2 text-xs text-text-muted hover:border-accent-red">
          <Upload size={12} />
          {endFrameName ?? "Upload end frame / reference"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setEndFrameName(e.target.files?.[0]?.name ?? null)}
          />
        </label>
      )}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={tool.promptPlaceholder}
        rows={2}
        className="mb-2 w-full resize-none rounded-lg border border-border-default bg-bg-secondary p-2 text-xs text-text-primary outline-none focus:border-accent-red"
      />
      <button
        onClick={run}
        disabled={
          llmLoading || gen.status === "queued" || gen.status === "processing"
        }
        className="flex w-full items-center justify-center gap-1.5 rounded-full bg-accent-red py-2 text-xs font-semibold text-white hover:bg-accent-red-hover disabled:opacity-60"
      >
        {llmLoading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Sparkles size={12} />
        )}
        {tool.batchSize && tool.batchSize > 1
          ? `Generate ${tool.batchSize}`
          : tool.isLlm
            ? "Analyze"
            : "Generate"}
      </button>

      {!tool.isLlm && (
        <div className="mt-2">
          <GenerationCard
            status={gen.status}
            error={gen.error}
            result={gen.result}
            onRetry={gen.retry}
            onEditPrompt={gen.reset}
            onRegenerate={run}
          />
        </div>
      )}
      {llmError && <p className="mt-2 text-xs text-error">{llmError}</p>}
      {llmResult && (
        <div className="mt-2 whitespace-pre-wrap rounded-xl border border-border-default bg-bg-secondary p-3 text-xs text-text-secondary">
          {llmResult}
        </div>
      )}
    </div>
  );
}

export default function ImagesPage() {
  const [openTool, setOpenTool] = useState<string | null>(null);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-bold text-text-primary">
        Image &amp; Video Tools
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        One-shot utilities — every tool supports start/end frame control where
        it applies.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const open = openTool === tool.id;
          return (
            <div key={tool.id} className={`kf-card p-5 ${open ? "border-accent-red" : ""}`}>
              <button
                onClick={() => setOpenTool(open ? null : tool.id)}
                className="block w-full text-left"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent-red-muted text-accent-red">
                  <Icon size={18} />
                </div>
                <h3 className="text-sm font-bold text-text-primary">
                  {tool.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-text-muted">
                  {tool.description}
                </p>
              </button>
              {open && <ToolPanel tool={tool} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
