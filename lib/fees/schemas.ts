import { z } from "zod";

const id = z.uuid();
const text = (max: number) => z.string().trim().max(max).optional().transform((value) => value || "");
export const feeTypeSchema = z.object({ name: z.string().trim().min(1).max(100), description: text(1000), defaultAmount: z.coerce.number().min(0).max(999999999), frequency: z.enum(["one_time", "monthly", "termly", "annual"]), isActive: z.boolean(), academicYearId: z.union([id, z.literal("")]).transform((value) => value || null) });
export const feeRecordSchema = z.object({ studentId: id, feeTypeId: id, academicYearId: id, termId: z.union([id, z.literal("")]).transform((value) => value || null), amountDue: z.coerce.number().min(0).max(999999999), dueDate: z.string().date(), notes: text(2000) });
export const feePaymentSchema = z.object({ feeRecordId: id, amount: z.coerce.number().positive().max(999999999), paidOn: z.string().date(), paymentMethod: z.string().trim().min(1).max(50), receiptNumber: z.string().trim().min(1).max(50), notes: text(2000) });
export const feeQuerySchema = z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(5).max(50).default(15), status: z.enum(["unpaid", "partially_paid", "paid", "overdue"]).optional(), studentId: id.optional(), academicYearId: id.optional() });
