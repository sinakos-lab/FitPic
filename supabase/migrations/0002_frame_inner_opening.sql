-- ============================================================
-- Phase 2 — Frame Fitting Studio
-- Adds the photo-opening rectangle to frames, and locks down
-- the frame-uploads Storage bucket to per-user folders.
-- ============================================================

-- ============================================
-- FRAMES: inner opening rectangle
-- ============================================
alter table public.frames
  add column inner_x integer not null default 0,
  add column inner_y integer not null default 0,
  add column inner_width integer not null default 0,
  add column inner_height integer not null default 0;

comment on column public.frames.inner_x is 'Top-left X of the photo opening, in the same px space as the frame PNG (frames.image_url).';
comment on column public.frames.inner_y is 'Top-left Y of the photo opening.';
comment on column public.frames.inner_width is 'Opening width in px.';
comment on column public.frames.inner_height is 'Opening height in px.';

-- Backfill any existing rows (e.g. Phase 1 seed frames) with a sane default
-- opening (10% inset on all sides) BEFORE the CHECK constraint below is added —
-- otherwise adding the constraint would fail validation against rows still at
-- their inner_width/inner_height = 0 default.
update public.frames
set
  inner_x = round(width_px * 0.1),
  inner_y = round(height_px * 0.1),
  inner_width = round(width_px * 0.8),
  inner_height = round(height_px * 0.8)
where inner_width = 0 or inner_height = 0;

alter table public.frames
  add constraint frames_inner_bounds_chk check (
    inner_x >= 0 and inner_y >= 0 and
    inner_width > 0 and inner_height > 0 and
    inner_x + inner_width <= width_px and
    inner_y + inner_height <= height_px
  );

-- ============================================
-- USER_SAVED_FRAMES: store the flattened export separately
-- from the raw upload (exported_image_url already existed in
-- Phase 1's migration as nullable — make it required now that
-- export is a mandatory part of the save flow).
-- ============================================
alter table public.user_saved_frames
  alter column exported_image_url set not null;

-- ============================================
-- STORAGE: frame-uploads bucket policies
-- Folder convention enforced by the app: {user_id}/{saved_frame_id}/...
-- Bucket itself is created via Supabase Dashboard or CLI, not SQL —
-- these policies assume a bucket named 'frame-uploads' already exists.
-- ============================================
create policy "Users can upload to own folder in frame-uploads"
  on storage.objects for insert
  with check (
    bucket_id = 'frame-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own files in frame-uploads"
  on storage.objects for update
  using (
    bucket_id = 'frame-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own files in frame-uploads"
  on storage.objects for delete
  using (
    bucket_id = 'frame-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Anyone can view frame-uploads (public bucket)"
  on storage.objects for select
  using (bucket_id = 'frame-uploads');

-- ============================================
-- RPC: atomic points increment
-- Avoids read-then-write races if a user saves fits in quick succession
-- (e.g. two tabs, or a fast double-click on Save).
-- ============================================
create or replace function public.increment_user_points(p_user_id uuid, p_points integer)
returns void as $$
begin
  -- security definer bypasses RLS, so explicitly restrict callers to
  -- incrementing only their own points row.
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'Not authorized to modify points for this user.';
  end if;

  update public.profiles
  set total_points = total_points + p_points
  where id = p_user_id;
end;
$$ language plpgsql security definer set search_path = public;

-- Only callable by the authenticated user for their own id — enforced by
-- the Server Action always passing auth.uid() as p_user_id, but we also
-- restrict execution to authenticated role for defense in depth.
revoke execute on function public.increment_user_points(uuid, integer) from public;
grant execute on function public.increment_user_points(uuid, integer) to authenticated;
