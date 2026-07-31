import Link from "next/link";
import { PermissionDenied } from "@/components/shared/states";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Access restricted" };

export default function UnauthorizedPage() {
  return <main className="grid min-h-screen place-items-center bg-background p-6"><div className="w-full max-w-lg space-y-5"><PermissionDenied description="Your account is signed in, but it has not been assigned access to this area yet. Contact the school administrator if you need help." /><Button asChild variant="outline" className="w-full"><Link href="/login">Return to sign in</Link></Button></div></main>;
}
