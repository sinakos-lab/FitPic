import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/layout/DashboardNav";

export default async function DashboardLayout({
  children,
  }: {
    children: React.ReactNode;
    }) {
      const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
              redirect("/login");
                }

                  // Fetch the user's role from the profiles table
                    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single<{ role: string }>();

                                      const isAdmin = profile?.role === "admin";

                                        return (
                                            <div className="min-h-screen bg-background">
                                                  <DashboardNav isAdmin={isAdmin} />
                                                        <main className="container py-8">
                                                                {children}
                                                                      </main>
                                                                          </div>
                                                                            );
                                                                            }