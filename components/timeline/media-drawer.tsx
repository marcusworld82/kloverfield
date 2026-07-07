"use client";

// Timeline media drawer (plan §11): pull any generated image/video from the
// history store, or upload local files, onto timeline tracks.

import { useState } from "react";
import { FolderOpen, Upload, Plus, X } from "lucide-react";
import { useGenerationsStore } from "@/store/generations-store";
import { useTimelineStore, DEFAULT_CLIP_FRAMES } from "@/store/timeline-store";

export function MediaDrawer() {
  const [open, setOpen] = useState(false);
  const [uploads, setUploads] = useState<{ name: string; url: string; isVideo: boolean }[]>([]);
  const generations = useGenerationsStore((s) => s.items);
  const addClip = useTimelineStore((s) => s.addClip);

  function addToTimeline(label: string, url: string, isVideo: boolean) {
    const track = isVideo ? "video" : "video"; // stills land on the video track too
    const end = useTimelineStore
      .getState()
      .tracks[track].reduce((max, c) => Math.max(max, c.start + c.duration), 0);
    addClip(track, {
      label,
      start: end,
      duration: DEFAULT_CLIP_FRAMES,
      src: url,
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-border-default px-4 py-1.5 text-xs text-text-secondary hover:border-accent-red hover:text-white"
      >
        <FolderOpen size={12} /> Media
      </button>

      {open && (
        <div className="fixed inset-y-0 right-0 z-50 flex w-80 flex-col border-l border-border-default bg-bg-secondary shadow-2xl">
          <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
            <h2 className="text-sm font-semibold text-text-primary">Media</h2>
            <button onClick={() => setOpen(false)} aria-label="Close media drawer" className="text-text-muted hover:text-white">
              <X size={15} />
            </button>
          </div>

          <label className="mx-4 mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border-default py-3 text-xs text-text-muted hover:border-accent-red hover:text-white">
            <Upload size={13} /> Upload files
            <input
              type="file"
              accept="image/*,video/*,audio/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const next = Array.from(e.target.files ?? []).map((f) => ({
                  name: f.name,
                  url: URL.createObjectURL(f),
                  isVideo: f.type.startsWith("video"),
                }));
                setUploads((prev) => [...next, ...prev]);
              }}
            />
          </label>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
            {uploads.map((u, i) => (
              <div key={`up-${i}`} className="kf-card flex items-center gap-3 p-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-text-primary">{u.name}</p>
                  <p className="text-[10px] text-text-muted">upload</p>
                </div>
                <button
                  onClick={() => addToTimeline(u.name, u.url, u.isVideo)}
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-accent-red px-2.5 py-1.5 text-[10px] font-medium text-white hover:bg-accent-red-hover"
                >
                  <Plus size={10} /> Add
                </button>
              </div>
            ))}

            {generations.map((g) => (
              <div key={g.id} className="kf-card flex items-center gap-3 p-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.url} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-text-primary">{g.prompt}</p>
                  <p className="text-[10px] text-text-muted">{g.tab} · {g.type}</p>
                </div>
                <button
                  onClick={() => addToTimeline(g.prompt.slice(0, 24), g.url, g.type === "video")}
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-accent-red px-2.5 py-1.5 text-[10px] font-medium text-white hover:bg-accent-red-hover"
                >
                  <Plus size={10} /> Add
                </button>
              </div>
            ))}

            {generations.length === 0 && uploads.length === 0 && (
              <p className="pt-8 text-center text-xs text-text-muted">
                Nothing yet — generate something in Image / Video / Cinema, or upload files.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
