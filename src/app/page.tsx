import Link from "next/link";
import { PactBrand } from "@/components/pact/brand";
const navigation = ["Today", "Commitments", "Money", "Daily sheet"];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#090a0c] text-[#f5f1e8]">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
        <header className="glass flex items-center justify-between rounded-2xl px-4 py-3 sm:px-5">
          <PactBrand href="/" />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">{navigation.map((item, index) => <a className={index === 0 ? "nav-link nav-link-active" : "nav-link"} href={index === 0 ? "#today" : "#how-it-works"} key={item}>{item}</a>)}</nav>
          <Link className="avatar" href="/login" aria-label="Sign in to PACT">→</Link>
        </header>
        <section id="today" className="flex flex-1 items-center py-14 sm:py-20"><div className="grid w-full items-end gap-10 lg:grid-cols-[1.15fr_0.85fr]"><div className="max-w-2xl"><p className="eyebrow">YOUR PERSONAL OPERATING SYSTEM</p><h1 className="mt-5 text-5xl font-semibold tracking-[-0.055em] sm:text-7xl">Keep your word<br />to yourself.</h1><p className="mt-6 max-w-lg text-base leading-7 text-[#b7b3aa] sm:text-lg">PACT turns the promises you make into a calm, focused system for follow-through and financial clarity.</p><div className="mt-9 flex flex-wrap gap-3"><Link className="button-primary" href="/signup">Begin your setup <span aria-hidden="true">→</span></Link><Link className="button-secondary" href="/login">Sign in</Link></div></div>
          <div className="glass card-glow rounded-3xl p-5 sm:p-7"><p className="eyebrow">TODAY</p><div className="mt-10 flex items-end justify-between gap-4"><div><p className="text-3xl font-medium tracking-[-0.04em]">Your day, clearly.</p><p className="mt-2 text-sm leading-6 text-[#aaa69f]">Set up your first commitment and PACT will organize the rest around it.</p></div><span className="score-orb" aria-label="Discipline score will appear after setup">—</span></div><div className="mt-9 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">{["Make a commitment", "Set your limits", "Review your day"].map((step, index) => <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3" key={step}><span className="text-xs text-[#d3a866]">0{index + 1}</span><p className="mt-4 text-sm text-[#ddd8cf]">{step}</p></div>)}</div></div></div></section>
        <section id="how-it-works" className="grid gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.08] md:grid-cols-3">{[["Plan", "Turn an intention into a commitment with a clear deadline."], ["Follow through", "Keep progress visible without turning your day into a dashboard."], ["Learn", "Understand your patterns and make tomorrow easier."]].map(([title, description]) => <article className="bg-[#111214]/85 p-6 sm:p-7" key={title}><p className="text-sm font-medium text-[#e2b774]">{title}</p><p className="mt-3 max-w-xs text-sm leading-6 text-[#a9a59e]">{description}</p></article>)}</section>
        <footer className="flex justify-between px-1 py-5 text-xs text-[#76736e]"><span>PACT V0</span><span>Built for consistency.</span></footer>
      </div>
    </main>
  );
}
