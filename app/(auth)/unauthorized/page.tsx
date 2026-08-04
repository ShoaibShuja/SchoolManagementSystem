import Link from "next/link";
import { PermissionDenied } from "@/components/shared/states";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Access restricted" };

export default function UnauthorizedPage() {
  return <main className="relative grid min-h-screen place-items-center bg-background p-6"><ThemeToggle className="absolute right-4 top-4 sm:right-6 sm:top-6" /><div className="w-full max-w-lg space-y-5"><PermissionDenied description="Your account is signed in, but it has not been assigned access to this area yet. Contact the school administrator if you need help." /><Button asChild variant="outline" className="w-full"><Link href="/login">Return to sign in</Link></Button></div></main>;
}
