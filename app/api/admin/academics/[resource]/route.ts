import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdminApi } from "@/lib/admin/api";
import { createAcademicYear, createAssignment, createSubject, createTerm, createTimetableEntry } from "@/lib/academics/data";
import { academicYearSchema, assignmentSchema, subjectSchema, termSchema, timetableSchema } from "@/lib/academics/schemas";

export async function POST(request: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const denied = await requireAdminApi(); if (denied) return denied;
  try { const { resource } = await params; const body = await request.json(); if (resource === "years") await createAcademicYear(academicYearSchema.parse(body)); else if (resource === "terms") await createTerm(termSchema.parse(body)); else if (resource === "subjects") await createSubject(subjectSchema.parse(body)); else if (resource === "assignments") await createAssignment(assignmentSchema.parse(body)); else if (resource === "timetable") await createTimetableEntry(timetableSchema.parse(body)); else return NextResponse.json({ error: "Unknown academic resource." }, { status: 404 }); return NextResponse.json({ ok: true }, { status: 201 }); } catch (error) { return apiError(error); }
}
