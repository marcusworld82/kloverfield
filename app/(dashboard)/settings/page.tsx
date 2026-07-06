"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, KeyRound, Palette, User } from "lucide-react";

interface StatusResponse {
  providers: Record<string, boolean>;
  usage: { spentTodayUsd: number; dailyCeilingUsd: number };
}

const PROVIDER_LABELS: Record<string, { label: string; envVars: string }> = {
  fal: { label: "FAL AI", envVars: "FAL_KEY" },
  higgsfield: {
    label: "Higgsfield (Soul)",
    envVars: "HIGGSFIELD_API_KEY, HIGGSFIELD_API_SECRET",
  },
  openrouter: { label: "OpenRouter", envVars: "OPENROUTER_API_KEY" },
  supabase: {
    label: "Supabase",
    envVars: "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY",
  },
  upstash: {
    label: "Upstash Redis",
    envVars: "UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN",
  },
};

export default function SettingsPage() {
  const { data } = useQuery({
    queryKey: ["settings-status"],
    queryFn: async () => {
      const res = await fetch("/api/settings/status");
      if (!res.ok) throw new Error("Failed to load status");
      return (await res.json()) as StatusResponse;
    },
  });

  const spentPct = data
    ? Math.min(
        100,
        (data.usage.spentTodayUsd / data.usage.dailyCeilingUsd) * 100
      )
    : 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <h1 className="text-2xl font-bold text-text-primary">Settings</h1>

      {/* API keys */}
      <section className="mt-6 rounded-2xl border border-border-default bg-bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <KeyRound size={16} className="text-accent-red" />
          <h2 className="text-sm font-semibold text-text-primary">API Keys</h2>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-text-muted">
          Keys live server-side only in <code>.env.local</code> (never exposed
          to the browser). Paste values there and restart the dev server — the
          status below reflects what the server can see.
        </p>
        <div className="space-y-3">
          {Object.entries(PROVIDER_LABELS).map(([key, meta]) => {
            const configured = data?.providers?.[key];
            return (
              <div
                key={key}
                className="flex items-center justify-between rounded-xl border border-border-default bg-bg-secondary px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {meta.label}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-text-muted">
                    {meta.envVars}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    disabled
                    value={configured ? "••••••••••••" : ""}
                    placeholder="not set"
                    className="w-32 rounded border border-border-default bg-bg-card px-2 py-1 text-right text-xs text-text-muted"
                  />
                  {configured ? (
                    <CheckCircle2 size={16} className="text-success" />
                  ) : (
                    <XCircle size={16} className="text-text-muted" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Usage / credits */}
      <section className="mt-4 rounded-2xl border border-border-default bg-bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold text-text-primary">
          Usage &amp; Daily Spend Ceiling
        </h2>
        <div className="mb-2 flex items-baseline justify-between text-xs">
          <span className="text-text-muted">Spent today (estimated)</span>
          <span className="font-semibold text-text-primary">
            ${data?.usage.spentTodayUsd.toFixed(2) ?? "0.00"} / $
            {data?.usage.dailyCeilingUsd.toFixed(2) ?? "20.00"}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-bg-secondary">
          <div
            className={`h-full rounded-full ${spentPct > 85 ? "bg-error" : "bg-accent-red"}`}
            style={{ width: `${spentPct}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-text-muted">
          Generation requests are blocked once the ceiling is hit. Override
          with <code>DAILY_SPEND_CEILING_USD</code> in .env.local.
        </p>
      </section>

      {/* Profile + theme */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-border-default bg-bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <User size={15} className="text-accent-red" />
            <h2 className="text-sm font-semibold text-text-primary">
              Profile
            </h2>
          </div>
          <p className="text-sm text-text-secondary">Marcus Collins</p>
          <p className="text-xs text-text-muted">EMPOSSIBLE · solo operator</p>
        </section>
        <section className="rounded-2xl border border-border-default bg-bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Palette size={15} className="text-accent-red" />
            <h2 className="text-sm font-semibold text-text-primary">Theme</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-5 w-5 rounded-full border border-border-default bg-[#0A0A0A]" />
            <span className="h-5 w-5 rounded-full bg-[#C8102E]" />
            <span className="h-5 w-5 rounded-full bg-white" />
            <span className="ml-2 text-xs text-text-muted">
              Kloverfield (locked)
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
