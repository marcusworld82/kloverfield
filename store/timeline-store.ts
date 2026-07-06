// Timeline editor state (Section 5.6). Tracks: video, audio, text.
// Clips are positioned in frames at 30fps.

import { create } from "zustand";

export const TIMELINE_FPS = 30;
export const DEFAULT_CLIP_FRAMES = 90; // 3s

export type TrackId = "video" | "audio" | "text";

export interface TimelineClip {
  id: string;
  label: string;
  start: number; // frames
  duration: number; // frames
  src: string | null;
}

interface TimelineState {
  tracks: Record<TrackId, TimelineClip[]>;
  addClip: (track: TrackId, clip: Omit<TimelineClip, "id">) => void;
  addClipsFromStoryboard: (
    items: { label: string; src: string | null }[]
  ) => void;
  moveClip: (track: TrackId, id: string, start: number) => void;
  trimClip: (track: TrackId, id: string, duration: number) => void;
  removeClip: (track: TrackId, id: string) => void;
  totalFrames: () => number;
}

let clipCounter = 0;
const nextId = () => `clip-${Date.now()}-${clipCounter++}`;

export const useTimelineStore = create<TimelineState>((set, get) => ({
  tracks: { video: [], audio: [], text: [] },

  addClip: (track, clip) =>
    set((s) => ({
      tracks: {
        ...s.tracks,
        [track]: [...s.tracks[track], { ...clip, id: nextId() }],
      },
    })),

  addClipsFromStoryboard: (items) =>
    set((s) => {
      const startAt = s.tracks.video.reduce(
        (max, c) => Math.max(max, c.start + c.duration),
        0
      );
      const clips = items.map((item, i) => ({
        id: nextId(),
        label: item.label,
        src: item.src,
        start: startAt + i * DEFAULT_CLIP_FRAMES,
        duration: DEFAULT_CLIP_FRAMES,
      }));
      return {
        tracks: { ...s.tracks, video: [...s.tracks.video, ...clips] },
      };
    }),

  moveClip: (track, id, start) =>
    set((s) => ({
      tracks: {
        ...s.tracks,
        [track]: s.tracks[track].map((c) =>
          c.id === id ? { ...c, start: Math.max(0, Math.round(start)) } : c
        ),
      },
    })),

  trimClip: (track, id, duration) =>
    set((s) => ({
      tracks: {
        ...s.tracks,
        [track]: s.tracks[track].map((c) =>
          c.id === id
            ? { ...c, duration: Math.max(10, Math.round(duration)) }
            : c
        ),
      },
    })),

  removeClip: (track, id) =>
    set((s) => ({
      tracks: {
        ...s.tracks,
        [track]: s.tracks[track].filter((c) => c.id !== id),
      },
    })),

  totalFrames: () => {
    const all = Object.values(get().tracks).flat();
    return Math.max(
      150,
      all.reduce((max, c) => Math.max(max, c.start + c.duration), 0)
    );
  },
}));
