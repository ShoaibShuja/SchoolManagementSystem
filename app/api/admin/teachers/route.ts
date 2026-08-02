import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdminApi } from "@/lib/admin/api";
import { createTeacher, listTeachers } from "@/lib/admin/data";
import { listQuerySchema, teacherFormSchema } from "@/lib/admin/schemas";

export async function GET(request: NextRequest) { const denied = await requireAdminApi(); if (denied) return denied; try { return NextResponse.json(await listTeachers(listQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams)))); } catch (error) { return apiError(error); } }
export async function POST(request: NextRequest) { const denied = await requireAdminApi(); if (denied) return denied; try { const id = await createTeacher(teacherFormSchema.parse(await request.json())); return NextResponse.json({ id }, { status: 201 }); } catch (error) { return apiError(error); } }
