"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeCommitmentAction, updateCommitmentAction } from "@/features/commitments/actions";
import type { CommitmentView } from "@/features/commitments/types";

type Props = { commitments: CommitmentView[]; deadlineLabels: Record<string, string>; deadlineInputs: Record<string, string> };

const sections = [
  { status: "active", label: "Active" },
  { status: "missed", label: "Missed" },
  { status: "completed", label: "Completed" },
] as const;

export function CommitmentList({ commitments, deadlineLabels, deadlineInputs }: Props) {
  if (!commitments.length) return <div className="commitment-empty pact-card"><p className="eyebrow">YOUR LIST</p><h2>No commitments yet.</h2><p>Your active, completed, and missed commitments will appear here.</p></div>;
  return <div className="commitment-list">
    {sections.map(({ status, label }) => {
      const group = commitments.filter((commitment) => commitment.effectiveStatus === status);
      if (!group.length) return null;
      return <section className="commitment-group" key={status}><p className="eyebrow">{label}</p><div className="commitment-cards">{group.map((commitment) => <CommitmentCard commitment={commitment} deadlineLabel={deadlineLabels[commitment.id]} deadlineInput={deadlineInputs[commitment.id]} key={commitment.id} />)}</div></section>;
    })}
  </div>;
}

function CommitmentCard({ commitment, deadlineLabel, deadlineInput }: { commitment: CommitmentView; deadlineLabel: string; deadlineInput: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  function submit(formData: FormData) {
    setError(undefined);
    startTransition(async () => {
      const result = await updateCommitmentAction(commitment.id, Object.fromEntries(formData));
      if (result.error) return setError(result.error);
      setEditing(false);
      router.refresh();
    });
  }
  function complete() {
    setError(undefined);
    startTransition(async () => {
      const result = await completeCommitmentAction(commitment.id);
      if (result.error) return setError(result.error);
      router.refresh();
    });
  }
  return <article className={`commitment-card pact-card commitment-${commitment.effectiveStatus}`}><div><h2>{commitment.title}</h2>{commitment.description ? <p>{commitment.description}</p> : null}</div><div className="commitment-meta"><span>{commitment.priority} priority</span><time dateTime={commitment.deadline_at}>{deadlineLabel}</time></div>{commitment.effectiveStatus === "active" ? <div className="commitment-actions"><button className="text-button" onClick={() => setEditing((value) => !value)} type="button">{editing ? "Cancel edit" : "Edit"}</button><button className="button-secondary commitment-complete" onClick={complete} type="button" disabled={isPending}>{isPending ? "Saving…" : "Mark complete"}</button></div> : null}{editing ? <form action={submit} className="commitment-edit"><label className="field"><span>Title</span><input name="title" required defaultValue={commitment.title} maxLength={160} /></label><label className="field"><span>Deadline</span><input name="deadline" type="datetime-local" required defaultValue={deadlineInput} /></label><label className="field"><span>Priority</span><select name="priority" defaultValue={commitment.priority}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label className="field"><span>Notes</span><textarea name="description" defaultValue={commitment.description ?? ""} maxLength={2000} rows={2} /></label><label className="field"><span>Replace consequence <small>optional; existing text remains private</small></span><textarea name="newConsequence" maxLength={500} rows={2} /></label>{error ? <p className="field-error" role="alert">{error}</p> : null}<button className="button-secondary" type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save changes"}</button></form> : null}{error && !editing ? <p className="field-error" role="alert">{error}</p> : null}{commitment.effectiveStatus === "missed" && commitment.consequence ? <p className="commitment-consequence"><strong>Consequence</strong>{commitment.consequence}</p> : null}</article>;
}
