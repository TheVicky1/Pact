import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AppPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/login");
  return <main className="app-loading"><p className="eyebrow">PACT</p><h1>Preparing your private space.</h1><p>Your dashboard foundation is loading.</p></main>;
}
