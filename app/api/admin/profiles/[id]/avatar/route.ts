import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdminApi } from "@/lib/admin/api";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({ path: z.string().min(1).max(500).refine((path) => path.split("/")[0] !== "", "Invalid profile-photo path.") });

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi(); if (denied) return denied;
  try {
    const { id } = await params; const { path } = schema.parse(await request.json());
    if (!path.startsWith(`${id}/`)) return NextResponse.json({ error: "The photo path does not match the linked profile." }, { status: 400 });
    const supabase = await createClient(); const { error } = await supabase.from("profiles").update({ avatar_path: path }).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}
