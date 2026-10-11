-- OnlyUgly starter schema for Supabase.
-- Run this in Supabase Dashboard -> SQL Editor. RLS is enabled on every public table.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text not null default 'unfiltered human',
  bio text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  caption text not null check (char_length(caption) between 1 and 1000),
  mood text not null default 'PURE CHAOS',
  emoji text not null default '🫠',
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create table if not exists public.reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.saved_posts (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  post_id uuid references public.posts(id) on delete cascade,
  kind text not null check (kind in ('reaction','comment','message','system')),
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  constraint messages_not_self check (sender_id <> recipient_id)
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_author_idx on public.posts (author_id, created_at desc);
create index if not exists comments_post_idx on public.comments (post_id, created_at);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.saved_posts enable row level security;
alter table public.notifications enable row level security;
alter table public.messages enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
drop policy if exists "Users create own profile" on public.profiles;
create policy "Users create own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Published posts are viewable by everyone" on public.posts;
create policy "Published posts are viewable by everyone" on public.posts for select using (true);
drop policy if exists "Signed-in users create own posts" on public.posts;
create policy "Signed-in users create own posts" on public.posts for insert to authenticated with check (auth.uid() = author_id);
drop policy if exists "Authors update own posts" on public.posts;
create policy "Authors update own posts" on public.posts for update to authenticated using (auth.uid() = author_id) with check (auth.uid() = author_id);
drop policy if exists "Authors delete own posts" on public.posts;
create policy "Authors delete own posts" on public.posts for delete to authenticated using (auth.uid() = author_id);

drop policy if exists "Comments are public" on public.comments;
create policy "Comments are public" on public.comments for select using (true);
drop policy if exists "Signed-in users comment as themselves" on public.comments;
create policy "Signed-in users comment as themselves" on public.comments for insert to authenticated with check (auth.uid() = author_id);
drop policy if exists "Authors delete own comments" on public.comments;
create policy "Authors delete own comments" on public.comments for delete to authenticated using (auth.uid() = author_id);

drop policy if exists "Reactions are public" on public.reactions;
create policy "Reactions are public" on public.reactions for select using (true);
drop policy if exists "Users add own reactions" on public.reactions;
create policy "Users add own reactions" on public.reactions for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users remove own reactions" on public.reactions;
create policy "Users remove own reactions" on public.reactions for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "Users view own saved posts" on public.saved_posts;
create policy "Users view own saved posts" on public.saved_posts for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users save posts for themselves" on public.saved_posts;
create policy "Users save posts for themselves" on public.saved_posts for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users unsave own posts" on public.saved_posts;
create policy "Users unsave own posts" on public.saved_posts for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "Users view own notifications" on public.notifications;
create policy "Users view own notifications" on public.notifications for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users mark own notifications read" on public.notifications;
create policy "Users mark own notifications read" on public.notifications for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Conversation participants view messages" on public.messages;
create policy "Conversation participants view messages" on public.messages for select to authenticated using (auth.uid() = sender_id or auth.uid() = recipient_id);
drop policy if exists "Users send messages as themselves" on public.messages;
create policy "Users send messages as themselves" on public.messages for insert to authenticated with check (auth.uid() = sender_id);
drop policy if exists "Recipients mark messages read" on public.messages;
create policy "Recipients mark messages read" on public.messages for update to authenticated using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);

-- Create a public profile automatically for each new auth account.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    lower(regexp_replace(coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)), '[^a-zA-Z0-9_]', '', 'g')) || '_' || substr(new.id::text, 1, 5),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- This trigger function is only for the auth trigger, never a public RPC.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to postgres;
