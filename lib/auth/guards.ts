import "server-only";

import { redirect } from "next/navigation";
import type { AppRole } from "@/lib/constants/roles";
import { getCurrentProfile, type CurrentProfile } from "@/lib/auth/profile";
import { isSupabaseConfigured } from "@/lib/env/client";

export async function requireCurrentProfile(): Promise<CurrentProfile> {
  if (!isSupabaseConfigured()) redirect("/login");

  const profile = await getCurrentProfile();
  if (!profile) redirect("/unauthorized");
  if (profile.status !== "active") redirect("/unauthorized");

  return profile;
}

export async function requireRole(role: AppRole) {
  const profile = await requireCurrentProfile();
  if (profile.role !== role) redirect("/unauthorized");
  return profile;
}
