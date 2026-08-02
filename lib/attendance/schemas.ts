import { z } from "zod";
import { attendanceStatuses } from "@/lib/attendance/types";

export const attendanceSaveSchema = z.object({ sectionId: z.uuid(), academicYearId: z.uuid(), date: z.string().date(), records: z.array(z.object({ studentId: z.uuid(), status: z.enum(attendanceStatuses), remarks: z.string().trim().max(500).optional().default("") })).min(1) });
export const attendanceQuerySchema = z.object({ date: z.string().date().optional(), sectionId: z.uuid().optional(), studentId: z.uuid().optional(), status: z.enum(attendanceStatuses).optional(), academicYearId: z.uuid().optional() });
