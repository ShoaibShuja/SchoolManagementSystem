import "server-only";

import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/env/client";
import { createClient } from "@/lib/supabase/server";

export const getOptionalUser = cache(async () => {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims.sub) return null;
  return data.claims;
});
