import { redirect } from "next/navigation";
import { requireCurrentProfile } from "@/lib/auth/guards";

export default async function DashboardPage() {
  const profile = await requireCurrentProfile();
  redirect(`/${profile.role}`);
}
