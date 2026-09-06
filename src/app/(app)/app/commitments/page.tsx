import { CreateCommitmentForm } from "@/features/commitments/ui/create-commitment-form";
import { CommitmentList } from "@/features/commitments/ui/commitment-list";
import { listCommitments } from "@/features/commitments/repository";
import { requireUser } from "@/features/auth/require-user";
import { DEFAULT_TIMEZONE, formatDeadline } from "@/lib/time/user-time";

export default async function CommitmentsPage() {
  const { supabase, userId } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("timezone").eq("id", userId).maybeSingle();
  const timezone = profile?.timezone ?? DEFAULT_TIMEZONE;
  try {
    const commitments = await listCommitments(supabase, userId);
    const deadlineLabels = Object.fromEntries(commitments.map((commitment) => [commitment.id, formatDeadline(commitment.deadline_at, timezone)]));
    return <main className="commitments-page"><header className="page-heading"><p className="eyebrow">COMMITMENTS</p><h1>Promises, held<br />with care.</h1><p>Create a clear promise and give it a meaningful deadline. Consequences stay private unless a deadline is missed.</p></header><div className="commitments-layout"><CreateCommitmentForm /><CommitmentList commitments={commitments} deadlineLabels={deadlineLabels} /></div></main>;
  } catch {
    return <main className="commitments-page"><header className="page-heading"><p className="eyebrow">COMMITMENTS</p><h1>Promises, held<br />with care.</h1><p>We could not load your commitments right now. Please refresh and try again.</p></header><CreateCommitmentForm /></main>;
  }
}
