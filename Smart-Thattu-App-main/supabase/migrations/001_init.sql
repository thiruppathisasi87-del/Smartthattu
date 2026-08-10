-- SmartThattu: Initial Supabase schema
-- Run this in your Supabase SQL editor.
-- Creates profiles (family members), meals, chat messages and grocery-shares.
-- All tables are owned by the authenticated user (user_id = auth.uid()).

create extension if not exists "pgcrypto";

-- Enable RLS by default
alter default privileges revoke insert, update, delete, select on tables from public;

create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  age int not null check (age >= 0 and age <= 120),
  gender text not null default 'other',
  activity_level text not null default 'moderate',
  health_category text not null default 'Healthy',
  medical_conditions jsonb not null default '[]'::jsonb,
  goal text,
  created_at timestamptz not null default now()
);

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  member_id uuid not null references public.family_members(id) on delete cascade,
  meal_type text not null check (meal_type in ('breakfast','lunch','dinner','snacks')),
  date date not null default current_date,
  foods jsonb not null default '[]'::jsonb,
  analysis jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  model text not null default 'openai/gpt-4.1-mini',
  language text not null default 'en',
  theme text not null default 'light',
  updated_at timestamptz not null default now()
);

create table if not exists public.grocery_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  categories jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.family_members enable row level security;
alter table public.meals enable row level security;
alter table public.chat_messages enable row level security;
alter table public.user_settings enable row level security;
alter table public.grocery_lists enable row level security;

-- Policies: each user can only access their own data
do $$ begin
  perform 1 from pg_policies where policyname = 'family_members_owner_all';
  if not found then
    create policy family_members_owner_all on public.family_members
      for all using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;

do $$ begin
  perform 1 from pg_policies where policyname = 'meals_owner_all';
  if not found then
    create policy meals_owner_all on public.meals
      for all using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;

do $$ begin
  perform 1 from pg_policies where policyname = 'chat_owner_all';
  if not found then
    create policy chat_owner_all on public.chat_messages
      for all using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;

do $$ begin
  perform 1 from pg_policies where policyname = 'settings_owner_all';
  if not found then
    create policy settings_owner_all on public.user_settings
      for all using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;

do $$ begin
  perform 1 from pg_policies where policyname = 'grocery_owner_all';
  if not found then
    create policy grocery_owner_all on public.grocery_lists
      for all using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;

-- Indexes
create index if not exists meals_user_date_idx on public.meals(user_id, date desc);
create index if not exists meals_member_idx on public.meals(member_id);
create index if not exists family_user_idx on public.family_members(user_id);
create index if not exists chat_user_idx on public.chat_messages(user_id, created_at);

-- Auto-create a row in user_settings on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_settings (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
