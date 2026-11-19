"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { UploadCloud, ImageOff } from "lucide-react";
import { useFrameFit } from "@/hooks/useFrameFit";
import { cn } from "@/lib/utils";

const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB
const ACCEPTED_TYPES = { "image/png": [], "image/jpeg": [], "image/webp": [] };

export default function ImageUploader() {
  const { frame, setUploadedImage } = useFrameFit();
  const [error, setError] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      setError(null);

      if (rejections.length > 0) {
        const reason = rejections[0].errors[0]?.message ?? "File was rejected.";
        setError(reason);
        return;
      }

      const file = accepted[0];
      if (!file) return;

      setIsLoadingImage(true);
      const objectUrl = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        setUploadedImage(img);
        setIsLoadingImage(false);
        URL.revokeObjectURL(objectUrl);
      };
      img.onerror = () => {
        setError("Could not read that image file.");
        setIsLoadingImage(false);
        URL.revokeObjectURL(objectUrl);
      };
      img.src = objectUrl;
    },
    [setUploadedImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_BYTES,
    maxFiles: 1,
    disabled: !frame || isLoadingImage,
  });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-muted-foreground/50",
          (!frame || isLoadingImage) && "cursor-not-allowed opacity-60"
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">
          {isLoadingImage
            ? "Loading your photo…"
            : isDragActive
              ? "Drop your photo here"
              : "Drag & drop a photo, or click to browse"}
        </p>
        <p className="text-xs text-muted-foreground">PNG, JPG, or WebP — up to 15MB</p>
        {!frame && <p className="text-xs text-amber-600">Select a frame above first</p>}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <ImageOff className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
