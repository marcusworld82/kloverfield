// Demo data used when real API keys / Supabase are not configured.
// Every provider client falls back to mock mode so the UI stays clickable.

export type GenerationStatus =
  | "idle"
  | "queued"
  | "processing"
  | "failed"
  | "complete";

export interface MockGeneration {
  id: string;
  type: "image" | "video" | "audio";
  prompt: string;
  model: string;
  status: GenerationStatus;
  createdAt: string;
}

export const MOCK_RECENT_GENERATIONS: MockGeneration[] = [
  {
    id: "gen-1",
    type: "image",
    prompt: "Streetwear editorial, red rim light, 85mm portrait",
    model: "flux-pro",
    status: "complete",
    createdAt: "2026-07-05T18:22:00Z",
  },
  {
    id: "gen-2",
    type: "video",
    prompt: "Slow dolly-in on rooftop at dusk, cinematic haze",
    model: "kling-v2",
    status: "complete",
    createdAt: "2026-07-05T16:03:00Z",
  },
  {
    id: "gen-3",
    type: "image",
    prompt: "Album cover concept — chrome typography on black",
    model: "ideogram-v3",
    status: "complete",
    createdAt: "2026-07-04T21:47:00Z",
  },
  {
    id: "gen-4",
    type: "audio",
    prompt: "Dark ambient trap loop, 140bpm, 30s",
    model: "stable-audio",
    status: "processing",
    createdAt: "2026-07-04T20:10:00Z",
  },
  {
    id: "gen-5",
    type: "video",
    prompt: "Product spin of red varsity jacket, studio white",
    model: "veo3",
    status: "complete",
    createdAt: "2026-07-03T14:31:00Z",
  },
];

export interface MockCharacter {
  id: string;
  name: string;
  provider: "higgsfield" | "fal";
  status: "training" | "ready" | "failed";
  thumbnailUrl: string | null;
  createdAt: string;
}

export const MOCK_CHARACTERS: MockCharacter[] = [
  {
    id: "char-1",
    name: "Marcus — Soul ID",
    provider: "higgsfield",
    status: "ready",
    thumbnailUrl: null,
    createdAt: "2026-06-20T12:00:00Z",
  },
  {
    id: "char-2",
    name: "King Zam Brand Model",
    provider: "higgsfield",
    status: "training",
    thumbnailUrl: null,
    createdAt: "2026-07-01T09:30:00Z",
  },
];
