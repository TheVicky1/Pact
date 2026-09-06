import Link from "next/link";

export function EmptyState({ label, title, description, action, href }: { label: string; title: string; description: string; action?: string; href?: string }) { return <section className="empty-state"><p className="eyebrow">{label}</p><h2>{title}</h2><p>{description}</p>{action && href ? <Link className="quiet-action" href={href}>{action} <span aria-hidden="true">↗</span></Link> : null}</section>; }
