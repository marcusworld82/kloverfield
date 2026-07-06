"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Workflow,
  Clapperboard,
  MessageSquare,
  Film,
  ImageIcon,
  AudioLines,
  Settings,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/studio", label: "Studio", icon: Home },
  { href: "/characters", label: "Characters", icon: Users },
  { href: "/canvas", label: "Canvas", icon: Workflow },
  { href: "/storyboard", label: "Storyboard", icon: Clapperboard },
  { href: "/brainstorm", label: "Brainstorm", icon: MessageSquare },
  { href: "/timeline", label: "Timeline", icon: Film },
  { href: "/images", label: "Image Tools", icon: ImageIcon },
  { href: "/audio", label: "Audio", icon: AudioLines },
];

function RailButton({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
        active
          ? "bg-accent-red text-white"
          : "bg-bg-card text-white hover:bg-accent-red-muted"
      )}
    >
      <Icon size={19} strokeWidth={1.8} />
    </Link>
  );
}

export function IconRail() {
  const pathname = usePathname();

  return (
    <aside className="flex w-[72px] shrink-0 flex-col items-center border-r border-border-default py-5">
      {/* Logo mark */}
      <Link
        href="/studio"
        className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-red font-bold text-lg text-white"
        aria-label="Kloverfield home"
      >
        K
      </Link>

      <nav className="flex flex-1 flex-col items-center gap-3">
        {NAV_ITEMS.map((item) => (
          <RailButton
            key={item.href}
            {...item}
            active={pathname.startsWith(item.href)}
          />
        ))}
      </nav>

      <div className="flex flex-col items-center gap-3">
        <RailButton
          href="/settings"
          label="Settings"
          icon={Settings}
          active={pathname.startsWith("/settings")}
        />
        <button
          title="Theme (locked to Kloverfield dark)"
          aria-label="Theme"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-card text-text-secondary hover:bg-accent-red-muted"
        >
          <Moon size={19} strokeWidth={1.8} />
        </button>
        <div
          title="Marcus"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border-default bg-gradient-to-br from-accent-red to-purple-800 text-sm font-semibold text-white"
        >
          M
        </div>
      </div>
    </aside>
  );
}
