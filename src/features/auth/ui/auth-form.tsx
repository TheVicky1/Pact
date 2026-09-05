"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { AuthState } from "@/features/auth/actions";
import { signIn, signUp } from "@/features/auth/actions";

const initialState: AuthState = {};

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const isSignUp = mode === "sign-up";
  const [state, action, pending] = useActionState(isSignUp ? signUp : signIn, initialState);
  const [showPassword, setShowPassword] = useState(false);
  return (
    <form action={action} className="auth-form" noValidate>
      {isSignUp && <Field label="Name" name="displayName" autoComplete="name" error={state.fieldErrors?.displayName?.[0]} />}
      <Field label="Email" name="email" type="email" autoComplete="email" error={state.fieldErrors?.email?.[0]} />
      <div className="field"><div className="field-label-row"><label htmlFor="password">Password</label>{!isSignUp && <span className="field-hint">At least 8 characters</span>}</div><div className="password-wrap"><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={isSignUp ? "new-password" : "current-password"} aria-invalid={Boolean(state.fieldErrors?.password?.[0])} aria-describedby={state.fieldErrors?.password?.[0] ? "password-error" : undefined} required /><button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button></div>{state.fieldErrors?.password?.[0] && <p className="field-error" id="password-error">{state.fieldErrors.password[0]}</p>}</div>
      {state.error && <p className="auth-message auth-error" role="alert">{state.error}</p>}
      {state.message && <p className="auth-message auth-success" role="status">{state.message}</p>}
      <button className="auth-submit" type="submit" disabled={pending}>{pending ? "Please wait…" : isSignUp ? "Create your PACT" : "Continue to PACT"}<span aria-hidden="true">→</span></button>
      <p className="auth-switch">{isSignUp ? "Already have a PACT?" : "New here?"} <Link href={isSignUp ? "/login" : "/signup"}>{isSignUp ? "Sign in" : "Create your account"}</Link></p>
    </form>
  );
}

function Field({ label, name, type = "text", autoComplete, error }: { label: string; name: string; type?: string; autoComplete: string; error?: string }) {
  return <div className="field"><label htmlFor={name}>{label}</label><input id={name} name={name} type={type} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined} required />{error && <p className="field-error" id={`${name}-error`}>{error}</p>}</div>;
}
