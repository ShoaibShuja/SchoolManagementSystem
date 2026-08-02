import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdminApi } from "@/lib/admin/api";
import { createStudent, listStudents } from "@/lib/admin/data";
import { listQuerySchema, studentFormSchema } from "@/lib/admin/schemas";

export async function GET(request: NextRequest) {
  const denied = await requireAdminApi(); if (denied) return denied;
  try { const raw = Object.fromEntries(request.nextUrl.searchParams); const values = listQuerySchema.parse(raw); return NextResponse.json(await listStudents(values)); } catch (error) { return apiError(error); }
}
export async function POST(request: NextRequest) {
  const denied = await requireAdminApi(); if (denied) return denied;
  try { const id = await createStudent(studentFormSchema.parse(await request.json())); return NextResponse.json({ id }, { status: 201 }); } catch (error) { return apiError(error); }
}
