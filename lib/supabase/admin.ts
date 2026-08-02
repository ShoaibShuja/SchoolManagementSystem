import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getPublicEnvironment } from "@/lib/env/client";
import { getServerEnvironment } from "@/lib/env/server";

export function createAdminClient() {
  const publicEnvironment = getPublicEnvironment();
  const serverEnvironment = getServerEnvironment();

  return createClient(
    publicEnvironment.NEXT_PUBLIC_SUPABASE_URL,
    serverEnvironment.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
