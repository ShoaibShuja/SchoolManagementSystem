import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center bg-background p-6"><section className="max-w-md space-y-4 text-center"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Page not found</p><h1 className="text-3xl font-semibold tracking-tight">This page is not available</h1><p className="text-sm leading-6 text-muted-foreground">Check the address or return to the sign-in page.</p><Button asChild><Link href="/login">Go to sign in</Link></Button></section></main>;
}
