import "server-only";

import { getServerEnvironment } from "@/lib/env/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { provisionInvitedProfile, type InvitationInput } from "@/lib/auth/provisioning-core";

export type { InvitationInput };

export async function inviteSchoolUser(input: InvitationInput) {
  const environment = getServerEnvironment();
  const admin = createAdminClient();
  return provisionInvitedProfile(admin, environment.NEXT_PUBLIC_SITE_URL, input);
}
