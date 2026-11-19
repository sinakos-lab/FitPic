import type { FitTransform, FrameRecord } from "@/types/frame.types";

type Rect = { x: number; y: number; width: number; height: number };

/**
 * Axis-aligned bounding box of the transformed image.
 * Note: we intentionally ignore rotation for the bounding-box math below —
 * for the coverage/centering checks we care about the rotated image's AABB,
 * which is a reasonable and cheap approximation for scoring purposes.
 * (A pixel-perfect rotated-rect intersection isn't worth the complexity here;
 * the score is a gamification signal, not a rendering computation.)
 */
function getImageAABB(transform: FitTransform): Rect {
  const { x, y, scaleX, scaleY, rotation, naturalWidth, naturalHeight } = transform;
  const w = naturalWidth * scaleX;
  const h = naturalHeight * scaleY;

  if (rotation === 0) {
    return { x, y, width: w, height: h };
  }

  // Rotate the four corners around the image's own center, then take the AABB.
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const rotatedW = w * cos + h * sin;
  const rotatedH = w * sin + h * cos;

  return {
    x: cx - rotatedW / 2,
    y: cy - rotatedH / 2,
    width: rotatedW,
    height: rotatedH,
  };
}

function intersectionArea(a: Rect, b: Rect): number {
  const left = Math.max(a.x, b.x);
  const top = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);
  if (right <= left || bottom <= top) return 0;
  return (right - left) * (bottom - top);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Coverage: what % of the frame's opening is actually filled by the image.
 * 100 = opening fully covered. Penalizes gaps (image too small or misplaced).
 */
function coverageScore(imageBox: Rect, opening: Rect): number {
  const openingArea = opening.width * opening.height;
  if (openingArea <= 0) return 0;
  const covered = intersectionArea(imageBox, opening);
  return clamp((covered / openingArea) * 100, 0, 100);
}

/**
 * Crop penalty: what % of the ORIGINAL photo is still visible within the
 * opening, vs. zoomed/cropped away. Encourages not over-zooming into a
 * tiny detail of the photo — rewards showing more of the original image.
 */
function cropPenaltyScore(imageBox: Rect, opening: Rect, transform: FitTransform): number {
  const fullImageArea = imageBox.width * imageBox.height;
  if (fullImageArea <= 0) return 0;
  const visibleArea = intersectionArea(imageBox, opening);
  const visibleFraction = visibleArea / fullImageArea; // how much of the placed image is inside the opening

  // Also factor in zoom level relative to natural size: extreme zoom-ins
  // (scale >> 1) that still technically cover the opening get a mild penalty,
  // since they're likely cropping out most of the original photo content.
  const avgScale = (transform.scaleX + transform.scaleY) / 2;
  const zoomPenalty = avgScale > 2.5 ? clamp((avgScale - 2.5) * 15, 0, 40) : 0;

  return clamp(visibleFraction * 100 - zoomPenalty, 0, 100);
}

/**
 * Centering: how close the image's center is to the opening's center,
 * normalized by the opening's diagonal so it scales with frame size.
 */
function centeringScore(imageBox: Rect, opening: Rect): number {
  const imgCx = imageBox.x + imageBox.width / 2;
  const imgCy = imageBox.y + imageBox.height / 2;
  const openCx = opening.x + opening.width / 2;
  const openCy = opening.y + opening.height / 2;

  const dx = imgCx - openCx;
  const dy = imgCy - openCy;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const diagonal = Math.sqrt(opening.width ** 2 + opening.height ** 2);
  if (diagonal <= 0) return 0;

  const normalizedDistance = clamp(distance / diagonal, 0, 1);
  return (1 - normalizedDistance) * 100;
}

export type FitScoreBreakdown = {
  total: number;
  coverage: number;
  cropPenalty: number;
  centering: number;
};

/**
 * Computes a 0-100 "fit score" for a given photo transform inside a frame.
 * Weighted: coverage 50%, crop-penalty 30%, centering 20%.
 *
 * Pure function — no side effects, safe to call from the client (live UI
 * feedback while dragging) and re-run server-side on save (anti-cheat).
 */
export function calculateFitScore(transform: FitTransform, frame: FrameRecord): FitScoreBreakdown {
  const opening: Rect = {
    x: frame.inner_x,
    y: frame.inner_y,
    width: frame.inner_width,
    height: frame.inner_height,
  };
  const imageBox = getImageAABB(transform);

  const coverage = coverageScore(imageBox, opening);
  const cropPenalty = cropPenaltyScore(imageBox, opening, transform);
  const centering = centeringScore(imageBox, opening);

  const total = Math.round(coverage * 0.5 + cropPenalty * 0.3 + centering * 0.2);

  return { total: clamp(total, 0, 100), coverage, cropPenalty, centering };
}

/**
 * Returns a transform that centers the image within the frame's opening
 * and scales it to fully cover the opening (like CSS `object-fit: cover`).
 * Used for the "auto-fit on upload" default — user can adjust manually after.
 */
export function getAutoFitTransform(
  naturalWidth: number,
  naturalHeight: number,
  frame: FrameRecord
): FitTransform {
  const opening = {
    width: frame.inner_width,
    height: frame.inner_height,
  };

  const scale = Math.max(opening.width / naturalWidth, opening.height / naturalHeight);
  const scaledWidth = naturalWidth * scale;
  const scaledHeight = naturalHeight * scale;

  const x = frame.inner_x + (opening.width - scaledWidth) / 2;
  const y = frame.inner_y + (opening.height - scaledHeight) / 2;

  return {
    x,
    y,
    scaleX: scale,
    scaleY: scale,
    rotation: 0,
    naturalWidth,
    naturalHeight,
  };
}
