"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type ConfirmationDialogProps = { trigger: ReactNode; title: string; description: string; confirmLabel: string; onConfirm: () => void; destructive?: boolean };

export function ConfirmationDialog({ trigger, title, description, confirmLabel, onConfirm, destructive }: ConfirmationDialogProps) {
  return <AlertDialog.Root><AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger><AlertDialog.Portal><AlertDialog.Overlay className="fixed inset-0 z-50 bg-foreground/20" /><AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card p-6 shadow-xl"><AlertDialog.Title className="text-lg font-semibold">{title}</AlertDialog.Title><AlertDialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">{description}</AlertDialog.Description><div className="mt-6 flex justify-end gap-2"><AlertDialog.Cancel asChild><Button variant="outline">Cancel</Button></AlertDialog.Cancel><AlertDialog.Action asChild><Button variant={destructive ? "destructive" : "default"} onClick={onConfirm}>{confirmLabel}</Button></AlertDialog.Action></div></AlertDialog.Content></AlertDialog.Portal></AlertDialog.Root>;
}
