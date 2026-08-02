import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdminApi } from "@/lib/admin/api";
import { deleteClass, updateClass } from "@/lib/admin/data";
import { classFormSchema } from "@/lib/admin/schemas";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { const denied = await requireAdminApi(); if (denied) return denied; try { const { id } = await params; await updateClass(id, classFormSchema.parse(await request.json())); return NextResponse.json({ ok: true }); } catch (error) { return apiError(error); } }
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) { const denied = await requireAdminApi(); if (denied) return denied; try { const { id } = await params; await deleteClass(id); return NextResponse.json({ ok: true }); } catch (error) { return apiError(error); } }
