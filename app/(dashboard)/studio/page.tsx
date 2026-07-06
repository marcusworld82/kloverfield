import { OrbHero } from "@/components/shared/orb-hero";
import { PromptBar } from "@/components/shared/prompt-bar";
import { QuickActions } from "@/components/shared/quick-actions";
import { RecentStrip } from "@/components/shared/recent-strip";

export default function StudioPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 pb-16 pt-10">
      <OrbHero />

      <p className="mt-8 text-lg text-text-muted">Hi, Marcus</p>
      <h1 className="mt-2 text-center text-4xl font-bold tracking-tight text-text-primary">
        How can I help today?
      </h1>
      <p className="mt-3 max-w-md text-center text-sm text-text-muted">
        Generate images, videos, and audio across all your projects — one
        studio, your rules.
      </p>

      <div className="mt-8 w-full max-w-2xl">
        <PromptBar />
      </div>

      <div className="mt-8 w-full">
        <QuickActions />
      </div>

      <div className="mt-14 w-full">
        <RecentStrip />
      </div>
    </div>
  );
}
