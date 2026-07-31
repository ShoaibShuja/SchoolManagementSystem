import type { ReactNode } from "react";
import { AlertCircle, FolderOpen, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

type StateProps = { title: string; description: string; action?: ReactNode };

function StateFrame({ children, title, description, action }: StateProps & { children: ReactNode }) {
  return <section className="rounded-lg border border-dashed bg-card px-6 py-12 text-center"><div className="mx-auto flex max-w-sm flex-col items-center gap-3">{children}<h2 className="text-base font-semibold">{title}</h2><p className="text-sm leading-6 text-muted-foreground">{description}</p>{action}</div></section>;
}

export function EmptyState(props: StateProps) {
  return <StateFrame {...props}><FolderOpen className="size-7 text-muted-foreground" aria-hidden /></StateFrame>;
}

export function ErrorState({ onRetry, ...props }: StateProps & { onRetry?: () => void }) {
  return <StateFrame {...props} action={onRetry ? <Button variant="outline" onClick={onRetry}>Try again</Button> : props.action}><AlertCircle className="size-7 text-destructive" aria-hidden /></StateFrame>;
}

export function PermissionDenied({ description = "Your account does not have access to this page." }: { description?: string }) {
  return <StateFrame title="Access restricted" description={description}><LockKeyhole className="size-7 text-muted-foreground" aria-hidden /></StateFrame>;
}
