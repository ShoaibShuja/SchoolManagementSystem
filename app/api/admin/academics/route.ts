import { NextResponse } from "next/server";
import { apiError, requireAdminApi } from "@/lib/admin/api";
import { getAcademicSetup } from "@/lib/academics/data";

export async function GET() { const denied = await requireAdminApi(); if (denied) return denied; try { return NextResponse.json(await getAcademicSetup()); } catch (error) { return apiError(error); } }
