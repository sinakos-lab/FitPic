import type Konva from "konva";

/**
 * Exports a Konva stage to a PNG data URL at a fixed pixel ratio,
 * regardless of the on-screen zoom/CSS scaling of the stage container.
 *
 * pixelRatio > 1 gives a higher-res export than the on-screen render —
 * useful since the studio canvas is often displayed smaller than the
 * frame's native resolution.
 *
 * The dashed opening-guide layer (see FrameCanvas.tsx) is a UI-only aid and
 * must not appear in the flattened export, so it's hidden for the duration
 * of the toDataURL() call and restored immediately after.
 */
export function exportStageToDataURL(stage: Konva.Stage, pixelRatio = 2): string {
  const guideLayer = stage.findOne(".opening-guide-layer");
  const wasVisible = guideLayer?.visible() ?? false;

  guideLayer?.visible(false);
  stage.batchDraw();

  const dataURL = stage.toDataURL({ mimeType: "image/png", pixelRatio, quality: 1 });

  guideLayer?.visible(wasVisible);
  stage.batchDraw();

  return dataURL;
}

/**
 * Converts a data URL (from exportStageToDataURL) into a Blob suitable
 * for upload via the Supabase Storage client or a FormData body.
 */
export function dataURLToBlob(dataURL: string): Blob {
  const [header, base64] = dataURL.split(",");
  const mimeMatch = header.match(/data:(.*?);base64/);
  const mime = mimeMatch?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

/** Rough byte-size check before upload, to fail fast on runaway exports. */
export function estimateDataURLBytes(dataURL: string): number {
  const base64 = dataURL.split(",")[1] ?? "";
  return Math.round((base64.length * 3) / 4);
}
