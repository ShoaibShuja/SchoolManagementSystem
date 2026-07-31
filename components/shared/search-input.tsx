"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type SearchInputProps = { value?: string; onChange?: (value: string) => void; placeholder?: string; label?: string };

export function SearchInput({ value, onChange, placeholder = "Search", label = "Search" }: SearchInputProps) {
  return <label className="relative block"><span className="sr-only">{label}</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input value={value} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} className="pl-9" /></label>;
}
