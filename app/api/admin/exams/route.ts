import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdminApi } from "@/lib/admin/api";
import { createExam, getExamSetup } from "@/lib/results/data";
import { examSchema } from "@/lib/results/schemas";
export async function GET() { const denied = await requireAdminApi(); if (denied) return denied; try { return NextResponse.json(await getExamSetup()); } catch (error) { return apiError(error); } }
export async function POST(request: NextRequest) { const denied = await requireAdminApi(); if (denied) return denied; try { await createExam(examSchema.parse(await request.json())); return NextResponse.json({ ok: true }, { status: 201 }); } catch (error) { return apiError(error); } }
