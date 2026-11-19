import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudioWorkspace from "@/components/studio/StudioWorkspace";
import type { FrameRecord } from "@/types/frame.types";

export default async function FrameWorkspacePage({
  params,
}: {
  params: Promise<{ frameId: string }>;
}) {
  const { frameId } = await params;
  const supabase = await createClient();

  const { data: frame } = await supabase
    .from("frames")
    .select("*")
    .eq("id", frameId)
    .eq("is_active", true)
    .single<FrameRecord>();

  if (!frame) {
    notFound();
  }

  return (
    <div className="container py-8">
      <StudioWorkspace frame={frame} />
    </div>
  );
}
