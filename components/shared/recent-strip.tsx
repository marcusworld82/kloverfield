"use client";

import { MOCK_RECENT_GENERATIONS } from "@/lib/mock-data";
import { Clock, ImageIcon, Film, AudioLines } from "lucide-react";

const TYPE_ICON = {
  image: ImageIcon,
  video: Film,
  audio: AudioLines,
} as const;

export function RecentStrip() {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Clock size={15} className="text-text-muted" />
        <h2 className="text-sm font-semibold text-text-secondary">
          Recent generations
        </h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {MOCK_RECENT_GENERATIONS.map((gen) => {
          const Icon = TYPE_ICON[gen.type];
          return (
            <div key={gen.id} className="kf-card w-52 shrink-0 p-4">
              <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-bg-secondary">
                <Icon size={22} className="text-text-muted" />
              </div>
              <p className="truncate text-xs font-medium text-text-primary">
                {gen.prompt}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] text-text-muted">{gen.model}</span>
                <span
                  className={
                    gen.status === "complete"
                      ? "text-[11px] text-success"
                      : "text-[11px] text-warning"
                  }
                >
                  {gen.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
