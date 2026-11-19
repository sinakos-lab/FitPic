import { create } from "zustand";
import type { FitTransform, FrameRecord } from "@/types/frame.types";
import { calculateFitScore, getAutoFitTransform, type FitScoreBreakdown } from "@/lib/gamification/scoring";

const EMPTY_TRANSFORM: FitTransform = {
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  naturalWidth: 0,
  naturalHeight: 0,
};

const EMPTY_SCORE: FitScoreBreakdown = { total: 0, coverage: 0, cropPenalty: 0, centering: 0 };

type FrameFitState = {
  frame: FrameRecord | null;
  uploadedImage: HTMLImageElement | null;
  transform: FitTransform;
  score: FitScoreBreakdown;
  isDragging: boolean;

  setFrame: (frame: FrameRecord) => void;
  /**
   * Sets the uploaded image AND auto-fits it (center + cover) against the
   * current frame's opening. This is the "auto-center, then user adjusts
   * manually from there" behavior for first upload.
   */
  setUploadedImage: (img: HTMLImageElement) => void;
  updateTransform: (partial: Partial<FitTransform>) => void;
  setIsDragging: (dragging: boolean) => void;
  resetToAutoFit: () => void;
  clear: () => void;
};

export const useFrameFit = create<FrameFitState>((set, get) => ({
  frame: null,
  uploadedImage: null,
  transform: EMPTY_TRANSFORM,
  score: EMPTY_SCORE,
  isDragging: false,

  setFrame: (frame) => set({ frame }),

  setUploadedImage: (img) => {
    const { frame } = get();
    if (!frame) {
      // No frame selected yet — just store the image, score stays 0.
      set({ uploadedImage: img });
      return;
    }
    const transform = getAutoFitTransform(img.naturalWidth, img.naturalHeight, frame);
    const score = calculateFitScore(transform, frame);
    set({ uploadedImage: img, transform, score });
  },

  updateTransform: (partial) => {
    const { transform, frame } = get();
    const nextTransform = { ...transform, ...partial };
    const score = frame ? calculateFitScore(nextTransform, frame) : EMPTY_SCORE;
    set({ transform: nextTransform, score });
  },

  setIsDragging: (dragging) => set({ isDragging: dragging }),

  resetToAutoFit: () => {
    const { uploadedImage, frame } = get();
    if (!uploadedImage || !frame) return;
    const transform = getAutoFitTransform(uploadedImage.naturalWidth, uploadedImage.naturalHeight, frame);
    const score = calculateFitScore(transform, frame);
    set({ transform, score });
  },

  clear: () =>
    set({
      uploadedImage: null,
      transform: EMPTY_TRANSFORM,
      score: EMPTY_SCORE,
      isDragging: false,
    }),
}));
