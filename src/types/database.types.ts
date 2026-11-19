/**
 * PLACEHOLDER — replace by running:
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
 *
 * after `supabase db push` has applied 0001_init_schema.sql.
 * Keeping a minimal shape here so imports don't break before that's run.
 */
export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
