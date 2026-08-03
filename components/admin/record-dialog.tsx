"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function RecordDialog({ open, onOpenChange, title, description, children }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; children: ReactNode }) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/40 data-[state=open]:animate-in data-[state=closed]:animate-out" /><Dialog.Content className="fixed inset-x-3 top-1/2 z-50 max-h-[calc(100vh-1.5rem)] w-auto max-w-2xl -translate-y-1/2 overflow-y-auto rounded-lg border bg-card shadow-xl sm:left-1/2 sm:right-auto sm:w-[calc(100%-3rem)] sm:-translate-x-1/2"><header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-card px-5 py-4"><div><Dialog.Title className="font-semibold">{title}</Dialog.Title><Dialog.Description className="mt-1 text-sm text-muted-foreground">{description}</Dialog.Description></div><Dialog.Close asChild><Button type="button" variant="ghost" size="icon" aria-label="Close form"><X className="size-4" /></Button></Dialog.Close></header><div className="p-4 sm:p-5">{children}</div></Dialog.Content></Dialog.Portal></Dialog.Root>;
}
