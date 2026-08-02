import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdminApi } from "@/lib/admin/api";
import { getTeacher, updateTeacher } from "@/lib/admin/data";
import { teacherFormSchema } from "@/lib/admin/schemas";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) { const denied = await requireAdminApi(); if (denied) return denied; try { const { id } = await params; const teacher = await getTeacher(id); return teacher ? NextResponse.json(teacher) : NextResponse.json({ error: "Teacher not found." }, { status: 404 }); } catch (error) { return apiError(error); } }
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { const denied = await requireAdminApi(); if (denied) return denied; try { const { id } = await params; await updateTeacher(id, teacherFormSchema.parse(await request.json())); return NextResponse.json({ ok: true }); } catch (error) { return apiError(error); } }
