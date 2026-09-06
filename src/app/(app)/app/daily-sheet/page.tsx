import { EmptyState } from "@/components/pact/empty-state";

export default function DailySheetPage() {
  return <main className="secondary-page"><header className="page-heading"><p className="eyebrow">DAILY SHEET</p><h1>One page for<br />the day ahead.</h1><p>Your daily sheet will become a simple place to reflect once it has real notes and commitments to organize.</p></header><EmptyState label="TODAY" title="Your page is clear." description="There are no daily-sheet entries yet, so PACT is keeping this view deliberately calm." /></main>;
}
