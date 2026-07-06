-- Kloverfield initial schema (Spec Section 6)
-- Users handled by Supabase Auth (auth.users)

create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text not null,
  created_at timestamptz default now()
);

create table characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text not null,
  provider text not null, -- 'higgsfield' or 'fal'
  external_reference_id text not null, -- Higgsfield custom_reference_id or FAL identity id
  thumbnail_url text,
  status text default 'training', -- training | ready | failed
  created_at timestamptz default now()
);

create table generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  project_id uuid references projects(id),
  character_id uuid references characters(id),
  type text not null, -- image | video | audio
  provider text not null, -- fal | higgsfield | openrouter
  model text not null,
  prompt text,
  params jsonb,
  result_url text,
  status text default 'pending', -- pending | processing | complete | failed
  estimated_cost_usd numeric(10,4) default 0, -- Section 6.2: cost logged per generation
  created_at timestamptz default now()
);

create table storyboards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  project_id uuid references projects(id),
  title text,
  scenes jsonb, -- array of {order, prompt, image_url, video_url}
  created_at timestamptz default now()
);

create table prompts_library (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  title text,
  content text not null,
  tags text[],
  created_at timestamptz default now()
);

create table skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text not null,
  content text not null,
  file_url text,
  created_at timestamptz default now()
);

create table canvas_spaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text not null,
  nodes jsonb,
  edges jsonb,
  updated_at timestamptz default now()
);

create table timeline_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text,
  tracks jsonb, -- {video: [...clips], audio: [...clips], text: [...clips]}
  updated_at timestamptz default now()
);

-- Section 6.2: daily spend ceiling counter (cost circuit breaker)
create table usage_daily (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  day date not null default current_date,
  total_cost_usd numeric(10,4) not null default 0,
  updated_at timestamptz default now(),
  unique (user_id, day)
);

-- =====================================================================
-- Section 6.1: ROW-LEVEL SECURITY (mandatory four-policy block per table)
-- =====================================================================

-- projects
alter table projects enable row level security;
create policy "Users can view their own rows" on projects for select using (auth.uid() = user_id);
create policy "Users can insert their own rows" on projects for insert with check (auth.uid() = user_id);
create policy "Users can update their own rows" on projects for update using (auth.uid() = user_id);
create policy "Users can delete their own rows" on projects for delete using (auth.uid() = user_id);

-- characters
alter table characters enable row level security;
create policy "Users can view their own rows" on characters for select using (auth.uid() = user_id);
create policy "Users can insert their own rows" on characters for insert with check (auth.uid() = user_id);
create policy "Users can update their own rows" on characters for update using (auth.uid() = user_id);
create policy "Users can delete their own rows" on characters for delete using (auth.uid() = user_id);

-- generations
alter table generations enable row level security;
create policy "Users can view their own rows" on generations for select using (auth.uid() = user_id);
create policy "Users can insert their own rows" on generations for insert with check (auth.uid() = user_id);
create policy "Users can update their own rows" on generations for update using (auth.uid() = user_id);
create policy "Users can delete their own rows" on generations for delete using (auth.uid() = user_id);

-- storyboards
alter table storyboards enable row level security;
create policy "Users can view their own rows" on storyboards for select using (auth.uid() = user_id);
create policy "Users can insert their own rows" on storyboards for insert with check (auth.uid() = user_id);
create policy "Users can update their own rows" on storyboards for update using (auth.uid() = user_id);
create policy "Users can delete their own rows" on storyboards for delete using (auth.uid() = user_id);

-- prompts_library
alter table prompts_library enable row level security;
create policy "Users can view their own rows" on prompts_library for select using (auth.uid() = user_id);
create policy "Users can insert their own rows" on prompts_library for insert with check (auth.uid() = user_id);
create policy "Users can update their own rows" on prompts_library for update using (auth.uid() = user_id);
create policy "Users can delete their own rows" on prompts_library for delete using (auth.uid() = user_id);

-- skills
alter table skills enable row level security;
create policy "Users can view their own rows" on skills for select using (auth.uid() = user_id);
create policy "Users can insert their own rows" on skills for insert with check (auth.uid() = user_id);
create policy "Users can update their own rows" on skills for update using (auth.uid() = user_id);
create policy "Users can delete their own rows" on skills for delete using (auth.uid() = user_id);

-- canvas_spaces
alter table canvas_spaces enable row level security;
create policy "Users can view their own rows" on canvas_spaces for select using (auth.uid() = user_id);
create policy "Users can insert their own rows" on canvas_spaces for insert with check (auth.uid() = user_id);
create policy "Users can update their own rows" on canvas_spaces for update using (auth.uid() = user_id);
create policy "Users can delete their own rows" on canvas_spaces for delete using (auth.uid() = user_id);

-- timeline_projects
alter table timeline_projects enable row level security;
create policy "Users can view their own rows" on timeline_projects for select using (auth.uid() = user_id);
create policy "Users can insert their own rows" on timeline_projects for insert with check (auth.uid() = user_id);
create policy "Users can update their own rows" on timeline_projects for update using (auth.uid() = user_id);
create policy "Users can delete their own rows" on timeline_projects for delete using (auth.uid() = user_id);

-- usage_daily
alter table usage_daily enable row level security;
create policy "Users can view their own rows" on usage_daily for select using (auth.uid() = user_id);
create policy "Users can insert their own rows" on usage_daily for insert with check (auth.uid() = user_id);
create policy "Users can update their own rows" on usage_daily for update using (auth.uid() = user_id);
create policy "Users can delete their own rows" on usage_daily for delete using (auth.uid() = user_id);

-- =====================================================================
-- Storage buckets (Section 4.4) — run via Supabase dashboard or CLI:
--   reference-images, generated-media, character-thumbnails, storyboard-assets
-- =====================================================================
insert into storage.buckets (id, name, public)
values
  ('reference-images', 'reference-images', false),
  ('generated-media', 'generated-media', false),
  ('character-thumbnails', 'character-thumbnails', false),
  ('storyboard-assets', 'storyboard-assets', false)
on conflict (id) do nothing;
