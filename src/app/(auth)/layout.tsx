import type { ReactNode } from "react";
import { PactBrand } from "@/components/pact/brand";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <main className="auth-canvas"><div className="auth-light auth-light-one" /><div className="auth-light auth-light-two" /><header className="auth-header"><PactBrand href="/" /><p>Keep your word to yourself.</p></header>{children}<footer className="auth-footer">A calmer way to follow through.</footer></main>;
}
