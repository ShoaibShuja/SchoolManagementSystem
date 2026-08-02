import { renderToBuffer } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";
import { createElement } from "react";
import { ReportCardDocument } from "@/components/results/report-card-document";
import { getResultForReport } from "@/lib/results/data";

export async function GET(request: NextRequest, { params }: { params: Promise<{ examId: string }> }) { try { const studentId = request.nextUrl.searchParams.get("studentId"); if (!studentId) return NextResponse.json({ error: "Student is required." }, { status: 400 }); const { examId } = await params; const bundle = await getResultForReport(examId, studentId); const generatedOn = new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date()); const pdf = await renderToBuffer(createElement(ReportCardDocument, { bundle, generatedOn }) as never); const filename = `${bundle.admissionNumber}-${bundle.result.examName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()}-report-card.pdf`; return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "private, no-store" } }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Report card could not be generated." }, { status: 400 }); } }
