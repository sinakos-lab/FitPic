import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

/**
 * Supabase client for use inside Server Components, Route Handlers, and Server Actions.
 * Must be created fresh per-request (reads the request's cookie store).
 *
 * NOTE: In a Server Component (not a Route Handler / Server Action), calling
 * cookies().set() will throw — that's expected. Session refresh writes happen
 * in middleware.ts instead. The try/catch below keeps Server Components safe.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore.
            // Session refresh is handled by middleware.ts on the request path.
          }
        },
      },
    }
  );
}
