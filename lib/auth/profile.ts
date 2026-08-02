import "server-only";

import { cache } from "react";
import { z } from "zod";
import { roles, type AppRole } from "@/lib/constants/roles";
import { isSupabaseConfigured } from "@/lib/env/client";
import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(roles),
  first_name: z.string(),
  last_name: z.string(),
  status: z.enum(["active", "inactive"]),
});

export type CurrentProfile = z.infer<typeof profileSchema>;

export const getCurrentProfile = cache(async (): Promise<CurrentProfile | null> => {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = z.string().uuid().safeParse(claimsData?.claims.sub);
  if (claimsError || !userId.success) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, first_name, last_name, status")
    .eq("id", userId.data)
    .maybeSingle();

  if (error || !data) return null;
  return profileSchema.parse(data);
});

export function profileDisplayName(profile: Pick<CurrentProfile, "first_name" | "last_name">) {
  return `${profile.first_name} ${profile.last_name}`.trim();
}

export function isRole(profile: CurrentProfile, role: AppRole) {
  return profile.role === role;
}
