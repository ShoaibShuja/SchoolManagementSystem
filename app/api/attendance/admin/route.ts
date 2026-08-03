import { NextRequest, NextResponse } from "next/server";
import { attendanceApiError, requireAttendanceApi } from "@/lib/attendance/api";
import { getAdminAttendance, saveTeacherAttendance } from "@/lib/attendance/data";
import { attendanceQuerySchema, attendanceSaveSchema } from "@/lib/attendance/schemas";

export async function GET(request: NextRequest) { const denied = await requireAttendanceApi(["admin"]); if (denied) return denied; try { return NextResponse.json(await getAdminAttendance(attendanceQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams)))); } catch (error) { return attendanceApiError(error); } }
export async function POST(request: NextRequest) { const denied = await requireAttendanceApi(["admin"]); if (denied) return denied; try { const saved = await saveTeacherAttendance(attendanceSaveSchema.parse(await request.json())); return NextResponse.json({ saved }); } catch (error) { return attendanceApiError(error); } }
