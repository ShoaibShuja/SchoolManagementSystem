import { Badge } from "@/components/ui/badge";

const variants = { active: "success", pending: "warning", inactive: "default", overdue: "destructive", info: "info", graduated: "info", withdrawn: "destructive", on_leave: "warning", terminated: "destructive" } as const;

export function StatusBadge({ label, status }: { label?: string; status: keyof typeof variants }) {
  return <Badge variant={variants[status]}>{label ?? status.replace("_", " ")}</Badge>;
}
