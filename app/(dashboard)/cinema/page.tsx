"use client";

// Cinema Studio (plan §6): Director Panel + camera movement modal + speed
// ramps + duration, over the same history grid + generate bar pattern.

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GenerateBar } from "@/components/shared/generate-bar";
import { GenerationGrid } from "@/components/shared/generation-grid";
import { useCreateTab } from "@/lib/generation/use-create";
import {
  DirectorPanel,
  MovementModal,
} from "@/components/cinema/director-panel";
import type { CameraMovement, SpeedRamp } from "@/components/cinema/camera-movements";
import type { GenerateRequest } from "@/lib/generation/types";

function CinemaInner() {
  const searchParams = useSearchParams();
  const create = useCreateTab("cinema", "video");
  const [movement, setMovement] = useState<CameraMovement | null>(null);
  const [ramp, setRamp] = useState<SpeedRamp>("auto");
  const [duration, setDuration] = useState(4);
  const [showMovements, setShowMovements] = useState(false);

  function generate(req: GenerateRequest) {
    const promptParts = [req.prompt];
    if (movement) promptParts.push(movement.promptSuffix);
    if (ramp !== "auto") promptParts.push(`${ramp} speed ramp`);
    create.run({
      ...req,
      prompt: promptParts.join(", "),
      duration,
      extraParams: {
        ...req.extraParams,
        camera_movement: movement?.label ?? "auto",
        speed_ramp: ramp,
      },
    });
  }

  return (
    <div className="relative flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-72 pt-4">
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-full bg-bg-card px-4 py-1.5 text-xs font-medium text-text-primary">
            History
          </span>
        </div>
        <GenerationGrid tab="cinema" pendingCount={create.pendingCount} />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 px-4 pb-5">
        <div className="pointer-events-auto w-full max-w-4xl">
          <DirectorPanel
            movement={movement}
            onMovementClick={() => setShowMovements(true)}
            ramp={ramp}
            onRampChange={setRamp}
            duration={duration}
            onDurationChange={setDuration}
          />
        </div>
        <div className="pointer-events-auto w-full max-w-4xl">
          {create.error && (
            <div className="mb-2 flex items-center justify-between rounded-2xl border border-error bg-bg-card p-3">
              <p className="pr-3 text-xs text-error">{create.error}</p>
              <button
                onClick={create.retry}
                className="shrink-0 rounded-lg bg-accent-red px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-red-hover"
              >
                Retry
              </button>
            </div>
          )}
          <GenerateBar
            category="video"
            onGenerate={generate}
            busy={create.busy}
            initialPrompt={searchParams.get("q") ?? ""}
            showStartEnd
            defaultAspect="16:9"
          />
        </div>
      </div>

      {showMovements && (
        <MovementModal
          selected={movement}
          onPick={setMovement}
          onClose={() => setShowMovements(false)}
        />
      )}
    </div>
  );
}

export default function CinemaPage() {
  return (
    <Suspense>
      <CinemaInner />
    </Suspense>
  );
}
