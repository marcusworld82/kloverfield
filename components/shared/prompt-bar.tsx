"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, Wrench, Mic, ArrowUp } from "lucide-react";

export function PromptBar() {
  const [value, setValue] = useState("");
  const router = useRouter();

  function handleSend() {
    if (!value.trim()) return;
    // Route the prompt into Brainstorm as the starting message
    router.push(`/brainstorm?q=${encodeURIComponent(value.trim())}`);
  }

  return (
    <div className="rounded-3xl border border-border-default bg-bg-card p-4 shadow-lg">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Describe what you want to create..."
        className="w-full bg-transparent px-2 py-1 text-[15px] text-text-primary outline-none placeholder:text-text-muted"
      />
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-full border border-border-default px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent-red hover:text-white">
            <Paperclip size={13} />
            Import file
          </button>
          <button className="flex items-center gap-1.5 rounded-full border border-border-default px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent-red hover:text-white">
            <Wrench size={13} />
            Tools
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="Voice input"
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:text-white"
          >
            <Mic size={17} />
          </button>
          <button
            onClick={handleSend}
            aria-label="Send"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-red text-white transition-colors hover:bg-accent-red-hover"
          >
            <ArrowUp size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
