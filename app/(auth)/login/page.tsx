import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return <main className="grid min-h-screen place-items-center bg-background p-4 sm:p-6"><section className="w-full max-w-md space-y-8 rounded-lg border bg-card p-6 shadow-sm sm:p-8"><div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Jahan School</p><h1 className="text-3xl font-semibold tracking-tight">Sign in to your school account</h1><p className="text-sm leading-6 text-muted-foreground">Use the email address and password provided by your school administrator.</p></div><LoginForm /></section></main>;
}
