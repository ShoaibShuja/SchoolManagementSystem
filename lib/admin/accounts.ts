import "server-only";

import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getServerEnvironment } from "@/lib/env/server";
import { provisionInvitedProfile } from "@/lib/auth/provisioning-core";
import type { z } from "zod";
import type { accountLinkSchema } from "@/lib/admin/schemas";
import { AdminRecordError } from "@/lib/admin/data";

type AccountLinkInput = z.infer<typeof accountLinkSchema>;

export async function linkSchoolRecordAccount(input: AccountLinkInput) {
  await requireRole("admin");
  const admin = createAdminClient();
  const siteUrl = getServerEnvironment().NEXT_PUBLIC_SITE_URL;
  const profileId = await provisionInvitedProfile(admin, siteUrl, { email: input.email, firstName: input.firstName, lastName: input.lastName, role: input.role });
  const supabase = await createClient();
  const table = input.role === "student" ? "students" : input.role === "teacher" ? "teachers" : "parents";
  const { data: linkedRecord, error } = await supabase.from(table).update({ profile_id: profileId }).eq("id", input.entityId).is("profile_id", null).select("id").maybeSingle();
  if (error || !linkedRecord) {
    await admin.from("profiles").delete().eq("id", profileId);
    await admin.auth.admin.deleteUser(profileId);
    throw new AdminRecordError("The account invitation was cancelled because the school record could not be linked.");
  }
}
