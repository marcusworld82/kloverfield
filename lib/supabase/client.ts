// Supabase browser/client-side client (Section 4.4).
// Returns null in mock mode (no env vars) so the UI can fall back to demo data.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const isSupabaseMockMode = () =>
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let browserClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (isSupabaseMockMode()) return null;
  if (!browserClient) {
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return browserClient;
}
