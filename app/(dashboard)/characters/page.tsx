"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Loader2, Sparkles } from "lucide-react";
import { CreateCharacterModal } from "@/components/characters/create-character-modal";
import { GenerationCard } from "@/components/shared/generation-card";
import { useGeneration } from "@/lib/generation/use-generation";
import type { CustomReference } from "@/lib/higgsfield/client";

function CharacterDetail({ character }: { character: CustomReference }) {
  const [prompt, setPrompt] = useState("");
  const gen = useGeneration();

  function generate() {
    if (!prompt.trim()) return;
    // Soul jobs run via Higgsfield; in mock mode we route through the shared
    // FAL pipeline with the character model so the state machine is identical.
    gen.run({
      model: "fal-ai/ideogram/character",
      input: {
        prompt: prompt.trim(),
        custom_reference_id: character.id,
        batch_size: 1,
      },
    });
  }

  return (
    <div className="mt-4 rounded-2xl border border-border-default bg-bg-secondary p-4">
      <p className="mb-2 text-xs text-text-muted">
        Generate a new image with this character
      </p>
      <div className="flex gap-2">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
          placeholder="Describe the scene..."
          className="flex-1 rounded-lg border border-border-default bg-bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-red"
        />
        <button
          onClick={generate}
          disabled={gen.status === "queued" || gen.status === "processing"}
          className="flex items-center gap-1.5 rounded-full bg-accent-red px-4 py-2 text-xs font-semibold text-white hover:bg-accent-red-hover disabled:opacity-60"
        >
          <Sparkles size={13} /> Generate New
        </button>
      </div>
      <div className="mt-3">
        <GenerationCard
          status={gen.status}
          error={gen.error}
          result={gen.result}
          onRetry={gen.retry}
          onEditPrompt={gen.reset}
          onRegenerate={generate}
        />
      </div>
    </div>
  );
}

export default function CharactersPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["characters"],
    queryFn: async () => {
      const res = await fetch("/api/higgsfield/characters");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load characters");
      return json as { characters: CustomReference[]; mock: boolean };
    },
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Characters</h1>
        <p className="mt-1 text-sm text-text-muted">
          Train a Soul ID once, reuse it in every generation.
          {data?.mock && " (mock mode — add Higgsfield keys for real training)"}
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Loader2 size={14} className="animate-spin" /> Loading characters...
        </div>
      )}
      {error instanceof Error && (
        <p className="text-sm text-error">{error.message}</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <button
          onClick={() => setShowCreate(true)}
          className="kf-card flex min-h-44 flex-col items-center justify-center gap-3 p-5 text-text-muted hover:text-white"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-red-muted text-accent-red">
            <Plus size={20} />
          </span>
          <span className="text-sm font-medium">Create Character</span>
        </button>

        {data?.characters.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedId(selectedId === c.id ? null : c.id)}
            className={`kf-card flex min-h-44 flex-col items-center justify-center gap-3 p-5 text-left ${selectedId === c.id ? "border-accent-red" : ""}`}
          >
            <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent-red to-purple-800 text-xl font-bold text-white">
              {c.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.thumbnail_url}
                  alt={c.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                c.name.charAt(0)
              )}
            </span>
            <span className="text-center text-sm font-medium text-text-primary">
              {c.name}
            </span>
            <span className="text-[11px] text-text-muted">
              {new Date(c.created_at).toLocaleDateString()}
            </span>
            <span
              className={
                c.status === "ready"
                  ? "rounded-full bg-accent-red-muted px-2 py-0.5 text-[11px] text-success"
                  : "kf-pulse rounded-full bg-accent-red-muted px-2 py-0.5 text-[11px] text-warning"
              }
            >
              {c.status === "ready" ? "ready" : "training..."}
            </span>
          </button>
        ))}
      </div>

      {selectedId && data && (
        <CharacterDetail
          character={data.characters.find((c) => c.id === selectedId)!}
        />
      )}

      {showCreate && (
        <CreateCharacterModal onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}
