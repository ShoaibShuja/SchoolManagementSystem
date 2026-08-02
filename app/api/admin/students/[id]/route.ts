import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdminApi } from "@/lib/admin/api";
import { changeStudentStatus, getStudent, updateStudent } from "@/lib/admin/data";
import { statusChangeSchema, studentFormSchema } from "@/lib/admin/schemas";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) { const denied = await requireAdminApi(); if (denied) return denied; try { const { id } = await params; const student = await getStudent(id); return student ? NextResponse.json(student) : NextResponse.json({ error: "Student not found." }, { status: 404 }); } catch (error) { return apiError(error); } }
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { const denied = await requireAdminApi(); if (denied) return denied; try { const { id } = await params; await updateStudent(id, studentFormSchema.parse(await request.json())); return NextResponse.json({ ok: true }); } catch (error) { return apiError(error); } }
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { const denied = await requireAdminApi(); if (denied) return denied; try { const { id } = await params; const { status } = statusChangeSchema.parse(await request.json()); await changeStudentStatus(id, status); return NextResponse.json({ ok: true }); } catch (error) { return apiError(error); } }
