import { NextResponse } from "next/server";
import { attendanceApiError, requireAttendanceApi } from "@/lib/attendance/api";
import { getTeacherSections } from "@/lib/attendance/data";

export async function GET() { const denied = await requireAttendanceApi(["teacher"]); if (denied) return denied; try { return NextResponse.json(await getTeacherSections()); } catch (error) { return attendanceApiError(error); } }
