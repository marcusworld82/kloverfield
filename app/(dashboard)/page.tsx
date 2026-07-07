"use client";

// Home (plan §2): KLOVERFIELD watermark background + a single Higgsfield-style
// prompt bar docked at the bottom. The prompt carries into /image or /video.

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowUp, ImageIcon, Video } from "lucide-react";

function HomeInner() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"image" | "video">("image");
  const router = useRouter();

  function go() {
    if (!prompt.trim()) return;
    router.push(`/${mode}?q=${encodeURIComponent(prompt.trim())}`);
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span
          className="select-none whitespace-nowrap text-[11vw] font-black tracking-tighter text-transparent"
          style={{ WebkitTextStroke: "2px rgba(200, 16, 46, 0.18)" }}
        >
          KLOVERFIELD
        </span>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-accent-red/10 to-transparent" />

      {/* Bottom prompt bar */}
      <div className="relative mt-auto flex justify-center px-6 pb-10">
        <div className="w-full max-w-3xl rounded-3xl border border-border-default bg-bg-card/95 p-4 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-2">
            <button
              title="Add images, video, or files"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-secondary text-text-secondary hover:text-white"
            >
              <Plus size={16} />
            </button>
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && go()}
              placeholder="Describe what you want to create..."
              className="flex-1 bg-transparent px-2 py-1 text-[15px] text-text-primary outline-none placeholder:text-text-muted"
              autoFocus
            />
            <button
              onClick={go}
              disabled={!prompt.trim()}
              aria-label="Generate"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-red text-white hover:bg-accent-red-hover disabled:opacity-50"
            >
              <ArrowUp size={17} />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => setMode("image")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ${mode === "image" ? "bg-accent-red text-white" : "border border-border-default text-text-secondary hover:text-white"}`}
            >
              <ImageIcon size={12} /> Image
            </button>
            <button
              onClick={() => setMode("video")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ${mode === "video" ? "bg-accent-red text-white" : "border border-border-default text-text-secondary hover:text-white"}`}
            >
              <Video size={12} /> Video
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomeInner />
    </Suspense>
  );
}
