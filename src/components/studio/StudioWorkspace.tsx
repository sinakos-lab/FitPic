"use client";

import { useEffect, useRef, useState } from "react";
import type Konva from "konva";
import { useFrameFit } from "@/hooks/useFrameFit";
import type { FrameRecord } from "@/types/frame.types";
import dynamic from "next/dynamic";

const FrameCanvas = dynamic(() => import("./FrameCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[400px] w-full bg-muted/20 text-muted-foreground">
      Loading canvas...
    </div>
  ),
});
import ImageUploader from "./ImageUploader";
import FitControls from "./FitControls";
import FitScoreBadge from "./FitScoreBadge";
import SaveFitButton from "./SaveFitButton";

const MAX_DISPLAY_DIMENSION = 560;

function getDisplaySize(frame: FrameRecord) {
  const scale = Math.min(MAX_DISPLAY_DIMENSION / frame.width_px, MAX_DISPLAY_DIMENSION / frame.height_px, 1);
  return {
    width: Math.round(frame.width_px * scale),
    height: Math.round(frame.height_px * scale),
  };
}

export default function StudioWorkspace({ frame }: { frame: FrameRecord }) {
  const { setFrame, clear } = useFrameFit();
  const stageRef = useRef<Konva.Stage | null>(null);
  const [displaySize, setDisplaySize] = useState(() => getDisplaySize(frame));

  useEffect(() => {
    setFrame(frame);
    setDisplaySize(getDisplaySize(frame));
    return () => clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame.id]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex items-center justify-center rounded-xl bg-muted/30 p-6">
        <FrameCanvas
          frame={frame}
          displayWidth={displaySize.width}
          displayHeight={displaySize.height}
          onStageReady={(stage) => {
            stageRef.current = stage;
          }}
        />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">{frame.name}</h2>
          <p className="text-sm text-muted-foreground capitalize">
            {frame.style} · {frame.color} · {frame.difficulty}
          </p>
        </div>

        <ImageUploader />
        <FitScoreBadge />
        <FitControls />
        <SaveFitButton getStage={() => stageRef.current} />
      </div>
    </div>
  );
}
