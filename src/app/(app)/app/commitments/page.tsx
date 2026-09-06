import { EmptyState } from "@/components/pact/empty-state";

export default function CommitmentsPage() {
  return <main className="secondary-page"><header className="page-heading"><p className="eyebrow">COMMITMENTS</p><h1>Promises, held<br />with care.</h1><p>Your first commitment will appear here once the creation flow is ready. Nothing is being counted before it exists.</p></header><EmptyState label="YOUR LIST" title="No commitments yet." description="PACT will show only commitments you intentionally create, along with their deadline and progress." /></main>;
}
