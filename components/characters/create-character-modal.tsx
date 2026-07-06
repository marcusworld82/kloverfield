"use client";

import { useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function CreateCharacterModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<"soul" | "soul-cinema">("soul");
  const [validationError, setValidationError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async () => {
      // In real mode these files upload to the Supabase `reference-images`
      // bucket first; here we pass placeholder URLs (Higgsfield mock accepts them).
      const input_images = files.map((f) => ({
        type: "image_url",
        image_url: `upload://${f.name}`,
      }));
      const res = await fetch("/api/higgsfield/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, input_images }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Creation failed");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      onClose();
    },
  });

  function handleSubmit() {
    setValidationError(null);
    if (!name.trim()) return setValidationError("Give your character a name.");
    if (files.length < 5 || files.length > 20)
      return setValidationError(
        `Upload 5-20 reference photos (you have ${files.length}).`
      );
    createMutation.mutate();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border-default bg-bg-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">
            Create Character
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-text-muted hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <label className="mb-1 block text-xs font-medium text-text-secondary">
          Character name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Marcus — Soul ID"
          className="mb-4 w-full rounded-lg border border-border-default bg-bg-secondary px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-red"
        />

        <label className="mb-1 block text-xs font-medium text-text-secondary">
          Reference photos (5-20)
        </label>
        <label className="mb-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-default bg-bg-secondary py-8 text-text-muted transition-colors hover:border-accent-red">
          <Upload size={20} />
          <span className="text-xs">
            {files.length > 0
              ? `${files.length} photo${files.length === 1 ? "" : "s"} selected`
              : "Click to select photos"}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
        </label>

        <label className="mb-1 block text-xs font-medium text-text-secondary">
          Default generation mode
        </label>
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setMode("soul")}
            className={
              mode === "soul"
                ? "rounded-lg bg-accent-red px-3 py-1.5 text-xs font-medium text-white"
                : "rounded-lg border border-border-default px-3 py-1.5 text-xs text-text-secondary"
            }
          >
            Soul (images)
          </button>
          <button
            disabled
            title="Soul Cinema has no public API endpoint yet — coming soon"
            className="cursor-not-allowed rounded-lg border border-border-default px-3 py-1.5 text-xs text-text-muted opacity-60"
          >
            Soul Cinema — coming soon
          </button>
        </div>

        {(validationError || createMutation.error) && (
          <p className="mb-3 text-xs text-error">
            {validationError ??
              (createMutation.error instanceof Error
                ? createMutation.error.message
                : "Something went wrong")}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={createMutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-accent-red py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-red-hover disabled:opacity-60"
        >
          {createMutation.isPending && (
            <Loader2 size={14} className="animate-spin" />
          )}
          {createMutation.isPending ? "Starting training..." : "Start training"}
        </button>
      </div>
    </div>
  );
}
