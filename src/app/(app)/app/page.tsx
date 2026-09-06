import Link from "next/link";
import { requireUser } from "@/features/auth/require-user";
import { DEFAULT_TIMEZONE, formatUserDate } from "@/lib/time/user-time";

const focusBars = [34, 56, 28, 72, 44, 86, 49, 65, 31, 74, 53, 68];

export default async function AppPage() {
  const { supabase, userId } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("display_name,timezone").eq("id", userId).maybeSingle();
  const timezone = profile?.timezone ?? DEFAULT_TIMEZONE;

  return (
    <main className="today-page">
      <section className="today-heading">
        <div>
          <p className="date-context">{formatUserDate(timezone)}</p>
          <h1>Stay on track today</h1>
        </div>
        <div className="today-encouragement">
          <span className="encouragement-icon" aria-hidden="true">✓</span>
          <div><strong>Keep it going!</strong><span>You&apos;ve done all previous tasks!</span></div>
        </div>
        <div className="today-actions"><button className="widget-action" type="button" aria-label="Add widget">+</button><span>Add Widget</span><Link className="customize-button" href="/app/commitments">Customize</Link></div>
      </section>

      <section className="goals-row" aria-label="Daily goals">
        <div className="calendar-chip"><strong>{new Date().getDate()}</strong><span>{new Intl.DateTimeFormat("en-US", { month: "short", timeZone: timezone }).format(new Date())}</span></div>
        <div><span className="goals-label">Your Daily Goals</span><strong className="goals-count">0/5 <span>completed</span></strong></div>
        <div className="goal-arrows"><button type="button" aria-label="Previous day">←</button><button type="button" aria-label="Next day">→</button></div>
      </section>

      <section className="widget-grid">
        <article className="dashboard-widget deep-work-widget"><div className="widget-title-row"><span>Deep Work Time</span><button type="button" aria-label="Pause timer">Ⅱ</button></div><div className="work-glow" aria-hidden="true" /><strong>0h 00m</strong><span className="widget-caption">Start a focused session</span></article>
        <article className="dashboard-widget attention-widget"><div className="widget-title-row"><span>Attention Quality</span><span className="widget-caption">Last 60 min</span></div><strong>—</strong><span className="widget-caption">No session recorded</span></article>
        <article className="dashboard-widget focus-widget"><div className="widget-title-row"><span>Focus Stability</span><span className="score-pill">Current Score: —</span></div><div className="focus-chart" aria-label="Focus stability chart">{focusBars.map((height, index) => <span key={index} style={{ height: `${height}%` }} className={index % 3 === 1 ? "bar bar-gold" : "bar"} />)}<i className="chart-line" /></div><span className="peak-pill">No focus peak yet</span></article>
      </section>

      <section className="timeline-card"><div className="timeline-header"><div><span>Daily Timeline</span><small>0 Tasks for today</small></div><Link href="/app/commitments">Add an Event</Link></div><div className="timeline-hours">{["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM"].map((hour) => <span key={hour}>{hour}</span>)}</div><div className="timeline-empty"><span className="timeline-empty-mark">+</span><div><strong>Your day is open.</strong><p>Add a commitment to give your attention somewhere meaningful to go.</p></div><Link href="/app/commitments">Create commitment</Link></div></section>
    </main>
  );
}
