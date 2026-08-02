import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdminApi } from "@/lib/admin/api";
import { createClass, listClasses } from "@/lib/admin/data";
import { classFormSchema } from "@/lib/admin/schemas";

export async function GET(request: NextRequest) { const denied = await requireAdminApi(); if (denied) return denied; try { return NextResponse.json(await listClasses(request.nextUrl.searchParams.get("academicYearId") ?? undefined)); } catch (error) { return apiError(error); } }
export async function POST(request: NextRequest) { const denied = await requireAdminApi(); if (denied) return denied; try { await createClass(classFormSchema.parse(await request.json())); return NextResponse.json({ ok: true }, { status: 201 }); } catch (error) { return apiError(error); } }
