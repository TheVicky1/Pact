import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/pact/app-shell";
import { requireUser } from "@/features/auth/require-user";
export default async function AppLayout({ children }: { children: ReactNode }) { const { supabase, userId, email } = await requireUser(); const { data: profile } = await supabase.from("profiles").select("display_name,onboarding_completed_at").eq("id", userId).maybeSingle(); if (!profile?.onboarding_completed_at) redirect("/onboarding"); return <AppShell name={profile.display_name ?? email?.split("@")[0] ?? "there"}>{children}</AppShell>; }
