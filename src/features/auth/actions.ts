"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signInSchema, signUpSchema } from "@/features/auth/schemas";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string; fieldErrors?: Record<string, string[]> };

function invalidFields(error: { flatten: () => { fieldErrors: Record<string, string[]> } }): AuthState {
  return { error: "Please correct the highlighted fields.", fieldErrors: error.flatten().fieldErrors };
}

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalidFields(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "We couldn't sign you in with those details." };
  redirect("/app");
}

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalidFields(parsed.error);
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { error, data } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { display_name: parsed.data.displayName }, emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) return { error: "We couldn't create your account right now. Please try again." };
  if (!data.session) return { message: "Check your inbox to confirm your email, then return to PACT." };
  redirect("/app");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
