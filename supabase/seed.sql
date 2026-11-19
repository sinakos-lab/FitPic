-- ============================================================
-- Local dev seed data
-- Run automatically by `supabase db reset`, or manually via
-- `supabase db push --include-seed` depending on CLI version.
-- ============================================================

insert into public.badges (id, name, description, points_awarded) values
  ('perfect_fit', 'Perfect Fit', 'Achieved a 95+ fit score in a single frame.', 100),
  ('first_frame', 'First Frame', 'Saved your very first framed photo.', 10),
  ('explorer_5', 'Frame Explorer', 'Tried 5 different frame styles.', 50),
  ('bold_crop', 'Bold Crop', 'Went dramatic with an off-center crop that still scored well.', 25)
on conflict (id) do nothing;

-- Sample frames (replace image_url/thumbnail_url with real Storage URLs once uploaded)
-- inner_x/y/width/height define the transparent photo opening within the frame PNG.
insert into public.frames
  (name, style, color, width_px, height_px, aspect_ratio, difficulty, image_url, thumbnail_url, inner_x, inner_y, inner_width, inner_height) values
  ('Classic Oak Square', 'classic', 'brown', 1000, 1000, 1.0, 'easy', 'https://placeholder.supabase.co/frames/oak-square.png', 'https://placeholder.supabase.co/frames/oak-square-thumb.png', 100, 100, 800, 800),
  ('Modern Slim Portrait', 'modern', 'black', 800, 1200, 0.667, 'medium', 'https://placeholder.supabase.co/frames/modern-slim.png', 'https://placeholder.supabase.co/frames/modern-slim-thumb.png', 60, 60, 680, 1080),
  ('Ornate Gold Landscape', 'ornate', 'gold', 1400, 900, 1.556, 'hard', 'https://placeholder.supabase.co/frames/ornate-gold.png', 'https://placeholder.supabase.co/frames/ornate-gold-thumb.png', 140, 90, 1120, 720)
on conflict do nothing;
