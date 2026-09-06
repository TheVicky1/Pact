import Link from "next/link";
import Image from "next/image";
export function PactBrand({ compact = false, href = "/app" }: { compact?: boolean; href?: string }) { return <Link className="pact-brand" href={href} aria-label="PACT dashboard"><Image className="pact-brand-mark" src="/pact-mark.png" alt="" width={28} height={28} priority /><span className={compact ? "sr-only" : "pact-brand-name"}>PACT</span></Link>; }
