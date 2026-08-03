import "server-only";

import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logError } from "@/lib/error-logger";

export async function requireAdminApi() {
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "active") return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  if (profile.role !== "admin") return NextResponse.json({ error: "Only administrators can manage school records." }, { status: 403 });
  return null;
}

export function apiError(error: unknown) {
  logError(error, { operation: "admin-api" });
  return NextResponse.json({ error: "The request could not be completed." }, { status: 400 });
}
