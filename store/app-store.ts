// Global client state (Section 2): active project + generation queue.
// Canvas gets its own store when the Canvas tab is built in phase 2.

import { create } from "zustand";
import type { GenerationStatus } from "@/lib/mock-data";

export interface QueuedGeneration {
  id: string;
  type: "image" | "video" | "audio";
  provider: "fal" | "higgsfield" | "openrouter";
  model: string;
  prompt: string;
  status: GenerationStatus;
  resultUrl?: string;
  error?: string;
  createdAt: string;
}

interface AppState {
  activeProjectId: string | null;
  setActiveProject: (id: string | null) => void;

  generationQueue: QueuedGeneration[];
  enqueueGeneration: (gen: QueuedGeneration) => void;
  updateGeneration: (
    id: string,
    patch: Partial<Omit<QueuedGeneration, "id">>
  ) => void;
  removeGeneration: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeProjectId: null,
  setActiveProject: (id) => set({ activeProjectId: id }),

  generationQueue: [],
  enqueueGeneration: (gen) =>
    set((s) => ({ generationQueue: [gen, ...s.generationQueue] })),
  updateGeneration: (id, patch) =>
    set((s) => ({
      generationQueue: s.generationQueue.map((g) =>
        g.id === id ? { ...g, ...patch } : g
      ),
    })),
  removeGeneration: (id) =>
    set((s) => ({
      generationQueue: s.generationQueue.filter((g) => g.id !== id),
    })),
}));
