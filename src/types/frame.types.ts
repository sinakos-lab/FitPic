export type FrameDifficulty = "easy" | "medium" | "hard";

export type FrameRecord = {
  id: string;
  name: string;
  style: string;
  color: string;
  width_px: number;
  height_px: number;
  aspect_ratio: number;
  difficulty: FrameDifficulty;
  image_url: string;
  thumbnail_url: string;
  inner_x: number;
  inner_y: number;
  inner_width: number;
  inner_height: number;
  is_active: boolean;
};

/**
 * The user photo's transform on the Konva stage.
 * (x, y) is the image's top-left corner, in the same px space as the frame.
 * scaleX/scaleY apply to the image's natural width/height.
 */
export type FitTransform = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number; // degrees
  naturalWidth: number;
  naturalHeight: number;
};

export type BadgeId = "perfect_fit" | "first_frame" | "explorer_5" | "bold_crop";

export type SaveFitPayload = {
  frameId: string;
  transform: FitTransform;
  exportedImageBase64: string; // data URL from stage.toDataURL()
};

export type SaveFitResult =
  | { success: true; savedFrameId: string; fitScore: number; badgeEarned: BadgeId | null; pointsAwarded: number }
  | { success: false; error: string };
