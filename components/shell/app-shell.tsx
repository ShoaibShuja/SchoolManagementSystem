"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, School, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { AppRole } from "@/lib/constants/roles";
import { roleNavigation } from "@/lib/constants/roles";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function Navigation({ role, onNavigate }: { role: AppRole; onNavigate?: () => void }) {
  const pathname = usePathname();
  return <nav aria-label="Main navigation" className="space-y-1">{roleNavigation[role].map((item) => {
    const active = pathname === item.href;
    const Icon = item.icon;
    return <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}><Icon className="size-4" aria-hidden />{item.label}</Link>;
  })}</nav>;
}

function Brand() {
  return <Link href="/login" className="flex items-center gap-3 px-1"><span className="grid size-9 place-items-center rounded-md bg-brand text-brand-foreground"><School className="size-5" aria-hidden /></span><span><span className="block text-sm font-semibold tracking-tight">Jahan School</span><span className="block text-xs text-muted-foreground">Management system</span></span></Link>;
}

export function AppShell({ role, children }: { role: AppRole; children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const roleLabel = role[0].toUpperCase() + role.slice(1);

  return <div className="min-h-screen bg-background"><a href="#main-content" className="sr-only fixed left-4 top-4 z-[60] rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground focus:not-sr-only">Skip to content</a><aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-card p-4 lg:flex lg:flex-col"><Brand /><div className="my-6 border-t" /><Navigation role={role} /><div className="mt-auto rounded-md bg-muted p-3"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Signed in as</p><p className="mt-1 text-sm font-medium">{roleLabel}</p></div></aside>{mobileOpen ? <div className="fixed inset-0 z-40 lg:hidden"><button aria-label="Close navigation" className="absolute inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} /><aside aria-label="Mobile navigation" className="relative flex h-full w-[min(18rem,85vw)] flex-col border-r bg-card p-4 shadow-xl"><div className="flex items-center justify-between"><Brand /><Button variant="ghost" size="icon" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X className="size-4" /></Button></div><div className="my-6 border-t" /><Navigation role={role} onNavigate={() => setMobileOpen(false)} /></aside></div> : null}<div className="lg:pl-64"><header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur sm:px-6"><div className="flex min-w-0 items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><Menu className="size-5" /></Button><p className="hidden text-sm text-muted-foreground sm:block">School operations</p></div><div className="flex items-center gap-2 sm:gap-3"><Badge variant="default">{roleLabel}</Badge><form action="/auth/signout" method="post"><Button variant="outline" size="sm" type="submit">Sign out</Button></form></div></header><main id="main-content" className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main></div></div>;
}
