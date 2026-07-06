// Canvas node catalog (Section 5.3). Color coding: red border = generation
// nodes, white border = utility, grey = text/notes.

import type { FalModelCategory } from "@/lib/fal/models.config";

export type NodeKind =
  | "text"
  | "batch"
  | "imageGenerator"
  | "imageUpscaler"
  | "imageEditor"
  | "imageVariations"
  | "videoGenerator"
  | "videoCombiner"
  | "videoUpscaler"
  | "soulReference"
  | "audioVoiceover"
  | "audioSfx"
  | "audioMusic"
  | "stickyNote"
  | "group";

export interface NodeConfig {
  kind: NodeKind;
  label: string;
  category: "Basic" | "Image" | "Video" | "Character" | "Audio" | "Utility";
  border: "red" | "white" | "grey";
  hasPrompt: boolean;
  modelCategory?: FalModelCategory; // populates the model dropdown
  isGenerator: boolean;
}

export const NODE_CONFIGS: NodeConfig[] = [
  { kind: "text", label: "Text", category: "Basic", border: "grey", hasPrompt: true, isGenerator: false },
  { kind: "batch", label: "List / Batch", category: "Basic", border: "grey", hasPrompt: true, isGenerator: false },
  { kind: "imageGenerator", label: "Image Generator", category: "Image", border: "red", hasPrompt: true, modelCategory: "image", isGenerator: true },
  { kind: "imageUpscaler", label: "Image Upscaler", category: "Image", border: "red", hasPrompt: false, modelCategory: "upscale", isGenerator: true },
  { kind: "imageEditor", label: "Image Editor", category: "Image", border: "red", hasPrompt: true, modelCategory: "image", isGenerator: true },
  { kind: "imageVariations", label: "Image Variations", category: "Image", border: "red", hasPrompt: true, modelCategory: "image", isGenerator: true },
  { kind: "videoGenerator", label: "Video Generator", category: "Video", border: "red", hasPrompt: true, modelCategory: "video", isGenerator: true },
  { kind: "videoCombiner", label: "Video Combiner", category: "Video", border: "white", hasPrompt: false, isGenerator: false },
  { kind: "videoUpscaler", label: "Video Upscaler", category: "Video", border: "red", hasPrompt: false, modelCategory: "upscale", isGenerator: true },
  { kind: "soulReference", label: "Soul Reference", category: "Character", border: "red", hasPrompt: false, isGenerator: false },
  { kind: "audioVoiceover", label: "Voiceover", category: "Audio", border: "red", hasPrompt: true, modelCategory: "audio", isGenerator: true },
  { kind: "audioSfx", label: "SFX", category: "Audio", border: "red", hasPrompt: true, modelCategory: "audio", isGenerator: true },
  { kind: "audioMusic", label: "Music", category: "Audio", border: "red", hasPrompt: true, modelCategory: "audio", isGenerator: true },
  { kind: "stickyNote", label: "Sticky Note", category: "Utility", border: "grey", hasPrompt: true, isGenerator: false },
  { kind: "group", label: "Group", category: "Utility", border: "white", hasPrompt: false, isGenerator: false },
];

export function getNodeConfig(kind: NodeKind): NodeConfig {
  return NODE_CONFIGS.find((c) => c.kind === kind) ?? NODE_CONFIGS[0];
}

export const NODE_CATEGORIES = [
  "Basic",
  "Image",
  "Video",
  "Character",
  "Audio",
  "Utility",
] as const;
