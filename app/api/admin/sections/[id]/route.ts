import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdminApi } from "@/lib/admin/api";
import { deleteSection, updateSection } from "@/lib/admin/data";
import { sectionFormSchema } from "@/lib/admin/schemas";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { const denied = await requireAdminApi(); if (denied) return denied; try { const { id } = await params; await updateSection(id, sectionFormSchema.parse(await request.json())); return NextResponse.json({ ok: true }); } catch (error) { return apiError(error); } }
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) { const denied = await requireAdminApi(); if (denied) return denied; try { const { id } = await params; await deleteSection(id); return NextResponse.json({ ok: true }); } catch (error) { return apiError(error); } }
