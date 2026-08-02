import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { provisionInvitedProfile } from "@/lib/auth/provisioning-core";

const input = z.object({
  ADMIN_EMAIL: z.email(),
  ADMIN_FIRST_NAME: z.string().trim().min(1).max(100),
  ADMIN_LAST_NAME: z.string().trim().min(1).max(100),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.url(),
});

async function main() {
  const values = input.parse({
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_FIRST_NAME: process.env.ADMIN_FIRST_NAME,
    ADMIN_LAST_NAME: process.env.ADMIN_LAST_NAME,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });
  const admin = createClient(values.NEXT_PUBLIC_SUPABASE_URL, values.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { count, error } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  if (error) throw new Error("Unable to verify the existing administrator.");
  if ((count ?? 0) > 0) throw new Error("An administrator profile already exists.");

  await provisionInvitedProfile(admin, values.NEXT_PUBLIC_SITE_URL, {
    email: values.ADMIN_EMAIL,
    firstName: values.ADMIN_FIRST_NAME,
    lastName: values.ADMIN_LAST_NAME,
    role: "admin",
  });

  console.log("The initial administrator invitation was created.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Initial administrator provisioning failed.");
  process.exit(1);
});
