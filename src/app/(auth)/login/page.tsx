import { redirect } from "next/navigation";
import { AuthForm } from "@/features/auth/ui/auth-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims?.sub) redirect("/app");
  const { error } = await searchParams;
  return <section className="auth-stage"><div className="auth-intro"><p className="eyebrow">WELCOME BACK</p><h1>Make today<br />count.</h1><p>Your commitments, money, and progress—held together in one quiet place.</p></div><div className="auth-panel"><p className="eyebrow">SIGN IN</p><h2>Continue your PACT.</h2>{error === "confirmation" && <p className="auth-message auth-error" role="alert">We couldn&apos;t confirm that link. Please request a new one or sign in.</p>}<AuthForm mode="sign-in" /></div></section>;
}
