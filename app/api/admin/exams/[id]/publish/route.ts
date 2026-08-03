import { NextResponse } from "next/server";
import { apiError, requireAdminApi } from "@/lib/admin/api";
import { publishExam } from "@/lib/results/data";
export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) { const denied = await requireAdminApi(); if (denied) return denied; try { const { id } = await params; await publishExam(id); return NextResponse.json({ ok: true }); } catch (error) { return apiError(error); } }
