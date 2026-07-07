"use client";

// Prompt input with @-mention autocomplete (plan §8). Typing @ opens a
// dropdown of characters + elements; picking one inserts "@Name" and records
// a structured mention resolved into params at submit time.

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AtSign, User, ImageIcon } from "lucide-react";
import { useElementsStore } from "@/store/elements-store";
import type { MentionRef } from "@/lib/generation/types";
import type { CustomReference } from "@/lib/higgsfield/client";

export function MentionInput({
  value,
  onChange,
  mentions,
  onMentionsChange,
  placeholder,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  mentions: MentionRef[];
  onMentionsChange: (m: MentionRef[]) => void;
  placeholder: string;
  onSubmit?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const elements = useElementsStore((s) => s.items);

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

  // Detect an active "@token" at the end of input
  useEffect(() => {
    const match = value.match(/@([\w-]*)$/);
    if (match) {
      setOpen(true);
      setQuery(match[1].toLowerCase());
    } else {
      setOpen(false);
    }
  }, [value]);

  const characterOptions: MentionRef[] = (charData?.characters ?? []).map(
    (c) => ({ kind: "character", id: c.id, name: c.name, url: c.thumbnail_url ?? undefined })
  );
  const elementOptions: MentionRef[] = elements.map((e) => ({
    kind: "element",
    id: e.id,
    name: e.name,
    url: e.url,
  }));
  const options = [...characterOptions, ...elementOptions].filter(
    (o) => !query || o.name.toLowerCase().includes(query)
  );

  function pick(option: MentionRef) {
    const clean = option.name.replace(/[^\w]+/g, "-").replace(/^-+|-+$/g, "");
    onChange(value.replace(/@([\w-]*)$/, `@${clean} `));
    if (!mentions.some((m) => m.id === option.id)) {
      onMentionsChange([...mentions, option]);
    }
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !open) onSubmit?.();
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder={placeholder}
        className="w-full bg-transparent px-2 py-1 text-[15px] text-text-primary outline-none placeholder:text-text-muted"
      />
      {open && options.length > 0 && (
        <div className="absolute bottom-full left-0 z-50 mb-2 max-h-60 w-72 overflow-y-auto rounded-xl border border-border-default bg-bg-card p-1.5 shadow-2xl">
          <p className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            <AtSign size={10} /> Characters &amp; elements
          </p>
          {options.map((o) => (
            <button
              key={`${o.kind}-${o.id}`}
              onClick={() => pick(o)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-text-secondary hover:bg-accent-red-muted hover:text-white"
            >
              {o.kind === "character" ? (
                <User size={12} className="shrink-0 text-accent-red" />
              ) : (
                <ImageIcon size={12} className="shrink-0 text-text-muted" />
              )}
              <span className="truncate">{o.name}</span>
              <span className="ml-auto text-[9px] uppercase text-text-muted">
                {o.kind}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
