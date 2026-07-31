import type { ReactNode } from "react";
import { EmptyState } from "@/components/shared/states";

export type DataTableColumn<T> = { header: string; cell: (row: T) => ReactNode; className?: string };

export function DataTable<T extends { id: string }>({ columns, rows, emptyTitle = "No records found", emptyDescription = "Try changing the filters or add the first record." }: { columns: DataTableColumn<T>[]; rows: T[]; emptyTitle?: string; emptyDescription?: string }) {
  if (rows.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} />;
  return <div className="overflow-hidden rounded-lg border bg-card"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-muted/70 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><tr>{columns.map((column) => <th key={column.header} className="px-4 py-3">{column.header}</th>)}</tr></thead><tbody className="divide-y">{rows.map((row) => <tr key={row.id} className="hover:bg-muted/40">{columns.map((column) => <td key={column.header} className={`px-4 py-3 ${column.className ?? ""}`}>{column.cell(row)}</td>)}</tr>)}</tbody></table></div></div>;
}
