import type { BadgeId } from "@/types/frame.types";

export type BadgeAwardInput = {
  fitScore: number;
  frameId: string;
  /** frame_ids the user has previously saved a fit for (does not need to include this attempt) */
  previousFrameIds: string[];
  /** whether the image's bounding box was substantially off-center but still scored decently */
  wasIntentionallyOffCenter: boolean;
  /** whether this is the user's very first saved fit ever */
  isFirstFitEver: boolean;
};

export const BADGE_POINTS: Record<BadgeId, number> = {
  first_frame: 10,
  bold_crop: 25,
  explorer_5: 50,
  perfect_fit: 100,
};

/**
 * Determines which single badge (if any) this save attempt unlocks.
 * Only awards a badge the user hasn't already earned in a prior save for a
 * DIFFERENT frame where applicable — callers should also check the user's
 * existing badge set before granting duplicates for one-time badges.
 *
 * Priority order matters: perfect_fit > explorer_5 > bold_crop > first_frame,
 * since a single save should surface its most impressive achievement.
 */
export function determineBadgeAward(input: BadgeAwardInput): BadgeId | null {
  const { fitScore, frameId, previousFrameIds, wasIntentionallyOffCenter, isFirstFitEver } = input;

  if (fitScore >= 95) {
    return "perfect_fit";
  }

  const distinctFramesTried = new Set([...previousFrameIds, frameId]).size;
  if (distinctFramesTried >= 5) {
    return "explorer_5";
  }

  if (fitScore >= 70 && wasIntentionallyOffCenter) {
    return "bold_crop";
  }

  if (isFirstFitEver) {
    return "first_frame";
  }

  return null;
}

/**
 * "Intentionally off-center" heuristic: centering score is meaningfully
 * lower than coverage score, meaning the user chose an asymmetric crop
 * rather than just failing to fill the frame. Threshold is tunable.
 */
export function isIntentionalOffCenter(coverage: number, centering: number): boolean {
  return coverage >= 80 && centering < 60;
}
