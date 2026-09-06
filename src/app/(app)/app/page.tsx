import { EmptyState } from "@/components/pact/empty-state";
import Link from "next/link";
import { requireUser } from "@/features/auth/require-user";
import { listCommitments } from "@/features/commitments/repository";
import { DEFAULT_TIMEZONE, formatDeadline, formatUserDate, getUserDayRange } from "@/lib/time/user-time";

export default async function AppPage() {
  const { supabase, userId, email } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("display_name,timezone").eq("id", userId).maybeSingle();
  const name = profile?.display_name?.split(" ")[0] ?? email?.split("@")[0] ?? "there";
  const timezone = profile?.timezone ?? DEFAULT_TIMEZONE;
  const today = getUserDayRange(timezone);
  let todaysCommitments = [] as Awaited<ReturnType<typeof listCommitments>>;
  let commitmentsUnavailable = false;
  try {
    const commitments = await listCommitments(supabase, userId);
    todaysCommitments = commitments.filter((commitment) => commitment.deadline_at >= today.start && commitment.deadline_at < today.endExclusive);
  } catch {
    commitmentsUnavailable = true;
  }
  const next = todaysCommitments.find((commitment) => commitment.effectiveStatus === "active");
  const todayTitle = commitmentsUnavailable ? "Today is unavailable." : next ? next.title : todaysCommitments.length ? "Today is accounted for." : "Your day is ready for intention.";
  const todayDescription = commitmentsUnavailable ? "We could not load today’s commitments. Please refresh and try again." : next ? `Due ${formatDeadline(next.deadline_at, timezone)}. ${todaysCommitments.length - 1 ? `${todaysCommitments.length - 1} other commitment${todaysCommitments.length === 2 ? "" : "s"} today.` : ""}` : todaysCommitments.length ? "Every commitment due today is completed or has passed its deadline." : "No commitments are due today. Begin with the one thing you want to follow through on.";
  return <main className="dashboard"><section className="dashboard-hero"><div><p className="date-context">{formatUserDate(timezone)}</p><h1>Good to see you, {name}.</h1><p>Start with one clear promise. The rest of your day can follow.</p></div><Link className="create-pact" href="/app/commitments"><span aria-hidden="true">+</span> View commitments</Link></section><section className="dashboard-status"><div className="status-copy"><p className="eyebrow">TODAY&apos;S PACT</p><h2>{todayTitle}</h2><p>{todayDescription}</p><Link className="quiet-action" href="/app/commitments">View commitments <span aria-hidden="true">→</span></Link></div><div className="status-orbit" aria-hidden="true"><div className="orbit-core"><span>—</span><small>DISCIPLINE</small></div><i className="orbit-dot orbit-dot-one" /><i className="orbit-dot orbit-dot-two" /><i className="orbit-dot orbit-dot-three" /></div></section><section className="dashboard-grid"><EmptyState label="COMMITMENTS" title={next ? `${todaysCommitments.length} due today.` : "Nothing scheduled."} description={next ? `Next: ${next.title}.` : "Your commitments will live here with their deadline and progress—consequences stay private until a deadline is actually missed."} action="View commitments" href="/app/commitments" /><EmptyState label="MONEY" title="Your spending space is clear." description="Expenses and a daily spending target will appear here once you decide to start tracking." action="View money" href="/app/money" /><EmptyState label="DAILY SHEET" title="A clear page for the day." description="A concise daily reflection space will appear here when it has real entries to show." action="Open daily sheet" href="/app/daily-sheet" /></section></main>;
}
