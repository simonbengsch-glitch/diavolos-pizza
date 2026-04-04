import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-seitiger Client mit erhöhten Rechten (nur in API Routes verwenden!)
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
