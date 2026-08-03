import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdminApi } from "@/lib/admin/api";
import { listAdminFees } from "@/lib/fees/data";
import { feeQuerySchema } from "@/lib/fees/schemas";
export async function GET(request: NextRequest) { const denied = await requireAdminApi(); if (denied) return denied; try { return NextResponse.json(await listAdminFees(feeQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams)))); } catch (cause) { return apiError(cause); } }
