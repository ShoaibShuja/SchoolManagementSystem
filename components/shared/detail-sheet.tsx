"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DetailSheet({ trigger, title, children }: { trigger: ReactNode; title: string; children: ReactNode }) {
  return <Dialog.Root><Dialog.Trigger asChild>{trigger}</Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/20" /><Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l bg-card shadow-xl"><header className="flex items-center justify-between border-b px-5 py-4"><Dialog.Title className="font-semibold">{title}</Dialog.Title><Dialog.Close asChild><Button variant="ghost" size="icon" aria-label="Close details"><X className="size-4" /></Button></Dialog.Close></header><div className="flex-1 overflow-y-auto p-5">{children}</div></Dialog.Content></Dialog.Portal></Dialog.Root>;
}
