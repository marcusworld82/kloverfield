"use client";

import Link from "next/link";
import { ImagePlus, Video, Sparkles, FileText } from "lucide-react";

const ACTIONS = [
  {
    title: "Create Image",
    description: "Generate stills with FLUX, Ideogram, Recraft and more.",
    icon: ImagePlus,
    href: "/images",
  },
  {
    title: "Create Video",
    description: "Kling, Veo, Luma and Hailuo — text or image to video.",
    icon: Video,
    href: "/canvas",
  },
  {
    title: "Surprise Me",
    description: "Let the studio pick a model and remix a random concept.",
    icon: Sparkles,
    href: "/brainstorm?q=Surprise%20me%20with%20a%20creative%20concept",
  },
  {
    title: "Summarize",
    description: "Drop in a script or brief and get a tight summary back.",
    icon: FileText,
    href: "/brainstorm?q=Summarize%20this%20for%20me",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {ACTIONS.map(({ title, description, icon: Icon, href }) => (
        <Link key={title} href={href} className="kf-card block p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent-red-muted text-accent-red">
            <Icon size={18} />
          </div>
          <h3 className="text-sm font-bold text-text-primary">{title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-text-muted">
            {description}
          </p>
        </Link>
      ))}
    </div>
  );
}
