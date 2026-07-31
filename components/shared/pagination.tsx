import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pagination({ page, totalPages, onPrevious, onNext }: { page: number; totalPages: number; onPrevious?: () => void; onNext?: () => void }) {
  return <nav aria-label="Pagination" className="flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p><div className="flex gap-2"><Button type="button" variant="outline" size="sm" onClick={onPrevious} disabled={page <= 1}><ChevronLeft className="size-4" />Previous</Button><Button type="button" variant="outline" size="sm" onClick={onNext} disabled={page >= totalPages}>Next<ChevronRight className="size-4" /></Button></div></nav>;
}
