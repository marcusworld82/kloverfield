# Kloverfield

Self-owned AI content creation studio — a Higgsfield (character consistency) + Magnific Spaces (node-based canvas) hybrid, built on Next.js 15.

**Brand:** Black `#0A0A0A` / Red `#C8102E` / White `#FFFFFF`

## Stack

- Next.js 15 (App Router, TypeScript) + Tailwind CSS v4
- Zustand (client state) + TanStack React Query (data fetching)
- @xyflow/react for the node Canvas · Framer Motion for animation
- Supabase (Postgres + Auth + Storage) · Upstash Redis (job queue)
- Providers: FAL AI (images/video/audio), Higgsfield (Soul characters only), OpenRouter (all LLMs)

## Getting started

```bash
pnpm install
cp .env.example .env.local   # paste your real keys
pnpm dev
```

Without keys, every provider client runs in **mock mode** — the whole UI stays clickable with demo data.

## Environment variables

See `.env.example`. Required for real generations:

| Var | Provider |
| --- | --- |
| `FAL_KEY` | fal.ai |
| `HIGGSFIELD_API_KEY` / `HIGGSFIELD_API_SECRET` | platform.higgsfield.ai (Soul) |
| `OPENROUTER_API_KEY` | openrouter.ai |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Upstash |

## Database

Apply `supabase/migrations/0001_init.sql` against your Supabase project (SQL editor or `supabase db push`). It creates all tables **with row-level security enabled** plus the four storage buckets.

## Build phases

- **Phase 1 (this commit):** scaffold, design system, shared layout (icon rail / topbar / shell), Studio home tab, provider client wrappers with mock fallback, full DB migration.
- **Phase 2 (next):** Characters, Canvas, Storyboard, Brainstorm, Timeline (Remotion), utility tools, Settings.
