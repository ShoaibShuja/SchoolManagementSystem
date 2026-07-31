"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { logError } from "@/lib/error-logger";

export default function GlobalError({ error, reset }: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  useEffect(() => { logError(error, { boundary: "root", digest: error.digest }); }, [error]);
  return <html lang="en"><body className="grid min-h-screen place-items-center bg-background p-6 text-foreground"><main className="max-w-md space-y-4 text-center"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Jahan School</p><h1 className="text-3xl font-semibold tracking-tight">Something needs attention</h1><p className="text-sm leading-6 text-muted-foreground">Refresh this page or try again. If the problem continues, contact the school administrator.</p><Button onClick={reset}>Try again</Button></main></body></html>;
}
