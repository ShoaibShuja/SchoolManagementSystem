import type { ReactNode } from "react";

export function FilterControls({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:items-center">{children}</div>;
}
