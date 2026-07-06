// Dynamic FAL model registry (Section 4.1).
// Add new models here — components read from this config, never hardcode ids.

export type FalModelCategory =
  | "image"
  | "video"
  | "upscale"
  | "enhance"
  | "audio";

export interface FalModelConfig {
  id: string; // FAL endpoint id, e.g. "fal-ai/flux-pro"
  label: string;
  category: FalModelCategory;
  supportsImageInput?: boolean; // image-to-image / image-to-video
  supportsStartEndFrame?: boolean;
  estimatedCostUsd: number; // per-generation estimate for cost circuit breaker
}

export const FAL_MODELS: FalModelConfig[] = [
  // Image
  { id: "fal-ai/flux-pro", label: "FLUX Pro", category: "image", estimatedCostUsd: 0.05 },
  { id: "fal-ai/ideogram/v3", label: "Ideogram v3", category: "image", estimatedCostUsd: 0.06 },
  { id: "fal-ai/ideogram/character", label: "Ideogram Character", category: "image", supportsImageInput: true, estimatedCostUsd: 0.08 },
  { id: "fal-ai/recraft-v3", label: "Recraft v3", category: "image", estimatedCostUsd: 0.04 },
  { id: "fal-ai/seedream", label: "Seedream", category: "image", estimatedCostUsd: 0.03 },
  // Video
  { id: "fal-ai/kling-video/v2/master", label: "Kling v2 Master", category: "video", supportsImageInput: true, supportsStartEndFrame: true, estimatedCostUsd: 0.7 },
  { id: "fal-ai/veo3", label: "Veo 3", category: "video", supportsImageInput: true, supportsStartEndFrame: true, estimatedCostUsd: 1.25 },
  { id: "fal-ai/luma-dream-machine", label: "Luma Dream Machine", category: "video", supportsImageInput: true, supportsStartEndFrame: true, estimatedCostUsd: 0.5 },
  { id: "fal-ai/minimax/hailuo", label: "MiniMax Hailuo", category: "video", supportsImageInput: true, estimatedCostUsd: 0.45 },
  { id: "fal-ai/pixverse/v4.5", label: "PixVerse v4.5", category: "video", supportsImageInput: true, supportsStartEndFrame: true, estimatedCostUsd: 0.4 },
  // Upscale / Enhance
  { id: "fal-ai/clarity-upscaler", label: "Clarity Upscaler", category: "upscale", supportsImageInput: true, estimatedCostUsd: 0.03 },
  { id: "fal-ai/ccsr", label: "CCSR Upscaler", category: "upscale", supportsImageInput: true, estimatedCostUsd: 0.03 },
  { id: "fal-ai/face-detailer", label: "Face Detailer", category: "enhance", supportsImageInput: true, estimatedCostUsd: 0.04 },
  // Audio
  { id: "fal-ai/stable-audio", label: "Stable Audio", category: "audio", estimatedCostUsd: 0.05 },
];

export function getModelsByCategory(category: FalModelCategory) {
  return FAL_MODELS.filter((m) => m.category === category);
}

export function getModelConfig(id: string) {
  return FAL_MODELS.find((m) => m.id === id);
}
