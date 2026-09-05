import type { ReactNode } from "react";
import { AppShell } from "@/components/pact/app-shell";
import { requireUser } from "@/features/auth/require-user";
export default async function AppLayout({ children }: { children: ReactNode }) { const { supabase, userId, email } = await requireUser(); const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", userId).maybeSingle(); return <AppShell name={profile?.display_name ?? email?.split("@")[0] ?? "there"}>{children}</AppShell>; }
