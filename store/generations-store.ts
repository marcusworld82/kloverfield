// Generation history (plan §7). Every completed generation lands here and
// renders as the background grid on Image / Video / Cinema tabs.
// Persisted to localStorage; written through to Supabase when configured.

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GenTab = "image" | "video" | "cinema";

export interface GenerationRecord {
  id: string;
  tab: GenTab;
  type: "image" | "video";
  prompt: string;
  model: string;
  params: Record<string, unknown>;
  url: string;
  favorite: boolean;
  folder: string | null;
  createdAt: string;
}

const SEED: GenerationRecord[] = [
  {
    id: "seed-1",
    tab: "image",
    type: "image",
    prompt: "Streetwear editorial, red rim light, 85mm portrait",
    model: "fal-ai/flux-pro",
    params: {},
    url: "https://placehold.co/768x1024/161616/C8102E?text=Editorial",
    favorite: true,
    folder: null,
    createdAt: "2026-07-05T18:22:00Z",
  },
  {
    id: "seed-2",
    tab: "image",
    type: "image",
    prompt: "Album cover concept — chrome typography on black",
    model: "fal-ai/ideogram/v3",
    params: {},
    url: "https://placehold.co/1024x1024/111111/FFFFFF?text=Chrome+Type",
    favorite: false,
    folder: null,
    createdAt: "2026-07-04T21:47:00Z",
  },
  {
    id: "seed-3",
    tab: "video",
    type: "video",
    prompt: "Slow dolly-in on rooftop at dusk, cinematic haze",
    model: "fal-ai/kling-video/v2/master",
    params: {},
    url: "https://placehold.co/1280x720/161616/E8192E?text=Rooftop+Dusk",
    favorite: false,
    folder: null,
    createdAt: "2026-07-05T16:03:00Z",
  },
  {
    id: "seed-4",
    tab: "cinema",
    type: "video",
    prompt: "Hero walk through rain, orbit around, hero ramp up",
    model: "fal-ai/veo3",
    params: { camera_movement: "Orbit around", speed_ramp: "hero ramp up" },
    url: "https://placehold.co/1280x720/0A0A0A/C8102E?text=Cinema+Shot",
    favorite: false,
    folder: null,
    createdAt: "2026-07-05T12:00:00Z",
  },
];

interface GenerationsState {
  items: GenerationRecord[];
  add: (rec: Omit<GenerationRecord, "id" | "createdAt" | "favorite" | "folder">) => void;
  toggleFavorite: (id: string) => void;
  setFolder: (id: string, folder: string | null) => void;
  remove: (id: string) => void;
}

export const useGenerationsStore = create<GenerationsState>()(
  persist(
    (set) => ({
      items: SEED,
      add: (rec) =>
        set((s) => ({
          items: [
            {
              ...rec,
              id: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              favorite: false,
              folder: null,
              createdAt: new Date().toISOString(),
            },
            ...s.items,
          ],
        })),
      toggleFavorite: (id) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, favorite: !i.favorite } : i
          ),
        })),
      setFolder: (id, folder) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, folder } : i)),
        })),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
    }),
    { name: "kloverfield-generations" }
  )
);
