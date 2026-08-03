import { cloneElement, isValidElement, type ReactNode } from "react";
import { Label } from "@/components/ui/label";

type FormFieldProps = { id: string; label: string; children: ReactNode; hint?: string; error?: string; required?: boolean };

export function FormField({ id, label, children, hint, error, required }: FormFieldProps) {
  const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const control = isValidElement<{ "aria-describedby"?: string; "aria-invalid"?: boolean }>(children) ? cloneElement(children, { "aria-describedby": descriptionId, "aria-invalid": error ? true : undefined }) : children;
  return <div className="space-y-2"><Label htmlFor={id}>{label}{required ? <span aria-hidden className="ml-1 text-destructive">*</span> : null}</Label>{control}{error ? <p id={`${id}-error`} role="alert" className="text-sm text-destructive">{error}</p> : hint ? <p id={`${id}-hint`} className="text-sm text-muted-foreground">{hint}</p> : null}</div>;
}
