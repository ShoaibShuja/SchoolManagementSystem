import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env/client";

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getOptionalUser();
  if (isSupabaseConfigured() && !user) redirect("/login");
  return children;
}
