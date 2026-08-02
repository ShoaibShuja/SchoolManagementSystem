import { NextResponse } from "next/server";
import { apiError, requireAdminApi } from "@/lib/admin/api";
import { getAcademicYears, getSectionOptions } from "@/lib/admin/data";

export async function GET() {
  const denied = await requireAdminApi(); if (denied) return denied;
  try { const [academicYears, sections] = await Promise.all([getAcademicYears(), getSectionOptions()]); return NextResponse.json({ academicYears, sections }); }
  catch (error) { return apiError(error); }
}
