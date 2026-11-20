"use server";

import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { calculateFitScore } from "@/lib/gamification/scoring";
import { determineBadgeAward, isIntentionalOffCenter, BADGE_POINTS } from "@/lib/gamification/badges";
import type { SaveFitPayload, SaveFitResult, FrameRecord } from "@/types/frame.types";

const MAX_EXPORT_BYTES = 8 * 1024 * 1024;

function dataURLToUint8Array(dataURL: string): { bytes: Uint8Array; mime: string } {
  const [header, base64] = dataURL.split(",");
    const mimeMatch = header.match(/data:(.*?);base64/);
      const mime = mimeMatch?.[1] ?? "image/png";
        const binary = Buffer.from(base64, "base64");
          return { bytes: new Uint8Array(binary), mime };
          }

          export async function saveFit(payload: SaveFitPayload): Promise<SaveFitResult> {
            const supabase = await createClient();

              const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    return { success: false, error: "You must be signed in to save a fit." };
                      }

                        const { data: frame, error: frameError } = await supabase
                            .from("frames")
                                .select("*")
                                    .eq("id", payload.frameId)
                                        .eq("is_active", true)
                                            .single<FrameRecord>();

                                              if (frameError || !frame) {
                                                  return { success: false, error: "Frame not found or no longer active." };
                                                    }

                                                      const scoreBreakdown = calculateFitScore(payload.transform, frame);

                                                        const { bytes, mime } = dataURLToUint8Array(payload.exportedImageBase64);
                                                          if (bytes.byteLength === 0) {
                                                              return { success: false, error: "Exported image was empty." };
                                                                }
                                                                  if (bytes.byteLength > MAX_EXPORT_BYTES) {
                                                                      return { success: false, error: "Exported image is too large." };
                                                                        }
                                                                          if (mime !== "image/png") {
                                                                              return { success: false, error: "Exported image must be a PNG." };
                                                                                }

                                                                                  const savedFrameId = randomUUID();
                                                                                    const storagePath = `${user.id}/${savedFrameId}/export.png`;

                                                                                      const { error: uploadError } = await supabase.storage
                                                                                          .from("frame-uploads")
                                                                                              .upload(storagePath, bytes, { contentType: "image/png", upsert: false });

                                                                                                if (uploadError) {
                                                                                                    return { success: false, error: `Upload failed: ${uploadError.message}` };
                                                                                                      }

                                                                                                        const { data: { publicUrl: exportedImageUrl } } = supabase.storage.from("frame-uploads").getPublicUrl(storagePath);

                                                                                                          const { data: priorFits } = await supabase
                                                                                                              .from("user_saved_frames")
                                                                                                                  .select("frame_id")
                                                                                                                      .eq("user_id", user.id);

                                                                                                                        const previousFrameIds = (priorFits ?? []).map((f: any) => f.frame_id);
                                                                                                                          const isFirstFitEver = previousFrameIds.length === 0;
                                                                                                                            const wasIntentionallyOffCenter = isIntentionalOffCenter(
                                                                                                                                scoreBreakdown.coverage,
                                                                                                                                    scoreBreakdown.centering
                                                                                                                                      );

                                                                                                                                        const badgeEarned = determineBadgeAward({
                                                                                                                                            fitScore: scoreBreakdown.total,
                                                                                                                                                frameId: payload.frameId,
                                                                                                                                                    previousFrameIds,
                                                                                                                                                        wasIntentionallyOffCenter,
                                                                                                                                                            isFirstFitEver,
                                                                                                                                                              });

                                                                                                                                                                const pointsAwarded = badgeEarned ? BADGE_POINTS[badgeEarned] : Math.round(scoreBreakdown.total / 10);

                                                                                                                                                                  const { error: insertError } = await supabase.from("user_saved_frames").insert<any>({
                                                                                                                                                                      id: savedFrameId,
                                                                                                                                                                          user_id: user.id,
                                                                                                                                                                              frame_id: payload.frameId,
                                                                                                                                                                                  uploaded_image_url: exportedImageUrl,
                                                                                                                                                                                      exported_image_url: exportedImageUrl,
                                                                                                                                                                                          fit_transform: payload.transform,
                                                                                                                                                                                              fit_score: scoreBreakdown.total,
                                                                                                                                                                                                  badge_earned: badgeEarned,
                                                                                                                                                                                                    });

                                                                                                                                                                                                      if (insertError) {
                                                                                                                                                                                                          return { success: false, error: `Could not save fit: ${insertError.message}` };
                                                                                                                                                                                                            }

                                                                                                                                                                                                              if (pointsAwarded > 0) {
                                                                                                                                                                                                                  await supabase.rpc("increment_user_points", {
                                                                                                                                                                                                                        p_user_id: user.id,
                                                                                                                                                                                                                              p_points: pointsAwarded,
                                                                                                                                                                                                                                  });
                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                      return {
                                                                                                                                                                                                                                          success: true,
                                                                                                                                                                                                                                              savedFrameId,
                                                                                                                                                                                                                                                  fitScore: scoreBreakdown.total,
                                                                                                                                                                                                                                                      badgeEarned,
                                                                                                                                                                                                                                                          pointsAwarded,
                                                                                                                                                                                                                                                            };
                                                                                                                                                                                                                                                            }