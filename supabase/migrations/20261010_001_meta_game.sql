-- Aura Farmer — secure persistence schema proposal, NOT YET APPLIED.
-- Run via Supabase migration tooling only after the owner connects a project.
-- No browser client may mint verified results or grant achievements.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or (char_length(display_name) between 3 and 18 and display_name ~ '^[A-Za-z0-9_-]+$')),
  leaderboard_opt_in boolean not null default false,
  name_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_progress (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  save_schema_version integer not null default 1 check (save_schema_version >= 1),
  account_level integer not null default 1 check (account_level >= 1),
  account_xp bigint not null default 0 check (account_xp >= 0),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.character_unlocks (
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  character_id text not null check (character_id in ('sigma','alpha','rizzler','ohio','fanum','six-seven')),
  unlocked_at timestamptz not null default now(),
  primary key (user_id,character_id)
);

create table if not exists public.achievement_definitions (
  achievement_id text primary key,
  version integer not null default 1,
  name text not null,
  description text not null,
  active boolean not null default true
);

create table if not exists public.player_achievements (
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  achievement_id text not null references public.achievement_definitions(achievement_id),
  progress integer not null default 0 check (progress >= 0),
  unlocked_at timestamptz,
  primary key (user_id,achievement_id)
);

create table if not exists public.seasons (
  season_id text primary key,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  rules_version text not null,
  status text not null default 'scheduled' check (status in ('scheduled','active','ended')),
  check (starts_at < ends_at)
);

create table if not exists public.runs (
  run_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  character_id text not null check (character_id in ('sigma','alpha','rizzler','ohio','fanum','six-seven')),
  mode text not null check (mode in ('classic','daily','weekly')),
  rules_version text not null,
  seed bigint not null,
  started_at timestamptz not null,
  finished_at timestamptz not null,
  wave integer not null check (wave between 1 and 5),
  kills integer not null check (kills >= 0),
  score bigint not null check (score >= 0),
  duration_ms integer not null check (duration_ms between 0 and 3600000),
  verified boolean not null default false,
  verification_reason text,
  unique (user_id,run_id),
  check (started_at <= finished_at)
);

create index if not exists runs_user_finished_at_idx on public.runs(user_id,finished_at desc);
create index if not exists runs_verified_score_idx on public.runs(mode,rules_version,score desc) where verified;

create table if not exists public.leaderboard_entries (
  season_id text not null references public.seasons(season_id) on delete cascade,
  mode text not null check (mode in ('classic','daily','weekly')),
  rules_version text not null,
  character_id text not null check (character_id in ('sigma','alpha','rizzler','ohio','fanum','six-seven')),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  best_run_id uuid not null references public.runs(run_id) on delete cascade,
  score bigint not null check (score >= 0),
  recorded_at timestamptz not null default now(),
  primary key (season_id,mode,rules_version,character_id,user_id)
);
create index if not exists leaderboard_top_idx
 on public.leaderboard_entries(season_id,mode,rules_version,score desc,recorded_at);

-- Row Level Security: clients cannot grant themselves achievements or verified scores.
alter table public.profiles enable row level security;
alter table public.profile_progress enable row level security;
alter table public.character_unlocks enable row level security;
alter table public.achievement_definitions enable row level security;
alter table public.player_achievements enable row level security;
alter table public.seasons enable row level security;
alter table public.runs enable row level security;
alter table public.leaderboard_entries enable row level security;

-- Restrict direct API privileges. Service role retains superuser-like trusted access
-- ONLY from server-side functions; NEVER expose it in Vite/browser code.
revoke all on public.profiles,public.profile_progress,public.character_unlocks,
 public.achievement_definitions,public.player_achievements,public.seasons,
 public.runs,public.leaderboard_entries from anon,authenticated;

grant select on public.profiles to authenticated;
grant update (display_name,leaderboard_opt_in) on public.profiles to authenticated;
grant select on public.profile_progress,public.character_unlocks,
 public.player_achievements,public.runs to authenticated;
grant select on public.achievement_definitions,public.seasons to anon,authenticated;

create policy "players read own profile" on public.profiles for select to authenticated
  using (user_id = (select auth.uid()));
create policy "players update own limited profile fields" on public.profiles for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "players read own progress" on public.profile_progress for select to authenticated
  using (user_id = (select auth.uid()));
create policy "players read own characters" on public.character_unlocks for select to authenticated
  using (user_id = (select auth.uid()));
create policy "players read own achievements" on public.player_achievements for select to authenticated
  using (user_id = (select auth.uid()));
create policy "players read own runs" on public.runs for select to authenticated
  using (user_id = (select auth.uid()));
create policy "public catalog" on public.achievement_definitions for select to anon,authenticated using (active);
create policy "public seasons" on public.seasons for select to anon,authenticated using (true);
-- leaderboard_entries has NO direct client SELECT/INSERT/UPDATE/DELETE grants or policies.

-- Changing a public nickname invalidates moderation approval, preventing a player
-- from switching to an unreviewed name after a moderator has approved a prior one.
create or replace function public.invalidate_unreviewed_nickname()
returns trigger language plpgsql security definer set search_path = ''
as $
begin
  if new.display_name is distinct from old.display_name then
    new.name_approved := false;
  end if;
  new.updated_at := now();
  return new;
end $;
drop trigger if exists profile_nickname_changed on public.profiles;
create trigger profile_nickname_changed
before update on public.profiles for each row
execute function public.invalidate_unreviewed_nickname();

-- Create private profile & basic unlocked roster after a new Supabase Auth identity.
create or replace function public.init_aura_farmer_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles(user_id) values (new.id) on conflict do nothing;
  insert into public.profile_progress(user_id) values (new.id) on conflict do nothing;
  insert into public.character_unlocks(user_id,character_id) values
    (new.id,'sigma'),(new.id,'alpha'),(new.id,'rizzler'),(new.id,'ohio')
  on conflict do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created_aura_farmer on auth.users;
create trigger on_auth_user_created_aura_farmer
after insert on auth.users for each row execute function public.init_aura_farmer_user();

-- The leaderboard endpoint exposes only opted-in, approved public display names
-- attached to a legitimately verified run. This function is READ ONLY.
create or replace function public.get_aura_leaderboard(
  p_season text, p_mode text, p_rules_version text,
  p_character text default null, p_limit integer default 50
)
returns table (rank_number bigint, display_name text, character_id text, score bigint, recorded_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select row_number() over(order by l.score desc,l.recorded_at asc) as rank_number,
         p.display_name,l.character_id,l.score,l.recorded_at
  from public.leaderboard_entries l
  join public.profiles p on p.user_id=l.user_id
  join public.runs r on r.run_id=l.best_run_id
  where l.season_id=p_season and l.mode=p_mode and l.rules_version=p_rules_version
    and (p_character is null or l.character_id=p_character)
    and p.leaderboard_opt_in=true and p.name_approved=true and p.display_name is not null
    and r.verified=true and r.user_id=l.user_id and r.character_id=l.character_id
    and r.score=l.score and r.rules_version=l.rules_version
  order by l.score desc,l.recorded_at asc
  limit least(greatest(coalesce(p_limit,50),1),100);
$$;

revoke all on function public.get_aura_leaderboard(text,text,text,text,integer) from public;
grant execute on function public.get_aura_leaderboard(text,text,text,text,integer) to anon,authenticated;

-- Explicitly not provided: client-facing submit_verified_run function.
-- Verified submissions require an independent anti-cheat/replay verifier,
-- rate limiting, nonces and pinned gameplay rules on a trusted backend.
