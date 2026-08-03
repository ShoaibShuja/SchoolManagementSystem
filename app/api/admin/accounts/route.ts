import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdminApi } from "@/lib/admin/api";
import { linkSchoolRecordAccount } from "@/lib/admin/accounts";
import { accountLinkSchema } from "@/lib/admin/schemas";
import { enforceRateLimit } from "@/lib/api/route-security";

export async function POST(request: NextRequest) { const denied = await requireAdminApi(); if (denied) return denied; const limited = enforceRateLimit(request, "account-invitation", 10, 60 * 60_000); if (limited) return limited; try { await linkSchoolRecordAccount(accountLinkSchema.parse(await request.json())); return NextResponse.json({ ok: true }); } catch (error) { return apiError(error); } }
