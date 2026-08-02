import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { inviteSchoolUser } from "@/lib/auth/provisioning";

const input = z.object({
  ADMIN_EMAIL: z.email(),
  ADMIN_FIRST_NAME: z.string().trim().min(1).max(100),
  ADMIN_LAST_NAME: z.string().trim().min(1).max(100),
});

async function main() {
  const values = input.parse({
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_FIRST_NAME: process.env.ADMIN_FIRST_NAME,
    ADMIN_LAST_NAME: process.env.ADMIN_LAST_NAME,
  });
  const admin = createAdminClient();
  const { count, error } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  if (error) throw new Error("Unable to verify the existing administrator.");
  if ((count ?? 0) > 0) throw new Error("An administrator profile already exists.");

  await inviteSchoolUser({
    email: values.ADMIN_EMAIL,
    firstName: values.ADMIN_FIRST_NAME,
    lastName: values.ADMIN_LAST_NAME,
    role: "admin",
  });

  console.log("The initial administrator invitation was created.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Initial administrator provisioning failed.");
  process.exitCode = 1;
});
