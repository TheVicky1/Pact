import { redirect } from "next/navigation";
import { AuthForm } from "@/features/auth/ui/auth-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims?.sub) redirect("/app");
  return <section className="auth-stage"><div className="auth-intro"><p className="eyebrow">WELCOME BACK</p><h1>Make today<br />count.</h1><p>Your commitments, money, and progress—held together in one quiet place.</p></div><div className="auth-panel"><p className="eyebrow">SIGN IN</p><h2>Continue your PACT.</h2><AuthForm mode="sign-in" /></div></section>;
}
