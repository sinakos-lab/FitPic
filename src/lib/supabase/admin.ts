import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Service-role Supabase client. Bypasses Row Level Security entirely.
 *
 * SERVER-ONLY — the `server-only` import above will throw a build error
 * if this file is ever imported from a Client Component. Use this exclusively
 * inside Route Handlers, Server Actions, or admin-only server logic
 * (e.g. verified-admin bulk operations, webhook handlers).
 *
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the client bundle.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
