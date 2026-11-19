import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FrameUploader } from "@/components/admin/FrameUploader";

export default async function AdminPage() {
  const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

      if (!user) redirect("/login");

        // Check if user is admin
          const { data: profile } = await supabase
              .from("profiles")
                  .select("role")
                      .eq("id", user.id)
                          .single();

                            if (profile?.role !== "admin") {
                                return (
                                      <div className="py-12 text-center text-destructive">
                                              <h1 className="text-2xl font-bold">Access Denied</h1>
                                                      <p>You must be an admin to view this page.</p>
                                                            </div>
                                                                );
                                                                  }

                                                                    return (
                                                                        <div className="space-y-8 max-w-2xl">
                                                                              <div>
                                                                                      <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
                                                                                              <p className="text-muted-foreground">Manage your frames and marketplace.</p>
                                                                                                    </div>
                                                                                                          
                                                                                                                <div className="rounded-xl border border-border bg-card p-6">
                                                                                                                        <h2 className="text-xl font-semibold mb-4">Upload New Frame</h2>
                                                                                                                                <FrameUploader />
                                                                                                                                      </div>
                                                                                                                                          </div>
                                                                                                                                            );
                                                                                                                                            }