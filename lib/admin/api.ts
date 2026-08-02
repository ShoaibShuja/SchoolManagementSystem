import "server-only";

import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/profile";

export async function requireAdminApi() {
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "active") return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  if (profile.role !== "admin") return NextResponse.json({ error: "Only administrators can manage school records." }, { status: 403 });
  return null;
}

export function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "The request could not be completed.";
  return NextResponse.json({ error: message }, { status: 400 });
}
