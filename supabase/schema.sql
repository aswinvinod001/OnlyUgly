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

drop policy if exists "Users notify post authors about reactions" on public.notifications;
create policy "Users notify post authors about reactions"
on public.notifications
for insert to authenticated
with check (
  auth.uid() = actor_id
  and kind = 'reaction'
  and post_id is not null
  and actor_id <> user_id
  and exists (
    select 1 from public.posts p
    where p.id = notifications.post_id
      and p.author_id = notifications.user_id
  )
);

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
declare
  requested_username text;
  safe_username text;
begin
  requested_username := lower(coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), ''));
  if requested_username <> '' then
    safe_username := requested_username;
  else
    safe_username := lower(regexp_replace(coalesce(split_part(new.email, '@', 1), 'human'), '[^a-zA-Z0-9_]', '', 'g')) || '_' || substr(new.id::text, 1, 5);
  end if;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    safe_username,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1), 'unfiltered human')
  )
  on conflict (id) do update
    set username = excluded.username,
        display_name = excluded.display_name;
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


-- Post composer upgrade (also applied by migration fix_signup_and_expand_onlyugly_posts).
alter table public.posts add column if not exists image_urls text[] not null default '{}';
alter table public.posts add column if not exists auto_swipe boolean not null default true;
alter table public.posts add column if not exists vibe_emoji text;
alter table public.posts add column if not exists rating_enabled boolean not null default false;
alter table public.posts add column if not exists rating_question text;
alter table public.posts add column if not exists rating_min_label text default 'Not at all';
alter table public.posts add column if not exists rating_max_label text default 'Absolutely';
alter table public.posts add column if not exists gravity_engine boolean not null default true;
update public.posts set image_urls = array[image_url] where image_url is not null and cardinality(image_urls) = 0;

create table if not exists public.post_ratings (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null check (score between 0 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
alter table public.post_ratings enable row level security;
drop policy if exists "Post ratings are public" on public.post_ratings;
create policy "Post ratings are public" on public.post_ratings for select using (true);
drop policy if exists "Users submit their own post ratings" on public.post_ratings;
create policy "Users submit their own post ratings" on public.post_ratings for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users update their own post ratings" on public.post_ratings;
create policy "Users update their own post ratings" on public.post_ratings for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users remove their own post ratings" on public.post_ratings;
create policy "Users remove their own post ratings" on public.post_ratings for delete to authenticated using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('onlyugly-posts', 'onlyugly-posts', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif','image/avif'])
on conflict (id) do update set public = true, file_size_limit = 10485760, allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','image/avif'];
drop policy if exists "OnlyUgly images are publicly viewable" on storage.objects;
create policy "OnlyUgly images are publicly viewable" on storage.objects for select using (bucket_id = 'onlyugly-posts');
drop policy if exists "Users upload OnlyUgly post images to their folder" on storage.objects;
create policy "Users upload OnlyUgly post images to their folder" on storage.objects for insert to authenticated with check (bucket_id = 'onlyugly-posts' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users update their own OnlyUgly images" on storage.objects;
create policy "Users update their own OnlyUgly images" on storage.objects for update to authenticated using (bucket_id = 'onlyugly-posts' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'onlyugly-posts' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users delete their own OnlyUgly images" on storage.objects;
create policy "Users delete their own OnlyUgly images" on storage.objects for delete to authenticated using (bucket_id = 'onlyugly-posts' and (storage.foldername(name))[1] = auth.uid()::text);

-- Collision-safe username assignment for new accounts.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare requested_username text; safe_username text; base_username text;
begin
  requested_username := lower(coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), ''));
  if requested_username = '' then
    requested_username := lower(regexp_replace(coalesce(split_part(new.email, '@', 1), 'human'), '[^a-zA-Z0-9_]', '', 'g'));
  end if;
  base_username := left(coalesce(nullif(requested_username, ''), 'human'), 14);
  safe_username := base_username;
  if exists (select 1 from public.profiles p where p.username = safe_username and p.id <> new.id) then
    safe_username := base_username || '_' || substr(replace(new.id::text, '-', ''), 1, 5);
  end if;
  insert into public.profiles (id, username, display_name)
  values (new.id, safe_username, coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), nullif(split_part(new.email, '@', 1), ''), 'unfiltered human'))
  on conflict (id) do update set username = excluded.username, display_name = excluded.display_name;
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to postgres;


-- Temporary mood notes (Instagram Notes-style, expiring after 12–24 hours)
create table if not exists public.mood_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint mood_notes_expiry_valid check (expires_at > created_at)
);
create index if not exists mood_notes_active_idx on public.mood_notes (expires_at desc);
alter table public.mood_notes enable row level security;
drop policy if exists "Active mood notes are visible to authenticated users" on public.mood_notes;
create policy "Active mood notes are visible to authenticated users" on public.mood_notes for select to authenticated using (expires_at > now());
drop policy if exists "Users create their own mood notes" on public.mood_notes;
create policy "Users create their own mood notes" on public.mood_notes for insert to authenticated with check (auth.uid() = user_id and expires_at > now() and expires_at <= now() + interval '24 hours');
drop policy if exists "Users delete their own mood notes" on public.mood_notes;
create policy "Users delete their own mood notes" on public.mood_notes for delete to authenticated using (auth.uid() = user_id);


-- Enable Supabase Realtime for live feed, messaging, and mood notes.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='posts') then
    alter publication supabase_realtime add table public.posts;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='mood_notes') then
    alter publication supabase_realtime add table public.mood_notes;
  end if;
end $$;


-- Keep exactly one active vibe note per account. Publishing replaces the previous one.
delete from public.mood_notes a
using public.mood_notes b
where a.user_id = b.user_id
  and (a.created_at < b.created_at or (a.created_at = b.created_at and a.id::text < b.id::text));
create unique index if not exists mood_notes_one_per_user on public.mood_notes(user_id);
drop policy if exists "Users replace their own mood note" on public.mood_notes;
create policy "Users replace their own mood note" on public.mood_notes
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id and expires_at > now() and expires_at <= now() + interval '24 hours');
