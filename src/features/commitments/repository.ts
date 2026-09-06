import { canCompleteCommitment, canEditCommitment, toCommitmentView } from "@/features/commitments/domain";
import type { CommitmentInput } from "@/features/commitments/schemas";
import type { CommitmentRecord, CommitmentView } from "@/features/commitments/types";
import type { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

type StoredCommitmentInput = Omit<CommitmentInput, "deadline"> & {
  deadlineAt: string;
};

type StoredCommitmentUpdate = Omit<StoredCommitmentInput, "consequence"> & {
  consequence?: string | null;
};

const commitmentColumns = "id,user_id,title,description,deadline_at,priority,status,completed_at,consequence,created_at,updated_at";

export class CommitmentAccessError extends Error {}
export class CommitmentNotFoundError extends CommitmentAccessError {}
export class CommitmentStateError extends CommitmentAccessError {}

function databaseError(message: string) {
  return new CommitmentAccessError(message);
}

export async function listCommitments(supabase: SupabaseClient, userId: string, now = new Date()): Promise<CommitmentView[]> {
  const { data, error } = await supabase
    .from("commitments")
    .select(commitmentColumns)
    .eq("user_id", userId)
    .order("deadline_at", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw databaseError("Unable to load commitments right now.");
  return ((data ?? []) as CommitmentRecord[]).map((commitment) => toCommitmentView(commitment, now));
}

export async function getCommitment(supabase: SupabaseClient, userId: string, id: string): Promise<CommitmentRecord> {
  const { data, error } = await supabase
    .from("commitments")
    .select(commitmentColumns)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw databaseError("Unable to load this commitment right now.");
  if (!data) throw new CommitmentNotFoundError("Commitment not found.");
  return data as CommitmentRecord;
}

export async function createCommitment(supabase: SupabaseClient, userId: string, input: StoredCommitmentInput): Promise<CommitmentView> {
  const { data, error } = await supabase
    .from("commitments")
    .insert({
      title: input.title,
      description: input.description,
      priority: input.priority,
      deadline_at: input.deadlineAt,
      consequence: input.consequence,
    })
    .select(commitmentColumns)
    .single();
  if (error) throw databaseError("Unable to create this commitment right now.");
  const commitment = data as CommitmentRecord;
  if (commitment.user_id !== userId) throw new CommitmentAccessError("Unable to verify commitment ownership.");
  return toCommitmentView(commitment);
}

export async function updateCommitment(supabase: SupabaseClient, userId: string, id: string, input: StoredCommitmentUpdate): Promise<CommitmentView> {
  const current = await getCommitment(supabase, userId, id);
  if (!canEditCommitment(current)) throw new CommitmentStateError("Only active commitments can be edited.");
  const { data, error } = await supabase
    .from("commitments")
    .update({
      title: input.title,
      description: input.description,
      priority: input.priority,
      deadline_at: input.deadlineAt,
      ...(input.consequence !== undefined ? { consequence: input.consequence } : {}),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select(commitmentColumns)
    .maybeSingle();
  if (error) throw databaseError("Unable to update this commitment right now.");
  if (!data) throw new CommitmentNotFoundError("Commitment not found.");
  return toCommitmentView(data as CommitmentRecord);
}

export async function completeCommitment(supabase: SupabaseClient, userId: string, id: string): Promise<CommitmentView> {
  const current = await getCommitment(supabase, userId, id);
  if (current.status === "completed") return toCommitmentView(current);
  if (!canCompleteCommitment(current)) throw new CommitmentStateError("This commitment has already missed its deadline.");
  const { data, error } = await supabase
    .from("commitments")
    .update({ status: "completed" })
    .eq("id", id)
    .eq("user_id", userId)
    .select(commitmentColumns)
    .maybeSingle();
  if (error) throw databaseError("Unable to complete this commitment right now.");
  if (!data) throw new CommitmentNotFoundError("Commitment not found.");
  return toCommitmentView(data as CommitmentRecord);
}

export async function listCommitmentHistory(supabase: SupabaseClient, userId: string, now = new Date()): Promise<CommitmentView[]> {
  const commitments = await listCommitments(supabase, userId, now);
  return commitments.filter((commitment) => commitment.effectiveStatus !== "active");
}
