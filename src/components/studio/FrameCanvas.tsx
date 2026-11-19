"use client";

import { useRef, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Transformer } from "react-konva";
import type Konva from "konva";
import useImage from "use-image";
import { useFrameFit } from "@/hooks/useFrameFit";
import type { FrameRecord } from "@/types/frame.types";

type FrameCanvasProps = {
  frame: FrameRecord;
  /** Display size the stage renders at — the frame's native px dims are often too large for screen. */
  displayWidth: number;
  displayHeight: number;
  /** Exposes the Konva Stage instance up to the parent for export-on-save. */
  onStageReady?: (stage: Konva.Stage) => void;
};

export default function FrameCanvas({ frame, displayWidth, displayHeight, onStageReady }: FrameCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const photoRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const { uploadedImage, transform, updateTransform, setIsDragging } = useFrameFit();
  const [frameImage] = useImage(frame.image_url, "anonymous");

  // Scale factor between the frame's native px space (what fit_transform is
  // stored in) and the on-screen display size.
  const displayScale = displayWidth / frame.width_px;

  useEffect(() => {
    if (stageRef.current && onStageReady) {
      onStageReady(stageRef.current);
    }
  }, [onStageReady]);

  // Attach the Transformer to the photo node once both exist.
  useEffect(() => {
    if (transformerRef.current && photoRef.current) {
      transformerRef.current.nodes([photoRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [uploadedImage]);

  if (!uploadedImage) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 text-sm text-muted-foreground"
        style={{ width: displayWidth, height: displayHeight }}
      >
        Upload a photo to begin fitting
      </div>
    );
  }

  return (
    <Stage
      ref={stageRef}
      width={displayWidth}
      height={displayHeight}
      scaleX={displayScale}
      scaleY={displayScale}
      className="rounded-lg border border-border bg-neutral-100 shadow-sm"
    >
      {/* Layer 1: the user's photo, sits BELOW the frame so the frame's
          transparent opening reveals it. */}
      <Layer>
        <KonvaImage
          ref={photoRef}
          image={uploadedImage}
          x={transform.x}
          y={transform.y}
          scaleX={transform.scaleX}
          scaleY={transform.scaleY}
          rotation={transform.rotation}
          draggable
          onDragStart={() => setIsDragging(true)}
          onDragEnd={(e) => {
            setIsDragging(false);
            updateTransform({ x: e.target.x(), y: e.target.y() });
          }}
          onTransformEnd={(e) => {
            const node = e.target;
            updateTransform({
              x: node.x(),
              y: node.y(),
              scaleX: node.scaleX(),
              scaleY: node.scaleY(),
              rotation: node.rotation(),
            });
          }}
        />
        <Transformer
          ref={transformerRef}
          rotateEnabled
          keepRatio={false}
          boundBoxFunc={(oldBox, newBox) => {
            // Prevent scaling to zero/negative size.
            if (newBox.width < 20 || newBox.height < 20) return oldBox;
            return newBox;
          }}
        />
      </Layer>

      {/* Layer 2: opening guide (dashed rect), visible while adjusting,
          purely a visual aid — hidden before export, see exportStage.ts. */}
      <Layer listening={false} name="opening-guide-layer">
        <Rect
          x={frame.inner_x}
          y={frame.inner_y}
          width={frame.inner_width}
          height={frame.inner_height}
          stroke="#6366f1"
          strokeWidth={2 / displayScale}
          dash={[10 / displayScale, 6 / displayScale]}
          opacity={0.6}
        />
      </Layer>

      {/* Layer 3: the frame overlay PNG on top, with its transparent hole
          revealing the photo layer beneath. */}
      <Layer listening={false}>
        {frameImage && (
          <KonvaImage image={frameImage} x={0} y={0} width={frame.width_px} height={frame.height_px} />
        )}
      </Layer>
    </Stage>
  );
}
