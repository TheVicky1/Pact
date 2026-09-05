import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <main className="auth-canvas"><div className="auth-light auth-light-one" /><div className="auth-light auth-light-two" /><header className="auth-header"><Link href="/" className="brand" aria-label="PACT home"><span className="pact-mark" aria-hidden="true" /><span>PACT</span></Link><p>Keep your word to yourself.</p></header>{children}<footer className="auth-footer">A calmer way to follow through.</footer></main>;
}
