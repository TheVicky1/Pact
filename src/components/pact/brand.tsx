import Link from "next/link";
export function PactBrand({ compact = false }: { compact?: boolean }) { return <Link className="pact-brand" href="/app" aria-label="PACT dashboard"><span className="pact-brand-mark" aria-hidden="true" /><span className={compact ? "sr-only" : "pact-brand-name"}>PACT</span></Link>; }
