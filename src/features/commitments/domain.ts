import type { CommitmentRecord, CommitmentStatus, CommitmentView } from "@/features/commitments/types";

/**
 * Status is evaluated at read time. We deliberately do not mutate a row simply
 * because a browser happened to load after its deadline; a future scheduler can
 * persist missed status using this same rule.
 */
export function getEffectiveCommitmentStatus(commitment: Pick<CommitmentRecord, "status" | "deadline_at">, now = new Date()): CommitmentStatus {
  if (commitment.status !== "active") return commitment.status;
  return new Date(commitment.deadline_at).getTime() < now.getTime() ? "missed" : "active";
}

export function toCommitmentView(commitment: CommitmentRecord, now = new Date(), consequence?: string | null): CommitmentView {
  const effectiveStatus = getEffectiveCommitmentStatus(commitment, now);
  const safeCommitment = {
    id: commitment.id,
    title: commitment.title,
    description: commitment.description,
    deadline_at: commitment.deadline_at,
    priority: commitment.priority,
    status: commitment.status,
    completed_at: commitment.completed_at,
    created_at: commitment.created_at,
    updated_at: commitment.updated_at,
  };
  return {
    ...safeCommitment,
    effectiveStatus,
    ...(effectiveStatus === "missed" && consequence ? { consequence } : {}),
  };
}

export function canCompleteCommitment(commitment: Pick<CommitmentRecord, "status" | "deadline_at">, now = new Date()) {
  return getEffectiveCommitmentStatus(commitment, now) === "active";
}

export function canEditCommitment(commitment: Pick<CommitmentRecord, "status" | "deadline_at">, now = new Date()) {
  return getEffectiveCommitmentStatus(commitment, now) === "active";
}
