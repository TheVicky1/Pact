import { EmptyState } from "@/components/pact/empty-state";
import { CreateCommitmentForm } from "@/features/commitments/ui/create-commitment-form";

export default function CommitmentsPage() {
  return <main className="commitments-page"><header className="page-heading"><p className="eyebrow">COMMITMENTS</p><h1>Promises, held<br />with care.</h1><p>Create a clear promise and give it a meaningful deadline. Consequences stay private unless a deadline is missed.</p></header><div className="commitments-layout"><CreateCommitmentForm /><EmptyState label="YOUR LIST" title="No commitments yet." description="Your active, completed, and missed commitments will appear here." /></div></main>;
}
