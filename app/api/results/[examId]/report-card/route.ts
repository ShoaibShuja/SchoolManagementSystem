import { renderToBuffer } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";
import { createElement } from "react";
import { ReportCardDocument } from "@/components/results/report-card-document";
import { getResultForReport } from "@/lib/results/data";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/api/route-security";

export const maxDuration = 10;

const paramsSchema = z.object({ examId: z.uuid(), studentId: z.uuid() });

export async function GET(request: NextRequest, { params }: { params: Promise<{ examId: string }> }) { const limited = enforceRateLimit(request, "report-card", 15, 60_000); if (limited) return limited; try { const { examId } = await params; const values = paramsSchema.parse({ examId, studentId: request.nextUrl.searchParams.get("studentId") }); const bundle = await getResultForReport(values.examId, values.studentId); const generatedOn = new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date()); const pdf = await renderToBuffer(createElement(ReportCardDocument, { bundle, generatedOn }) as never); const filename = `${bundle.admissionNumber}-${bundle.result.examName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()}-report-card.pdf`; return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } }); } catch { return NextResponse.json({ error: "The report card could not be generated." }, { status: 400 }); } }
