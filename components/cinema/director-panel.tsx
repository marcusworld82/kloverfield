"use client";

// Cinema Studio Director Panel (plan §6): movement picker, speed-ramp curve,
// ramp select, duration — mirrors Higgsfield Cinema Studio.

import { useState } from "react";
import { Clapperboard, ChevronDown, ChevronUp, X, UserPlus } from "lucide-react";
import {
  CAMERA_MOVEMENTS,
  SPEED_RAMPS,
  type CameraMovement,
  type SpeedRamp,
} from "./camera-movements";

const RAMP_CURVES: Record<SpeedRamp, string> = {
  auto: "M0,22 C15,22 20,6 35,6 S55,20 70,20 S90,10 100,12",
  linear: "M0,16 L100,16",
  "slow-motion": "M0,8 C30,8 40,26 60,26 S90,24 100,24",
  "hero ramp up": "M0,26 C30,26 45,24 60,12 S85,2 100,2",
  custom: "M0,20 C20,4 35,28 50,10 S80,26 100,8",
};

export function MovementModal({
  selected,
  onPick,
  onClose,
}: {
  selected: CameraMovement | null;
  onPick: (m: CameraMovement) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border-default bg-bg-card p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-black">
            Camera movement
          </span>
          <button onClick={onClose} aria-label="Close" className="text-text-muted hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {CAMERA_MOVEMENTS.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                onPick(m);
                onClose();
              }}
              className={`group rounded-xl border p-1.5 text-center transition-colors ${
                selected?.id === m.id
                  ? "border-white"
                  : "border-border-default hover:border-accent-red"
              }`}
            >
              <div className="mb-1.5 flex aspect-[4/3] items-center justify-center rounded-lg bg-gradient-to-br from-bg-secondary to-accent-red-muted">
                <Clapperboard size={18} className="text-text-muted group-hover:text-accent-red" />
              </div>
              <span className="text-[11px] text-text-secondary">{m.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DirectorPanel({
  movement,
  onMovementClick,
  ramp,
  onRampChange,
  duration,
  onDurationChange,
}: {
  movement: CameraMovement | null;
  onMovementClick: () => void;
  ramp: SpeedRamp;
  onRampChange: (r: SpeedRamp) => void;
  duration: number;
  onDurationChange: (d: number) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="w-full max-w-4xl rounded-2xl border border-border-default bg-bg-card/95 backdrop-blur">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5"
      >
        <span className="flex items-center gap-2 text-xs font-semibold text-text-primary">
          <Clapperboard size={14} className="text-accent-red" /> Director Panel
        </span>
        {open ? (
          <ChevronUp size={14} className="text-text-muted" />
        ) : (
          <ChevronDown size={14} className="text-text-muted" />
        )}
      </button>

      {open && (
        <div className="flex flex-wrap items-center gap-3 border-t border-border-default px-4 py-3">
          {/* Character/location slots — filled via @ in the prompt */}
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-dashed border-border-default text-text-muted"
            title="Add characters & locations with @ in the prompt"
          >
            <UserPlus size={15} />
          </div>

          {/* Movement */}
          <button
            onClick={onMovementClick}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-border-default bg-bg-secondary px-3 py-2 text-left hover:border-accent-red"
          >
            <div className="flex h-8 w-10 items-center justify-center rounded-md bg-gradient-to-br from-bg-card to-accent-red-muted">
              <Clapperboard size={12} className="text-accent-red" />
            </div>
            <div>
              <p className="text-[10px] text-text-muted">Movement</p>
              <p className="text-xs font-medium text-text-primary">
                {movement?.label ?? "Auto"}
              </p>
            </div>
            <ChevronDown size={12} className="text-text-muted" />
          </button>

          {/* Ramp curve */}
          <div className="h-12 w-40 shrink-0 rounded-xl border border-border-default bg-bg-secondary p-1.5" title="Speed ramp curve">
            <svg viewBox="0 0 100 32" className="h-full w-full">
              <path
                d={RAMP_CURVES[ramp]}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Speed ramp select */}
          <label className="shrink-0 rounded-xl border border-border-default bg-bg-secondary px-3 py-2">
            <span className="block text-[10px] text-text-muted">Speed ramp</span>
            <select
              value={ramp}
              onChange={(e) => onRampChange(e.target.value as SpeedRamp)}
              className="bg-transparent text-xs font-medium text-text-primary outline-none"
            >
              {SPEED_RAMPS.map((r) => (
                <option key={r} value={r} className="bg-bg-card">
                  {r}
                </option>
              ))}
            </select>
          </label>

          {/* Duration */}
          <label className="flex shrink-0 items-center gap-2 rounded-xl border border-border-default bg-bg-secondary px-3 py-2">
            <span className="text-[10px] text-text-muted">Duration</span>
            <input
              type="range"
              min={2}
              max={10}
              value={duration}
              onChange={(e) => onDurationChange(Number(e.target.value))}
              className="w-20 accent-[#C8102E]"
            />
            <span className="text-xs font-medium text-text-primary">{duration}s</span>
          </label>
        </div>
      )}
    </div>
  );
}
