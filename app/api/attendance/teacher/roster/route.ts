import { NextRequest, NextResponse } from "next/server";
import { requireAttendanceApi } from "@/lib/attendance/api";
import { getTeacherRoster } from "@/lib/attendance/data";
import { z } from "zod";

const schema = z.object({ sectionId: z.uuid(), academicYearId: z.uuid(), date: z.string().date() });
export async function GET(request: NextRequest) { const denied = await requireAttendanceApi(["teacher"]); if (denied) return denied; try { const values = schema.parse(Object.fromEntries(request.nextUrl.searchParams)); return NextResponse.json(await getTeacherRoster(values.sectionId, values.academicYearId, values.date)); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Roster could not be loaded." }, { status: 400 }); } }
