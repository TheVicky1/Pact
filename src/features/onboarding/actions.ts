"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/features/auth/require-user";
const schema = z.object({ displayName: z.string().trim().min(2).max(80), timezone: z.string().trim().min(1).max(64), currencyCode: z.literal("INR"), intention: z.enum(["consistency", "study", "spending", "habits", "everything"]) });
export async function completeOnboarding(formData: FormData) { const parsed = schema.safeParse(Object.fromEntries(formData)); if (!parsed.success) return; const { supabase, userId } = await requireUser(); await supabase.from("profiles").update({ display_name: parsed.data.displayName, timezone: parsed.data.timezone, currency_code: parsed.data.currencyCode, preferences: { primary_intention: parsed.data.intention }, onboarding_completed_at: new Date().toISOString() }).eq("id", userId); redirect("/app"); }
