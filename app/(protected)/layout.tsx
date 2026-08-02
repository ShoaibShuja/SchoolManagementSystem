import { requireCurrentProfile } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireCurrentProfile();
  return children;
}
