"use client";

// Higgsfield-style masonry history grid (plan §4/§7). Tiles show hover
// actions (favorite / download / image→video / ⋯ menu); ⋯ opens the full
// context menu; click opens the lightbox.

import { useState } from "react";
import {
  Heart,
  Download,
  MoreHorizontal,
  Video,
  ExternalLink,
  RotateCcw,
  Copy,
  AtSign,
  Share2,
  FolderInput,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useGenerationsStore,
  type GenerationRecord,
  type GenTab,
} from "@/store/generations-store";
import { useElementsStore } from "@/store/elements-store";

function TileMenu({
  rec,
  onClose,
  onRegenerate,
  onReuse,
}: {
  rec: GenerationRecord;
  onClose: () => void;
  onRegenerate?: (rec: GenerationRecord) => void;
  onReuse?: (rec: GenerationRecord) => void;
}) {
  const toggleFavorite = useGenerationsStore((s) => s.toggleFavorite);
  const setFolder = useGenerationsStore((s) => s.setFolder);
  const remove = useGenerationsStore((s) => s.remove);
  const addElement = useElementsStore((s) => s.add);

  const items: { label: string; icon: React.ElementType; danger?: boolean; action: () => void }[] = [
    { label: "Open", icon: ExternalLink, action: () => window.open(rec.url, "_blank") },
    { label: "Regenerate", icon: RotateCcw, action: () => onRegenerate?.(rec) },
    { label: "Reuse", icon: Copy, action: () => onReuse?.(rec) },
    {
      label: "Create Element",
      icon: AtSign,
      action: () =>
        addElement({ name: rec.prompt.slice(0, 30) || "Element", url: rec.url, kind: "element" }),
    },
    { label: rec.favorite ? "Unlike" : "Like", icon: Heart, action: () => toggleFavorite(rec.id) },
    {
      label: "Share",
      icon: Share2,
      action: () => navigator.clipboard?.writeText(rec.url),
    },
    {
      label: "Add to folder",
      icon: FolderInput,
      action: () => {
        const folder = window.prompt("Folder name", rec.folder ?? "");
        if (folder !== null) setFolder(rec.id, folder.trim() || null);
      },
    },
    {
      label: "Publish",
      icon: Send,
      action: () => navigator.clipboard?.writeText(rec.url),
    },
    {
      label: "Download",
      icon: Download,
      action: () => window.open(rec.url, "_blank"),
    },
    { label: "Delete", icon: Trash2, danger: true, action: () => remove(rec.id) },
  ];

  return (
    <div
      className="absolute right-2 top-10 z-30 w-48 rounded-xl border border-border-default bg-bg-card p-1.5 shadow-2xl"
      onMouseLeave={onClose}
    >
      {items.map(({ label, icon: Icon, danger, action }) => (
        <button
          key={label}
          onClick={(e) => {
            e.stopPropagation();
            action();
            onClose();
          }}
          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs ${
            danger
              ? "text-error hover:bg-error/10"
              : "text-text-secondary hover:bg-accent-red-muted hover:text-white"
          }`}
        >
          <Icon size={13} />
          {label}
        </button>
      ))}
    </div>
  );
}

function Lightbox({
  rec,
  onClose,
  onReuse,
}: {
  rec: GenerationRecord;
  onClose: () => void;
  onReuse?: (rec: GenerationRecord) => void;
}) {
  const toggleFavorite = useGenerationsStore((s) => s.toggleFavorite);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border-default bg-bg-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border-default px-4 py-2.5">
          <span className="truncate pr-4 text-xs text-text-secondary">
            {rec.model}
          </span>
          <button onClick={onClose} aria-label="Close" className="text-text-muted hover:text-white">
            <X size={16} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={rec.url} alt={rec.prompt} className="mx-auto max-h-[60vh] object-contain" />
        </div>
        <div className="border-t border-border-default p-4">
          <p className="mb-3 text-xs leading-relaxed text-text-secondary">{rec.prompt}</p>
          <div className="flex gap-2">
            <a
              href={rec.url}
              download
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-accent-red px-4 py-2 text-xs font-semibold text-white hover:bg-accent-red-hover"
            >
              <Download size={13} /> Download
            </a>
            <button
              onClick={() => {
                onReuse?.(rec);
                onClose();
              }}
              className="flex items-center gap-1.5 rounded-full border border-border-default px-4 py-2 text-xs text-text-secondary hover:border-accent-red hover:text-white"
            >
              <RotateCcw size={13} /> Recreate
            </button>
            <button
              onClick={() => toggleFavorite(rec.id)}
              className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs ${
                rec.favorite
                  ? "border-accent-red text-accent-red"
                  : "border-border-default text-text-secondary hover:border-accent-red hover:text-white"
              }`}
            >
              <Heart size={13} fill={rec.favorite ? "currentColor" : "none"} />
              {rec.favorite ? "Favorited" : "Favorite"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GenerationGrid({
  tab,
  pendingCount = 0,
  onRegenerate,
  onReuse,
}: {
  tab: GenTab;
  pendingCount?: number;
  onRegenerate?: (rec: GenerationRecord) => void;
  onReuse?: (rec: GenerationRecord) => void;
}) {
  const items = useGenerationsStore((s) => s.items).filter((i) => i.tab === tab);
  const toggleFavorite = useGenerationsStore((s) => s.toggleFavorite);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<GenerationRecord | null>(null);
  const router = useRouter();

  return (
    <>
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
        {Array.from({ length: pendingCount }).map((_, i) => (
          <div
            key={`pending-${i}`}
            className="kf-pulse flex aspect-square break-inside-avoid items-center justify-center rounded-xl border border-accent-red bg-bg-card"
          >
            <span className="text-xs text-text-muted">Generating...</span>
          </div>
        ))}
        {items.map((rec) => (
          <div
            key={rec.id}
            className="group relative break-inside-avoid cursor-pointer overflow-hidden rounded-xl border border-border-default bg-bg-card"
            onClick={() => setLightbox(rec)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={rec.url} alt={rec.prompt} className="w-full" loading="lazy" />

            {/* hover actions */}
            <div className="absolute right-2 top-2 flex flex-col gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(rec.id);
                }}
                aria-label="Favorite"
                className={`flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur ${rec.favorite ? "text-accent-red" : "text-white"}`}
              >
                <Heart size={14} fill={rec.favorite ? "currentColor" : "none"} />
              </button>
              <a
                href={rec.url}
                download
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                aria-label="Download"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur"
              >
                <Download size={14} />
              </a>
              {rec.type === "image" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/video?q=${encodeURIComponent(rec.prompt)}`);
                  }}
                  aria-label="Animate as video"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur"
                >
                  <Video size={14} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuFor(menuFor === rec.id ? null : rec.id);
                }}
                aria-label="More actions"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur"
              >
                <MoreHorizontal size={14} />
              </button>
            </div>

            {rec.favorite && (
              <Heart
                size={12}
                fill="currentColor"
                className="absolute left-2 top-2 text-accent-red group-hover:opacity-0"
              />
            )}

            {menuFor === rec.id && (
              <TileMenu
                rec={rec}
                onClose={() => setMenuFor(null)}
                onRegenerate={onRegenerate}
                onReuse={onReuse}
              />
            )}
          </div>
        ))}
      </div>

      {items.length === 0 && pendingCount === 0 && (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-text-muted">
            Nothing here yet — your generations will fill this screen.
          </p>
        </div>
      )}

      {lightbox && (
        <Lightbox rec={lightbox} onClose={() => setLightbox(null)} onReuse={onReuse} />
      )}
    </>
  );
}
