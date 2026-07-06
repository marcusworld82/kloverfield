"use client";

import { usePathname } from "next/navigation";
import { Share2, Bell } from "lucide-react";

const TITLES: Record<string, string> = {
  "/studio": "Studio",
  "/characters": "Characters",
  "/canvas": "Canvas",
  "/storyboard": "Storyboard",
  "/brainstorm": "Brainstorm",
  "/timeline": "Timeline",
  "/images": "Image & Video Tools",
  "/audio": "Audio Assets",
  "/settings": "Settings",
};

export function Topbar() {
  const pathname = usePathname();
  const title =
    Object.entries(TITLES).find(([k]) => pathname.startsWith(k))?.[1] ??
    "Studio";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-default px-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-text-muted">Kloverfield</span>
        <span className="text-text-muted">/</span>
        <span className="font-medium text-text-primary">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-card text-text-secondary transition-colors hover:text-white"
        >
          <Bell size={16} />
        </button>
        <button className="flex h-9 items-center gap-2 rounded-full bg-bg-card px-4 text-sm text-text-secondary transition-colors hover:text-white">
          <Share2 size={14} />
          Share
        </button>
      </div>
    </header>
  );
}
