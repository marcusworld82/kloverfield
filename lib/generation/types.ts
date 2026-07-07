// Shared request shape emitted by the GenerateBar (plan §3).

export type Quality = "low" | "medium" | "high";
export type Resolution = "1K" | "2K" | "4K";

export const ASPECT_RATIOS = [
  "auto",
  "1:1",
  "3:2",
  "2:3",
  "16:9",
  "9:16",
  "4:3",
  "3:4",
  "21:9",
] as const;
export type AspectRatio = (typeof ASPECT_RATIOS)[number];

export interface MentionRef {
  kind: "character" | "element";
  id: string;
  name: string;
  url?: string;
}

export interface GenerateRequest {
  prompt: string;
  model: string;
  quality: Quality;
  resolution: Resolution;
  aspectRatio: AspectRatio;
  batchSize: number;
  attachments: { name: string; url: string }[];
  mentions: MentionRef[];
  characterId: string | null; // active Soul reference
  characterStrength: number;
  colorBoardId: string | null;
  startFrame: string | null;
  endFrame: string | null;
  duration: number | null; // seconds, video only
  extraParams: Record<string, unknown>;
}

export const RESOLUTION_PX: Record<Resolution, number> = {
  "1K": 1024,
  "2K": 2048,
  "4K": 4096,
};
