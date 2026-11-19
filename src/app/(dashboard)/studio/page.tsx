import { createClient } from "@/lib/supabase/server";
import FrameSelector from "@/components/studio/FrameSelector";
import type { FrameRecord } from "@/types/frame.types";

export default async function StudioPage() {
  const supabase = await createClient();

  const { data: frames } = await supabase
    .from("frames")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .returns<FrameRecord[]>();

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Frame Fitting Studio</h1>
        <p className="text-muted-foreground">Pick a frame, upload a photo, and chase that perfect fit score.</p>
      </div>
      <FrameSelector frames={frames ?? []} />
    </div>
  );
}
