import type { CommitmentView } from "@/features/commitments/types";

type Props = { commitments: CommitmentView[]; deadlineLabels: Record<string, string> };

const sections = [
  { status: "active", label: "Active" },
  { status: "missed", label: "Missed" },
  { status: "completed", label: "Completed" },
] as const;

export function CommitmentList({ commitments, deadlineLabels }: Props) {
  if (!commitments.length) return <div className="commitment-empty pact-card"><p className="eyebrow">YOUR LIST</p><h2>No commitments yet.</h2><p>Your active, completed, and missed commitments will appear here.</p></div>;
  return <div className="commitment-list">
    {sections.map(({ status, label }) => {
      const group = commitments.filter((commitment) => commitment.effectiveStatus === status);
      if (!group.length) return null;
      return <section className="commitment-group" key={status}><p className="eyebrow">{label}</p><div className="commitment-cards">{group.map((commitment) => <article className={`commitment-card pact-card commitment-${status}`} key={commitment.id}><div><h2>{commitment.title}</h2>{commitment.description ? <p>{commitment.description}</p> : null}</div><div className="commitment-meta"><span>{commitment.priority} priority</span><time dateTime={commitment.deadline_at}>{deadlineLabels[commitment.id]}</time></div>{commitment.effectiveStatus === "missed" && commitment.consequence ? <p className="commitment-consequence"><strong>Consequence</strong>{commitment.consequence}</p> : null}</article>)}</div></section>;
    })}
  </div>;
}
