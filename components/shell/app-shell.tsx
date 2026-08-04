"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, School, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { AppRole } from "@/lib/constants/roles";
import { roleNavigation } from "@/lib/constants/roles";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shell/theme-toggle";

function Navigation({ role, onNavigate }: { role: AppRole; onNavigate?: () => void }) {
  const pathname = usePathname();
  return <nav aria-label="Main navigation" className="space-y-1">{roleNavigation[role].map((item) => {
    const active = pathname === item.href;
    const Icon = item.icon;
    return <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-white text-dashboard-ink shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white")}><Icon className="size-4" aria-hidden />{item.label}</Link>;
  })}</nav>;
}

function Brand() {
  return <Link href="/login" className="flex items-center gap-3 px-1 text-white"><span className="grid size-10 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20"><School className="size-5" aria-hidden /></span><span><span className="block text-sm font-semibold tracking-tight">Jahan School</span><span className="block text-xs text-white/60">Management system</span></span></Link>;
}

export function AppShell({ role, children }: { role: AppRole; children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const roleLabel = role[0].toUpperCase() + role.slice(1);

  return <div className="app-canvas min-h-screen"><a href="#main-content" className="sr-only fixed left-4 top-4 z-[60] rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground focus:not-sr-only">Skip to content</a><aside className="app-sidebar fixed inset-y-0 left-0 z-30 hidden w-64 p-4 lg:flex lg:flex-col"><Brand /><div className="my-6 border-t border-white/15" /><Navigation role={role} /><div className="mt-auto rounded-2xl border border-white/10 bg-white/10 p-4 text-white"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/60">Signed in as</p><p className="mt-1 text-sm font-medium">{roleLabel}</p></div></aside>{mobileOpen ? <div className="fixed inset-0 z-40 lg:hidden"><button aria-label="Close navigation" className="absolute inset-0 bg-dashboard-ink/55 backdrop-blur-sm" onClick={() => setMobileOpen(false)} /><aside aria-label="Mobile navigation" className="app-sidebar relative flex h-full w-[min(19rem,86vw)] flex-col p-4 shadow-2xl"><div className="flex items-center justify-between"><Brand /><Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X className="size-4" /></Button></div><div className="my-6 border-t border-white/15" /><Navigation role={role} onNavigate={() => setMobileOpen(false)} /></aside></div> : null}<div className="lg:pl-64"><header className="app-header sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur-xl sm:px-6"><div className="flex min-w-0 items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><Menu className="size-5" /></Button><p className="hidden text-sm font-medium text-muted-foreground sm:block">School operations</p></div><div className="flex items-center gap-1 sm:gap-3"><Badge variant="info" className="hidden sm:inline-flex">{roleLabel}</Badge><ThemeToggle /><form action="/auth/signout" method="post"><Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" type="submit"><LogOut className="size-4" /> <span className="hidden sm:inline">Sign out</span></Button></form></div></header><main id="main-content" className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main></div></div>;
}
