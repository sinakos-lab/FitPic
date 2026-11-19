import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { FrameRecord } from "@/types/frame.types";

const DIFFICULTY_VARIANT: Record<string, "secondary" | "default" | "destructive"> = {
  easy: "secondary",
  medium: "default",
  hard: "destructive",
};

export default function FrameSelector({ frames }: { frames: FrameRecord[] }) {
  if (frames.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 p-12 text-center text-sm text-muted-foreground">
        No frames available yet — check back soon.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {frames.map((frame) => (
        <Link
          key={frame.id}
          href={`/studio/${frame.id}`}
          className="group overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
        >
          <div className="relative aspect-square bg-muted">
            <Image
              src={frame.thumbnail_url}
              alt={frame.name}
              fill
              className="object-contain p-4 transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
          <div className="space-y-1 p-3">
            <p className="truncate text-sm font-medium">{frame.name}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs capitalize text-muted-foreground">{frame.style}</span>
              <Badge variant={DIFFICULTY_VARIANT[frame.difficulty]} className="text-xs capitalize">
                {frame.difficulty}
              </Badge>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
