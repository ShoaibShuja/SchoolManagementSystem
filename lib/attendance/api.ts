import "server-only";

import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/profile";

export async function requireAttendanceApi(roles: readonly string[]) {
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "active") return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  if (!roles.includes(profile.role)) return NextResponse.json({ error: "Your account cannot access this attendance action." }, { status: 403 });
  return null;
}
