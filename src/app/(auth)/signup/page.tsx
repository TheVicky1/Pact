import { redirect } from "next/navigation";
import { AuthForm } from "@/features/auth/ui/auth-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims?.sub) redirect("/app");
  return <section className="auth-stage"><div className="auth-intro"><p className="eyebrow">BEGIN WITH INTENTION</p><h1>Build a promise<br />you can keep.</h1><p>Set up your private operating system for consistency, clarity, and momentum.</p></div><div className="auth-panel"><p className="eyebrow">CREATE ACCOUNT</p><h2>Make your first PACT.</h2><AuthForm mode="sign-up" /></div></section>;
}
