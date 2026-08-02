import type { AppRole } from "@/lib/constants/roles";

export function canWriteAdminRecords(role: AppRole) {
  return role === "admin";
}
