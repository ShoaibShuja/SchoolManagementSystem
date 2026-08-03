import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/error-logger";

type RateLimit = { count: number; resetAt: number };
const limits = new Map<string, RateLimit>();

function clientIdentifier(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";
}

export function enforceRateLimit(request: NextRequest, scope: string, maximum: number, windowMs: number) {
  const now = Date.now();
  const key = `${scope}:${clientIdentifier(request)}`;
  const current = limits.get(key);
  const active = current && current.resetAt > now ? current : { count: 0, resetAt: now + windowMs };
  active.count += 1;
  limits.set(key, active);

  if (limits.size > 1_000) for (const [entry, value] of limits) if (value.resetAt <= now) limits.delete(entry);
  if (active.count <= maximum) return null;
  return NextResponse.json(
    { error: "Too many requests. Please try again shortly." },
    { status: 429, headers: { "Retry-After": String(Math.max(1, Math.ceil((active.resetAt - now) / 1_000))) } },
  );
}

export function safeRouteError(error: unknown, operation: string) {
  logError(error, { operation });
  return NextResponse.json({ error: "The request could not be completed." }, { status: 400 });
}
