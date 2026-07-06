"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Video } from "lucide-react";
import { useGeneration } from "@/lib/generation/use-generation";
import { GenerationCard } from "@/components/shared/generation-card";
import type { StoryboardScene } from "@/app/api/storyboard/generate/route";

export function SceneCard({
  scene,
  onPromptChange,
}: {
  scene: StoryboardScene;
  onPromptChange: (prompt: string) => void;
}) {
  const imageGen = useGeneration();
  const videoGen = useGeneration();
  const [imageUrl, setImageUrl] = useState<string | null>(scene.image_url);

  async function regenerateImage() {
    await imageGen.run({
      model: "fal-ai/flux-pro",
      input: { prompt: scene.prompt, aspect_ratio: "16:9", batch_size: 1 },
    });
  }

  // keep local image in sync once a run completes
  const generatedImage = imageGen.result?.images?.[0]?.url;
  useEffect(() => {
    if (generatedImage) setImageUrl(generatedImage);
  }, [generatedImage]);

  function generateVideo() {
    videoGen.run({
      model: "fal-ai/kling-video/v2/master",
      input: {
        prompt: scene.prompt,
        image_url: imageUrl, // first-frame reference (Section 5.4)
        batch_size: 1,
      },
    });
  }

  return (
    <div className="kf-card w-72 shrink-0 p-4 print:w-full print:break-inside-avoid">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-accent-red">
          Scene {scene.order}
        </span>
        <span className="truncate pl-2 text-[11px] text-text-muted">
          {scene.title}
        </span>
      </div>

      <div className="mb-3 flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-bg-secondary">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={scene.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="px-4 text-center text-[11px] text-text-muted">
            No frame yet — hit Regenerate Image
          </span>
        )}
      </div>

      <textarea
        value={scene.prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        rows={3}
        className="mb-3 w-full resize-none rounded-lg border border-border-default bg-bg-secondary p-2 text-xs text-text-primary outline-none focus:border-accent-red"
      />

      <div className="flex gap-2 print:hidden">
        <button
          onClick={regenerateImage}
          disabled={
            imageGen.status === "queued" || imageGen.status === "processing"
          }
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border-default py-1.5 text-xs text-text-secondary hover:border-accent-red hover:text-white disabled:opacity-60"
        >
          <RotateCcw size={12} /> Regenerate Image
        </button>
        <button
          onClick={generateVideo}
          disabled={
            videoGen.status === "queued" || videoGen.status === "processing"
          }
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent-red py-1.5 text-xs font-medium text-white hover:bg-accent-red-hover disabled:opacity-60"
        >
          <Video size={12} /> Generate Video
        </button>
      </div>

      <div className="mt-2 space-y-2 print:hidden">
        <GenerationCard
          status={imageGen.status}
          error={imageGen.error}
          result={null /* image renders in the frame above */}
          onRetry={imageGen.retry}
          onEditPrompt={imageGen.reset}
        />
        <GenerationCard
          status={videoGen.status}
          error={videoGen.error}
          result={videoGen.result}
          onRetry={videoGen.retry}
          onEditPrompt={videoGen.reset}
        />
      </div>
    </div>
  );
}
