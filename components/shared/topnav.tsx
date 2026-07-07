"use client";

// Sticky top navigation (plan §1) — logo always visible on scroll.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/image", label: "Image" },
  { href: "/video", label: "Video" },
  { href: "/cinema", label: "Cinema Studio" },
  { href: "/characters", label: "Characters" },
  { href: "/canvas", label: "Canvas" },
  { href: "/storyboard", label: "Storyboard" },
  { href: "/brainstorm", label: "Brainstorm" },
  { href: "/timeline", label: "Timeline" },
  { href: "/tools", label: "Tools" },
  { href: "/audio", label: "Audio" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-6 border-b border-border-default bg-bg-primary/95 px-5 backdrop-blur">
      <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Kloverfield home">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-red text-base font-bold text-white">
          K
        </span>
        <span className="hidden text-sm font-bold tracking-widest text-text-primary md:block">
          KLOVERFIELD
        </span>
      </Link>

      <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-[13px] transition-colors",
                active
                  ? "font-semibold text-accent-red"
                  : "text-text-secondary hover:text-white"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/settings"
          aria-label="Settings"
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
            pathname.startsWith("/settings")
              ? "bg-accent-red text-white"
              : "bg-bg-card text-text-secondary hover:text-white"
          )}
        >
          <Settings size={16} />
        </Link>
        <div
          title="Marcus"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border-default bg-gradient-to-br from-accent-red to-purple-800 text-xs font-semibold text-white"
        >
          M
        </div>
      </div>
    </header>
  );
}
