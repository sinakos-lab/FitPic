"use client";

import { RotateCcw, RotateCw, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useFrameFit } from "@/hooks/useFrameFit";

const MIN_SCALE = 0.1;
const MAX_SCALE = 5;
const ZOOM_STEP = 0.1;
const ROTATE_STEP = 15; // degrees

export default function FitControls() {
  const { transform, updateTransform, resetToAutoFit, uploadedImage } = useFrameFit();

  const avgScale = (transform.scaleX + transform.scaleY) / 2;

  const setUniformScale = (newScale: number) => {
    updateTransform({ scaleX: newScale, scaleY: newScale });
  };

  const rotate = (deltaDegrees: number) => {
    updateTransform({ rotation: (transform.rotation + deltaDegrees) % 360 });
  };

  const disabled = !uploadedImage;

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div>
        <div className="mb-2 flex items-center justify-between text-sm font-medium">
          <span>Zoom</span>
          <span className="text-muted-foreground">{Math.round(avgScale * 100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={disabled}
            onClick={() => setUniformScale(Math.max(MIN_SCALE, avgScale - ZOOM_STEP))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Slider
            value={[avgScale]}
            min={MIN_SCALE}
            max={MAX_SCALE}
            step={0.01}
            disabled={disabled}
            onValueChange={([val]) => setUniformScale(val)}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="icon"
            disabled={disabled}
            onClick={() => setUniformScale(Math.min(MAX_SCALE, avgScale + ZOOM_STEP))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-medium">Rotate</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={disabled} onClick={() => rotate(-ROTATE_STEP)}>
            <RotateCcw className="mr-1 h-4 w-4" />
            {ROTATE_STEP}°
          </Button>
          <Button variant="outline" size="sm" disabled={disabled} onClick={() => rotate(ROTATE_STEP)}>
            <RotateCw className="mr-1 h-4 w-4" />
            {ROTATE_STEP}°
          </Button>
          <span className="ml-auto text-sm text-muted-foreground">{Math.round(transform.rotation)}°</span>
        </div>
      </div>

      <Button variant="secondary" size="sm" disabled={disabled} onClick={resetToAutoFit} className="w-full">
        <RefreshCw className="mr-2 h-4 w-4" />
        Reset to auto-fit
      </Button>
    </div>
  );
}
