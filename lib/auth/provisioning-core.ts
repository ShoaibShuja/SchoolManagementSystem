import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { roles } from "@/lib/constants/roles";

export const invitationSchema = z.object({
  email: z.email(),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  role: z.enum(roles),
});

export type InvitationInput = z.infer<typeof invitationSchema>;

export async function provisionInvitedProfile(admin: SupabaseClient, siteUrl: string, input: InvitationInput) {
  const values = invitationSchema.parse(input);
  const { data: invitation, error: invitationError } = await admin.auth.admin.inviteUserByEmail(values.email, {
    redirectTo: `${siteUrl}/auth/callback`,
  });

  if (invitationError || !invitation.user) throw new Error("Unable to create the user invitation.");

  const { error: profileError } = await admin.from("profiles").upsert({
    id: invitation.user.id,
    role: values.role,
    first_name: values.firstName,
    last_name: values.lastName,
    status: "active",
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(invitation.user.id);
    throw new Error("Unable to provision the user profile.");
  }

  return invitation.user.id;
}
