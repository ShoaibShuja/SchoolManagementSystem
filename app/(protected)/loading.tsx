import { Skeleton } from "@/components/ui/skeleton";

export default function ProtectedLoading() {
  return <main className="space-y-6 p-6"><Skeleton className="h-7 w-52" /><Skeleton className="h-32 w-full" /></main>;
}
