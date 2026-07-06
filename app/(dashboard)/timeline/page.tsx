"use client";

import { useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { Plus, Upload, Loader2, Film, Music, Type } from "lucide-react";
import {
  useTimelineStore,
  TIMELINE_FPS,
  DEFAULT_CLIP_FRAMES,
  type TrackId,
} from "@/store/timeline-store";
import { KloverfieldComposition } from "@/components/timeline/composition";
import { ClipBlock, PX_PER_FRAME } from "@/components/timeline/clip-block";

const TRACKS: { id: TrackId; label: string; icon: React.ElementType }[] = [
  { id: "video", label: "Video", icon: Film },
  { id: "audio", label: "Audio / Music", icon: Music },
  { id: "text", label: "Text / Captions", icon: Type },
];

export default function TimelinePage() {
  const store = useTimelineStore();
  const playerRef = useRef<PlayerRef>(null);
  const [exporting, setExporting] = useState(false);
  const [exportNote, setExportNote] = useState<string | null>(null);
  const totalFrames = store.totalFrames();

  async function handleExport() {
    setExporting(true);
    setExportNote(null);
    try {
      const res = await fetch("/api/timeline/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracks: store.tracks, fps: TIMELINE_FPS }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Export failed");
      setExportNote(
        json.mock
          ? `Render queued (mock). ${json.note}`
          : `Render queued — job ${json.jobId}`
      );
    } catch (err) {
      setExportNote(
        err instanceof Error ? err.message : "Export failed — try again"
      );
    } finally {
      setExporting(false);
    }
  }

  function addDemoClip(track: TrackId) {
    const end = store.tracks[track].reduce(
      (max, c) => Math.max(max, c.start + c.duration),
      0
    );
    store.addClip(track, {
      label:
        track === "video"
          ? "New video clip"
          : track === "audio"
            ? "New audio clip"
            : "New caption",
      start: end,
      duration: DEFAULT_CLIP_FRAMES,
      src: null,
    });
  }

  return (
    <div className="flex h-full flex-col">
      {/* Preview */}
      <div className="flex min-h-0 flex-1 items-center justify-center bg-bg-primary p-6">
        <div className="aspect-video h-full max-h-full w-auto max-w-full overflow-hidden rounded-2xl border border-border-default">
          <Player
            ref={playerRef}
            component={KloverfieldComposition}
            inputProps={{ tracks: store.tracks }}
            durationInFrames={totalFrames}
            fps={TIMELINE_FPS}
            compositionWidth={1920}
            compositionHeight={1080}
            controls
            style={{ width: "100%", height: "100%" }}
            acknowledgeRemotionLicense
          />
        </div>
      </div>

      {/* Timeline dock */}
      <div className="shrink-0 border-t border-border-default bg-bg-secondary">
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-xs text-text-muted">
            {Math.round((totalFrames / TIMELINE_FPS) * 10) / 10}s ·{" "}
            {TIMELINE_FPS}fps
          </span>
          <div className="flex items-center gap-3">
            {exportNote && (
              <span className="max-w-md truncate text-[11px] text-text-muted">
                {exportNote}
              </span>
            )}
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 rounded-full bg-accent-red px-4 py-1.5 text-xs font-semibold text-white hover:bg-accent-red-hover disabled:opacity-60"
            >
              {exporting ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Upload size={12} />
              )}
              Export MP4
            </button>
          </div>
        </div>

        <div className="max-h-56 overflow-auto px-4 pb-4">
          {TRACKS.map(({ id, label, icon: Icon }) => (
            <div key={id} className="mb-2 flex items-center gap-3">
              <div className="flex w-36 shrink-0 items-center gap-2 text-xs text-text-secondary">
                <Icon size={13} className="text-text-muted" />
                {label}
                <button
                  onClick={() => addDemoClip(id)}
                  aria-label={`Add ${label} clip`}
                  className="ml-auto text-text-muted hover:text-accent-red"
                >
                  <Plus size={13} />
                </button>
              </div>
              <div
                className="relative h-12 flex-1 overflow-x-auto rounded-lg border border-border-default bg-bg-card"
                style={{ minWidth: 0 }}
              >
                <div
                  className="relative h-full"
                  style={{ width: totalFrames * PX_PER_FRAME + 100 }}
                >
                  {store.tracks[id].map((clip) => (
                    <ClipBlock key={clip.id} clip={clip} track={id} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
