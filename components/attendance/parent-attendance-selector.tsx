"use client";

import { useState } from "react";
import { PersonalAttendanceView } from "@/components/attendance/personal-attendance";
import type { ParentChildAttendance } from "@/lib/attendance/types";

export function ParentAttendanceSelector({ linkedChildren }: { linkedChildren: ParentChildAttendance[] }) { const [studentId, setStudentId] = useState(linkedChildren[0]?.studentId ?? ""); const child = linkedChildren.find((item) => item.studentId === studentId); if (!child) return null; return <section className="space-y-4"><label className="grid max-w-sm gap-2 text-sm font-medium">Child<select value={studentId} onChange={(event) => setStudentId(event.target.value)} className="h-10 rounded-md border bg-card px-3 text-sm">{linkedChildren.map((item) => <option key={item.studentId} value={item.studentId}>{item.studentName}{item.section ? ` · ${item.section}` : ""}</option>)}</select></label><PersonalAttendanceView attendance={child} /></section>; }
