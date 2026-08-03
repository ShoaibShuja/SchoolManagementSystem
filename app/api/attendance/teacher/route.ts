import { NextRequest, NextResponse } from "next/server";
import { attendanceApiError, requireAttendanceApi } from "@/lib/attendance/api";
import { saveTeacherAttendance } from "@/lib/attendance/data";
import { attendanceSaveSchema } from "@/lib/attendance/schemas";

export async function POST(request: NextRequest) { const denied = await requireAttendanceApi(["teacher"]); if (denied) return denied; try { const saved = await saveTeacherAttendance(attendanceSaveSchema.parse(await request.json())); return NextResponse.json({ saved }); } catch (error) { return attendanceApiError(error); } }
