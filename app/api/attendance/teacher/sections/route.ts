import { NextResponse } from "next/server";
import { requireAttendanceApi } from "@/lib/attendance/api";
import { getTeacherSections } from "@/lib/attendance/data";

export async function GET() { const denied = await requireAttendanceApi(["teacher"]); if (denied) return denied; try { return NextResponse.json(await getTeacherSections()); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Sections could not be loaded." }, { status: 400 }); } }
