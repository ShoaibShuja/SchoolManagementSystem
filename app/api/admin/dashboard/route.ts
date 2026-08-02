import { NextResponse } from "next/server";
import { apiError, requireAdminApi } from "@/lib/admin/api";
import { getAdminDashboard } from "@/lib/admin/data";

export async function GET() { const denied = await requireAdminApi(); if (denied) return denied; try { return NextResponse.json(await getAdminDashboard()); } catch (error) { return apiError(error); } }
