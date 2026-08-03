export type FeeStatus = "unpaid" | "partially_paid" | "paid" | "overdue";
export function calculateFeeStatus(amountDue: number, amountPaid: number, dueDate: string, today = new Date().toISOString().slice(0, 10)): FeeStatus { if (amountPaid >= amountDue) return "paid"; if (amountPaid > 0) return "partially_paid"; return dueDate < today ? "overdue" : "unpaid"; }
