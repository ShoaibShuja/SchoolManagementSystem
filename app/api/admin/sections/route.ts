import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdminApi } from "@/lib/admin/api";
import { createSection } from "@/lib/admin/data";
import { sectionFormSchema } from "@/lib/admin/schemas";

export async function POST(request: NextRequest) { const denied = await requireAdminApi(); if (denied) return denied; try { await createSection(sectionFormSchema.parse(await request.json())); return NextResponse.json({ ok: true }, { status: 201 }); } catch (error) { return apiError(error); } }
