import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdminApi } from "@/lib/admin/api";
import { recordFeePayment } from "@/lib/fees/data";
import { feePaymentSchema } from "@/lib/fees/schemas";
export async function POST(request: NextRequest) { const denied = await requireAdminApi(); if (denied) return denied; try { await recordFeePayment(feePaymentSchema.parse(await request.json())); return NextResponse.json({}, { status: 201 }); } catch (cause) { return apiError(cause); } }
