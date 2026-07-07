"use client";

// Higgsfield-style generate bar (plan §3) shared by Image / Video / Cinema.
// Emits a GenerateRequest; the host tab maps it to a provider payload.

import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  ChevronDown,
  Wand2,
  Loader2,
  X,
  Palette,
  Import,
} from "lucide-react";
import { MentionInput } from "./mention-input";
import { getModelsByCategory, type FalModelCategory } from "@/lib/fal/models.config";
import {
  ASPECT_RATIOS,
  type AspectRatio,
  type GenerateRequest,
  type MentionRef,
  type Quality,
  type Resolution,
} from "@/lib/generation/types";
import { useBoardsStore } from "@/store/boards-store";
import { useElementsStore } from "@/store/elements-store";
import type { CustomReference } from "@/lib/higgsfield/client";

const QUALITIES: Quality[] = ["low", "medium", "high"];
const RESOLUTIONS: Resolution[] = ["1K", "2K", "4K"];

function Chip({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
        active
          ? "border-accent-red bg-accent-red-muted text-white"
          : "border-border-default bg-bg-secondary text-text-secondary hover:border-accent-red hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export function GenerateBar({
  category,
  onGenerate,
  busy,
  initialPrompt = "",
  showStartEnd = false,
  showDuration = false,
  enableColorTransfer = false,
  defaultAspect = "auto",
  extraChips,
}: {
  category: FalModelCategory;
  onGenerate: (req: GenerateRequest) => void;
  busy: boolean;
  initialPrompt?: string;
  showStartEnd?: boolean;
  showDuration?: boolean;
  enableColorTransfer?: boolean;
  defaultAspect?: AspectRatio;
  extraChips?: React.ReactNode;
}) {
  const models = getModelsByCategory(category);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [mentions, setMentions] = useState<MentionRef[]>([]);
  const [model, setModel] = useState(models[0]?.id ?? "");
  const [quality, setQuality] = useState<Quality>("high");
  const [resolution, setResolution] = useState<Resolution>("2K");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(defaultAspect);
  const [batchSize, setBatchSize] = useState(1);
  const [attachments, setAttachments] = useState<{ name: string; url: string }[]>([]);
  const [character, setCharacter] = useState<CustomReference | null>(null);
  const [characterStrength, setCharacterStrength] = useState(0.8);
  const [duration, setDuration] = useState(4);
  const [startFrame, setStartFrame] = useState<string | null>(null);
  const [endFrame, setEndFrame] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState<"model" | "quality" | "resolution" | "aspect" | "character" | "boards" | null>(null);
  const [importId, setImportId] = useState("");
  const [enhancing, setEnhancing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const addElement = useElementsStore((s) => s.add);
  const boards = useBoardsStore((s) => s.boards);
  const activeBoardId = useBoardsStore((s) => s.activeBoardId);
  const setActiveBoard = useBoardsStore((s) => s.setActiveBoard);
  const createBoard = useBoardsStore((s) => s.createBoard);
  const addBoardImage = useBoardsStore((s) => s.addImage);

  const { data: charData } = useQuery({
    queryKey: ["characters"],
    queryFn: async () => {
      const res = await fetch("/api/higgsfield/characters");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json as { characters: CustomReference[] };
    },
    staleTime: 60_000,
  });

  const selectedModel = models.find((m) => m.id === model);
  const estCost = (selectedModel?.estimatedCostUsd ?? 0.05) * batchSize;

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files).map((f) => {
      const url = URL.createObjectURL(f);
      addElement({ name: f.name, url, kind: "upload" });
      return { name: f.name, url };
    });
    setAttachments((prev) => [...prev, ...next]);
  }

  async function enhancePrompt() {
    if (!prompt.trim() || enhancing) return;
    setEnhancing(true);
    try {
      const res = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskType: "visual_prompting",
          messages: [
            {
              role: "system",
              content:
                "Rewrite the user's idea as a single, detailed, cinematic generation prompt. Output ONLY the prompt text.",
            },
            { role: "user", content: prompt },
          ],
        }),
      });
      const json = await res.json();
      if (res.ok && json.content && !json.mock) setPrompt(json.content.trim());
      else if (json.mock) setPrompt(`${prompt.trim()}, cinematic lighting, ultra-detailed, shallow depth of field`);
    } finally {
      setEnhancing(false);
    }
  }

  function submit() {
    if (!prompt.trim() || busy) return;
    onGenerate({
      prompt: prompt.trim(),
      model,
      quality,
      resolution,
      aspectRatio,
      batchSize,
      attachments,
      mentions,
      characterId: character?.id ?? null,
      characterStrength,
      colorBoardId: enableColorTransfer ? activeBoardId : null,
      startFrame,
      endFrame,
      duration: showDuration ? duration : null,
      extraParams: {},
    });
  }

  const soulMode = !!character;

  return (
    <div className="pointer-events-auto w-full max-w-4xl rounded-3xl border border-border-default bg-bg-card/95 p-4 shadow-2xl backdrop-blur">
      {/* Row 1: attach + prompt + character chips + generate */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          title="Add images, video, or files"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-secondary text-text-secondary hover:text-white"
        >
          <Plus size={16} />
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <MentionInput
          value={prompt}
          onChange={setPrompt}
          mentions={mentions}
          onMentionsChange={setMentions}
          placeholder="Describe the scene — use @ to add characters & elements"
          onSubmit={submit}
        />

        <button
          onClick={enhancePrompt}
          title="Enhance prompt with AI"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-secondary text-text-secondary hover:text-accent-red"
        >
          {enhancing ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Wand2 size={15} />
          )}
        </button>

        {/* Character reference chip */}
        <button
          onClick={() => setShowPicker(showPicker === "character" ? null : "character")}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-border-default bg-bg-secondary px-2 py-1.5 hover:border-accent-red"
          title="Soul character reference"
        >
          {character ? (
            <>
              <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-accent-red to-purple-800 text-[10px] font-bold text-white">
                {character.name.charAt(0)}
              </span>
              <span className="max-w-20 truncate text-[10px] font-semibold uppercase text-warning">
                {character.name}
              </span>
            </>
          ) : (
            <span className="px-1 text-xs text-text-muted">Character</span>
          )}
          <ChevronDown size={12} className="text-text-muted" />
        </button>

        <button
          onClick={submit}
          disabled={busy || !prompt.trim()}
          className="flex h-11 shrink-0 items-center gap-2 rounded-2xl bg-accent-red px-5 text-sm font-bold text-white transition-colors hover:bg-accent-red-hover disabled:opacity-50"
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : null}
          Generate <span className="text-xs opacity-80">✦ {estCost.toFixed(3)}</span>
        </button>
      </div>

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {attachments.map((a, i) => (
            <span
              key={i}
              className="flex items-center gap-1 rounded-full bg-bg-secondary px-2 py-0.5 text-[10px] text-text-secondary"
            >
              {a.name}
              <button
                onClick={() =>
                  setAttachments((prev) => prev.filter((_, j) => j !== i))
                }
                aria-label={`Remove ${a.name}`}
              >
                <X size={9} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Row 2: parameter chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Chip onClick={() => setShowPicker(showPicker === "model" ? null : "model")} title="Model">
          <span className="text-accent-red">✦</span>
          {selectedModel?.label ?? "Model"}
          <ChevronDown size={11} />
        </Chip>
        <Chip onClick={() => setQuality(QUALITIES[(QUALITIES.indexOf(quality) + 1) % QUALITIES.length])} title="Quality (click to cycle)">
          ◈ {quality}
        </Chip>
        <Chip onClick={() => setResolution(RESOLUTIONS[(RESOLUTIONS.indexOf(resolution) + 1) % RESOLUTIONS.length])} title="Resolution (click to cycle)">
          ⬒ {resolution}
        </Chip>
        <Chip onClick={() => setShowPicker(showPicker === "aspect" ? null : "aspect")} title="Aspect ratio">
          ▭ {aspectRatio}
          <ChevronDown size={11} />
        </Chip>
        <div className="flex shrink-0 items-center gap-1 rounded-full border border-border-default bg-bg-secondary px-2 py-1 text-xs text-text-secondary">
          <button
            onClick={() => setBatchSize((b) => Math.max(1, b - 1))}
            className="px-1 hover:text-white"
            aria-label="Decrease batch"
          >
            −
          </button>
          <span className="min-w-7 text-center">{batchSize}/10</span>
          <button
            onClick={() => setBatchSize((b) => Math.min(10, b + 1))}
            className="px-1 hover:text-white"
            aria-label="Increase batch"
          >
            +
          </button>
        </div>

        {showDuration && (
          <div className="flex shrink-0 items-center gap-2 rounded-full border border-border-default bg-bg-secondary px-3 py-1 text-xs text-text-secondary">
            Duration
            <input
              type="range"
              min={2}
              max={10}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-16 accent-[#C8102E]"
            />
            {duration}s
          </div>
        )}

        {showStartEnd && (
          <>
            <label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-border-default px-3 py-1.5 text-xs text-text-muted hover:border-accent-red hover:text-white">
              + {startFrame ? "Start ✓" : "Start Frame"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setStartFrame(URL.createObjectURL(f));
                }}
              />
            </label>
            <label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-border-default px-3 py-1.5 text-xs text-text-muted hover:border-accent-red hover:text-white">
              + {endFrame ? "End ✓" : "End Frame (optional)"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setEndFrame(URL.createObjectURL(f));
                }}
              />
            </label>
          </>
        )}

        {soulMode && (
          <>
            <div className="flex shrink-0 items-center gap-2 rounded-full border border-border-default bg-bg-secondary px-3 py-1 text-xs text-text-secondary" title="Soul reference strength">
              Soul
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={characterStrength}
                onChange={(e) => setCharacterStrength(Number(e.target.value))}
                className="w-16 accent-[#C8102E]"
              />
              {Math.round(characterStrength * 100)}%
            </div>
            {enableColorTransfer && (
              <Chip
                onClick={() => setShowPicker(showPicker === "boards" ? null : "boards")}
                active={!!activeBoardId}
                title="Color transfer board"
              >
                <Palette size={12} />
                {activeBoardId
                  ? (boards.find((b) => b.id === activeBoardId)?.name ?? "Board")
                  : "Color Transfer"}
              </Chip>
            )}
          </>
        )}

        {extraChips}
      </div>

      {/* Pickers */}
      {showPicker === "model" && (
        <div className="mt-2 flex flex-wrap gap-1.5 rounded-xl border border-border-default bg-bg-secondary p-2">
          {models.map((m) => (
            <Chip key={m.id} active={m.id === model} onClick={() => { setModel(m.id); setShowPicker(null); }}>
              {m.label} <span className="text-text-muted">~${m.estimatedCostUsd.toFixed(2)}</span>
            </Chip>
          ))}
        </div>
      )}
      {showPicker === "aspect" && (
        <div className="mt-2 flex flex-wrap gap-1.5 rounded-xl border border-border-default bg-bg-secondary p-2">
          {ASPECT_RATIOS.map((r) => (
            <Chip key={r} active={r === aspectRatio} onClick={() => { setAspectRatio(r); setShowPicker(null); }}>
              {r}
            </Chip>
          ))}
        </div>
      )}
      {showPicker === "character" && (
        <div className="mt-2 rounded-xl border border-border-default bg-bg-secondary p-3">
          <div className="flex flex-wrap gap-1.5">
            <Chip active={!character} onClick={() => { setCharacter(null); setShowPicker(null); }}>
              None
            </Chip>
            {(charData?.characters ?? []).map((c) => (
              <Chip key={c.id} active={character?.id === c.id} onClick={() => { setCharacter(c); setShowPicker(null); }}>
                {c.name}
              </Chip>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2 border-t border-border-default pt-2">
            <Import size={12} className="shrink-0 text-text-muted" />
            <input
              value={importId}
              onChange={(e) => setImportId(e.target.value)}
              placeholder="Import existing Higgsfield Soul ID (custom_reference_id)"
              className="flex-1 rounded-lg border border-border-default bg-bg-card px-2 py-1.5 text-[11px] text-text-primary outline-none focus:border-accent-red"
            />
            <button
              onClick={() => {
                if (!importId.trim()) return;
                setCharacter({
                  id: importId.trim(),
                  name: `Imported Soul (${importId.trim().slice(0, 6)}…)`,
                  status: "ready",
                  thumbnail_url: null,
                  created_at: new Date().toISOString(),
                });
                setImportId("");
                setShowPicker(null);
              }}
              className="rounded-lg bg-accent-red px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-accent-red-hover"
            >
              Import
            </button>
          </div>
        </div>
      )}
      {showPicker === "boards" && (
        <div className="mt-2 rounded-xl border border-border-default bg-bg-secondary p-3">
          <div className="flex flex-wrap gap-1.5">
            <Chip active={!activeBoardId} onClick={() => setActiveBoard(null)}>
              Off
            </Chip>
            {boards.map((b) => (
              <Chip key={b.id} active={activeBoardId === b.id} onClick={() => setActiveBoard(b.id)}>
                {b.name} ({b.images.length})
              </Chip>
            ))}
            <Chip
              onClick={() => {
                const name = window.prompt("Board name");
                if (name?.trim()) createBoard(name.trim());
              }}
            >
              + New board
            </Chip>
          </div>
          {activeBoardId && (
            <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border-default px-3 py-2 text-[11px] text-text-muted hover:border-accent-red">
              <Plus size={11} /> Add images to this board
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  Array.from(e.target.files ?? []).forEach((f) =>
                    addBoardImage(activeBoardId, URL.createObjectURL(f))
                  );
                }}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
