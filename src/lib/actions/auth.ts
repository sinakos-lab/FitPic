"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function continueAsGuest() {
  const supabase = await createClient();

    // Sign in anonymously. Supabase creates a silent user behind the scenes.
      const { error } = await supabase.auth.signInAnonymously();

        if (error) {
            console.error("Guest login failed:", error.message);
                // If it fails, send them to the standard login
                    redirect("/login");
                      }

                        // If successful, send them straight to the Studio
                          redirect("/studio");
                          }