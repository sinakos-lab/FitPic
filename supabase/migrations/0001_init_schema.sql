-- ============================================================
-- FrameFit & Art Market — Phase 1 Schema
-- Tables: profiles, frames, art_pieces, user_saved_frames, badges
-- (orders/order_items intentionally deferred to a later checkout phase)
-- ============================================================

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  total_points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Public user profile, extends auth.users 1:1 via id.';

-- ============================================
-- FRAMES (admin-uploaded templates)
-- ============================================
create table public.frames (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  style text not null,               -- e.g. 'modern', 'vintage', 'ornate'
  color text not null,
  width_px integer not null check (width_px > 0),
  height_px integer not null check (height_px > 0),
  aspect_ratio numeric not null,     -- precomputed: width_px / height_px
  difficulty text not null default 'easy' check (difficulty in ('easy','medium','hard')),
  image_url text not null,           -- frame overlay PNG (transparent center), used as Konva.Image
  thumbnail_url text not null,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

comment on table public.frames is 'Admin-defined frame templates users fit photos into on the Canvas studio.';

-- ============================================
-- ART PIECES (marketplace inventory)
-- ============================================
create table public.art_pieces (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  artist_name text not null,
  category text not null,            -- e.g. 'abstract', 'photography', 'painting'
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'usd',
  image_url text not null,
  thumbnail_url text not null,
  width_cm numeric,
  height_cm numeric,
  stock_quantity integer not null default 1 check (stock_quantity >= 0),
  is_published boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.art_pieces is 'Marketplace listings, admin-managed. Checkout/orders schema arrives in a later phase.';

-- ============================================
-- USER SAVED FRAMES (fitting attempts + scores)
-- ============================================
create table public.user_saved_frames (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  frame_id uuid not null references public.frames(id) on delete cascade,
  uploaded_image_url text not null,
  -- Konva Stage transform snapshot for the uploaded image layer:
  -- { x, y, scaleX, scaleY, rotation, width, height }
  fit_transform jsonb not null,
  exported_image_url text,           -- optional: stage.toDataURL() export uploaded to Storage
  fit_score integer not null default 0 check (fit_score between 0 and 100),
  badge_earned text references public.badges(id),
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.user_saved_frames is 'A saved photo-in-frame composition, its Canvas transform, and computed fit score.';

-- ============================================
-- BADGES (reference table for gamification)
-- ============================================
create table public.badges (
  id text primary key,               -- e.g. 'perfect_fit', 'explorer_5'
  name text not null,
  description text,
  icon_url text,
  points_awarded integer not null default 0
);

comment on table public.badges is 'Static catalog of unlockable gamification badges.';

-- Deferred FK: user_saved_frames.badge_earned -> badges.id (badges must exist first)
alter table public.user_saved_frames
  add constraint user_saved_frames_badge_earned_fkey
  foreign key (badge_earned) references public.badges(id);

-- ============================================
-- INDEXES
-- ============================================
create index idx_saved_frames_user on public.user_saved_frames(user_id);
create index idx_saved_frames_frame on public.user_saved_frames(frame_id);
create index idx_saved_frames_public on public.user_saved_frames(is_public) where is_public = true;
create index idx_art_pieces_category on public.art_pieces(category) where is_published = true;
create index idx_art_pieces_published on public.art_pieces(is_published);
create index idx_frames_active on public.frames(is_active);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.profiles enable row level security;
alter table public.frames enable row level security;
alter table public.art_pieces enable row level security;
alter table public.user_saved_frames enable row level security;
alter table public.badges enable row level security;

-- Profiles: users read/update own row
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Frames: public read for active frames; admin write
create policy "Anyone can view active frames" on public.frames
  for select using (is_active = true);
create policy "Admins can manage frames" on public.frames
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Art pieces: public read for published; admin write
create policy "Anyone can view published art" on public.art_pieces
  for select using (is_published = true);
create policy "Admins can manage art" on public.art_pieces
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Saved frames: users manage their own; public ones viewable by all
create policy "Users can view own or public saved frames" on public.user_saved_frames
  for select using (auth.uid() = user_id or is_public = true);
create policy "Users can insert own saved frames" on public.user_saved_frames
  for insert with check (auth.uid() = user_id);
create policy "Users can update own saved frames" on public.user_saved_frames
  for update using (auth.uid() = user_id);
create policy "Users can delete own saved frames" on public.user_saved_frames
  for delete using (auth.uid() = user_id);

-- Badges: public read-only reference data
create policy "Anyone can view badges" on public.badges
  for select using (true);

-- ============================================
-- TRIGGER: auto-create profile on signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- TRIGGER: keep updated_at fresh
-- ============================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_art_pieces_updated_at
  before update on public.art_pieces
  for each row execute function public.set_updated_at();
