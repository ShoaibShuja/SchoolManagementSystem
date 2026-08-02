import { z } from "zod";
import { studentStatuses, teacherStatuses } from "@/lib/admin/types";

const id = z.uuid();
const optionalText = (max: number) => z.string().trim().max(max).optional().transform((value) => value || null);
const optionalEmail = z.union([z.email(), z.literal("")]).transform((value) => value || null);

export const studentFormSchema = z.object({
  admissionNumber: z.string().trim().min(1, "Admission number is required.").max(50),
  firstName: z.string().trim().min(1, "First name is required.").max(100),
  lastName: z.string().trim().min(1, "Last name is required.").max(100),
  dateOfBirth: z.string().date().optional().or(z.literal("")).transform((value) => value || null),
  enrolledOn: z.string().date("Enrollment date is required."),
  status: z.enum(studentStatuses),
  academicYearId: id.optional().or(z.literal("")).transform((value) => value || null),
  sectionId: id.optional().or(z.literal("")).transform((value) => value || null),
  guardianFirstName: z.string().trim().min(1, "Guardian first name is required.").max(100),
  guardianLastName: z.string().trim().min(1, "Guardian last name is required.").max(100),
  guardianPhone: optionalText(50),
  guardianEmail: optionalEmail,
  guardianRelationship: z.string().trim().min(1, "Relationship is required.").max(50),
}).superRefine((values, context) => {
  if (Boolean(values.academicYearId) !== Boolean(values.sectionId)) {
    context.addIssue({ code: "custom", message: "Choose both an academic year and section, or leave both blank.", path: ["sectionId"] });
  }
});

export const teacherFormSchema = z.object({
  employeeNumber: z.string().trim().min(1, "Employee number is required.").max(50),
  firstName: z.string().trim().min(1, "First name is required.").max(100),
  lastName: z.string().trim().min(1, "Last name is required.").max(100),
  phone: optionalText(50),
  email: optionalEmail,
  qualification: optionalText(500),
  employmentStartedOn: z.string().date("Employment start date is required."),
  employmentEndedOn: z.string().date().optional().or(z.literal("")).transform((value) => value || null),
  status: z.enum(teacherStatuses),
}).refine((values) => !values.employmentEndedOn || values.employmentEndedOn >= values.employmentStartedOn, {
  message: "Employment end date cannot be before the start date.", path: ["employmentEndedOn"],
});

export const classFormSchema = z.object({ name: z.string().trim().min(1).max(100), displayOrder: z.coerce.number().int().min(1).max(32767) });
export const sectionFormSchema = z.object({ classId: id, name: z.string().trim().min(1).max(50), capacity: z.coerce.number().int().min(1).max(500) });
export const statusChangeSchema = z.object({ status: z.enum(studentStatuses) });
export const accountLinkSchema = z.object({ email: z.email(), role: z.enum(["student", "teacher", "parent"]), entityId: id, firstName: z.string().trim().min(1).max(100), lastName: z.string().trim().min(1).max(100) });
export const listQuerySchema = z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(5).max(50).default(15), query: z.string().trim().max(100).default(""), status: z.string().trim().max(20).default(""), sectionId: z.string().uuid().optional(), academicYearId: z.string().uuid().optional() });
