"use client";

import { useState } from "react";
import type Konva from "konva";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useFrameFit } from "@/hooks/useFrameFit";
import { exportStageToDataURL, estimateDataURLBytes } from "@/lib/canvas/exportStage";
import { saveFit } from "@/lib/actions/saveFit";

const MAX_EXPORT_BYTES = 8 * 1024 * 1024;

type SaveFitButtonProps = {
  getStage: () => Konva.Stage | null;
};

export default function SaveFitButton({ getStage }: SaveFitButtonProps) {
  const { frame, transform, uploadedImage } = useFrameFit();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const stage = getStage();
    if (!stage || !frame || !uploadedImage) {
      toast.error("Upload a photo before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const dataURL = exportStageToDataURL(stage, 2);

      if (estimateDataURLBytes(dataURL) > MAX_EXPORT_BYTES) {
        toast.error("Exported image is too large — try a smaller photo.");
        return;
      }

      const result = await saveFit({
        frameId: frame.id,
        transform,
        exportedImageBase64: dataURL,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      if (result.badgeEarned) {
        toast.success(`Badge unlocked: ${result.badgeEarned.replace(/_/g, " ")}! +${result.pointsAwarded} pts`);
      } else {
        toast.success(`Fit saved — score ${result.fitScore}/100 (+${result.pointsAwarded} pts)`);
      }
    } catch (err) {
      toast.error("Something went wrong saving your fit. Please try again.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button onClick={handleSave} disabled={isSaving || !uploadedImage} className="w-full" size="lg">
      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      {isSaving ? "Saving…" : "Save this fit"}
    </Button>
  );
}
