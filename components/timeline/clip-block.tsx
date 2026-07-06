"use client";

// Draggable + trimmable clip block. Drag the body to move, drag the right
// edge to trim. 1 frame = PX_PER_FRAME px.

import { useRef } from "react";
import { X } from "lucide-react";
import {
  useTimelineStore,
  type TimelineClip,
  type TrackId,
} from "@/store/timeline-store";

export const PX_PER_FRAME = 2;

export function ClipBlock({
  clip,
  track,
}: {
  clip: TimelineClip;
  track: TrackId;
}) {
  const moveClip = useTimelineStore((s) => s.moveClip);
  const trimClip = useTimelineStore((s) => s.trimClip);
  const removeClip = useTimelineStore((s) => s.removeClip);
  const dragState = useRef<{
    mode: "move" | "trim";
    startX: number;
    origStart: number;
    origDuration: number;
  } | null>(null);

  function onPointerDown(e: React.PointerEvent, mode: "move" | "trim") {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = {
      mode,
      startX: e.clientX,
      origStart: clip.start,
      origDuration: clip.duration,
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    const drag = dragState.current;
    if (!drag) return;
    const deltaFrames = (e.clientX - drag.startX) / PX_PER_FRAME;
    if (drag.mode === "move") {
      moveClip(track, clip.id, drag.origStart + deltaFrames);
    } else {
      trimClip(track, clip.id, drag.origDuration + deltaFrames);
    }
  }

  function onPointerUp() {
    dragState.current = null;
  }

  return (
    <div
      className="group absolute top-1 flex h-10 cursor-grab items-center overflow-hidden rounded-lg border border-accent-red bg-accent-red-muted px-2 active:cursor-grabbing"
      style={{
        left: clip.start * PX_PER_FRAME,
        width: clip.duration * PX_PER_FRAME,
      }}
      onPointerDown={(e) => onPointerDown(e, "move")}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <span className="truncate text-[10px] font-medium text-text-primary">
        {clip.label}
      </span>
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => removeClip(track, clip.id)}
        aria-label="Remove clip"
        className="absolute right-3 top-1 hidden text-text-muted hover:text-error group-hover:block"
      >
        <X size={10} />
      </button>
      {/* trim handle */}
      <div
        className="absolute right-0 top-0 h-full w-2 cursor-ew-resize bg-accent-red/70"
        onPointerDown={(e) => onPointerDown(e, "trim")}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
    </div>
  );
}
