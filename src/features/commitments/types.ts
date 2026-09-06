export const commitmentPriorities = ["low", "medium", "high"] as const;
export const commitmentStatuses = ["active", "completed", "missed"] as const;

export type CommitmentPriority = (typeof commitmentPriorities)[number];
export type CommitmentStatus = (typeof commitmentStatuses)[number];

export type CommitmentRecord = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  deadline_at: string;
  priority: CommitmentPriority;
  status: CommitmentStatus;
  completed_at: string | null;
  consequence: string | null;
  created_at: string;
  updated_at: string;
};

export type CommitmentView = Omit<CommitmentRecord, "user_id" | "consequence"> & {
  effectiveStatus: CommitmentStatus;
  consequence?: string;
};
