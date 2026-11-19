"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useFrameFit } from "@/hooks/useFrameFit";
import { cn } from "@/lib/utils";

const PERFECT_FIT_THRESHOLD = 95;
const CIRCUMFERENCE = 2 * Math.PI * 28; // matches r=28 below

function scoreColor(score: number): string {
  if (score >= PERFECT_FIT_THRESHOLD) return "stroke-emerald-500";
  if (score >= 70) return "stroke-amber-500";
  return "stroke-rose-500";
}

export default function FitScoreBadge() {
  const { score, uploadedImage } = useFrameFit();
  const [justHitPerfect, setJustHitPerfect] = useState(false);
  const wasPerfect = useRef(false);

  useEffect(() => {
    const isPerfect = score.total >= PERFECT_FIT_THRESHOLD;
    if (isPerfect && !wasPerfect.current) {
      setJustHitPerfect(true);
      const timeout = setTimeout(() => setJustHitPerfect(false), 900);
      wasPerfect.current = true;
      return () => clearTimeout(timeout);
    }
    if (!isPerfect) wasPerfect.current = false;
  }, [score.total]);

  if (!uploadedImage) return null;

  const offset = CIRCUMFERENCE - (score.total / 100) * CIRCUMFERENCE;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
      <div className={cn("relative h-16 w-16 shrink-0", justHitPerfect && "animate-badge-pop")}>
        <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
          <circle cx="32" cy="32" r="28" className="stroke-muted" strokeWidth="6" fill="none" />
          <circle
            cx="32"
            cy="32"
            r="28"
            className={cn(scoreColor(score.total), "transition-all duration-200")}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
          {score.total}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 text-sm font-medium">
          {score.total >= PERFECT_FIT_THRESHOLD ? (
            <>
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span className="text-emerald-600">Perfect fit!</span>
            </>
          ) : score.total >= 70 ? (
            <span className="text-amber-600">Looking good</span>
          ) : (
            <span className="text-rose-600">Keep adjusting</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Coverage {Math.round(score.coverage)}% · Centering {Math.round(score.centering)}%
        </p>
      </div>
    </div>
  );
}
