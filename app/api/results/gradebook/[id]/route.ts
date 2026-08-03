import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { getTeacherGradebook, saveTeacherGrades } from "@/lib/results/data";
import { gradeSaveSchema } from "@/lib/results/schemas";
import { safeRouteError } from "@/lib/api/route-security";
function denied() { return NextResponse.json({ error: "Only active teachers can access this gradebook." }, { status: 403 }); }
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) { const profile = await getCurrentProfile(); if (!profile || profile.status !== "active") return NextResponse.json({ error: "Authentication is required." }, { status: 401 }); if (profile.role !== "teacher") return denied(); try { const { id } = await params; return NextResponse.json(await getTeacherGradebook(id)); } catch (error) { return safeRouteError(error, "gradebook-read"); } }
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { const profile = await getCurrentProfile(); if (!profile || profile.status !== "active") return NextResponse.json({ error: "Authentication is required." }, { status: 401 }); if (profile.role !== "teacher") return denied(); try { const { id } = await params; await saveTeacherGrades(id, gradeSaveSchema.parse(await request.json())); return NextResponse.json({ ok: true }); } catch (error) { return safeRouteError(error, "gradebook-write"); } }
