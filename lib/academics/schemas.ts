import { z } from "zod";

const id = z.uuid();
const dateRange = <T extends z.ZodObject<{ startsOn: z.ZodString; endsOn: z.ZodString }>>(schema: T) => schema.refine((value) => value.endsOn > value.startsOn, { path: ["endsOn"], message: "End date must be after the start date." });

export const academicYearSchema = dateRange(z.object({ name: z.string().trim().min(1, "Academic year name is required.").max(100), startsOn: z.string().date(), endsOn: z.string().date(), status: z.enum(["planned", "current", "archived"]) }));
export const termSchema = dateRange(z.object({ academicYearId: id, name: z.string().trim().min(1, "Term name is required.").max(100), startsOn: z.string().date(), endsOn: z.string().date(), status: z.enum(["planned", "current", "closed"]) }));
export const subjectSchema = z.object({ code: z.string().trim().toUpperCase().min(2).max(20).regex(/^[A-Z0-9_-]+$/, "Use letters, numbers, hyphens, or underscores."), name: z.string().trim().min(1, "Subject name is required.").max(100), description: z.string().trim().max(1000).optional().transform((value) => value || null), isActive: z.boolean() });
export const assignmentSchema = z.object({ teacherId: id, subjectId: id, sectionId: id, academicYearId: id });
export const timetableSchema = z.object({ academicYearId: id, assignmentId: id, dayOfWeek: z.coerce.number().int().min(1).max(7), startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a valid start time."), endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a valid end time."), room: z.string().trim().max(100).optional().transform((value) => value || null) }).refine((value) => value.endTime > value.startTime, { path: ["endTime"], message: "End time must be after the start time." });
