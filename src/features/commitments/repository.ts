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

const commitmentColumns = "id,user_id,title,description,deadline_at,priority,status,completed_at,created_at,updated_at";

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
  const commitments = (data ?? []) as CommitmentRecord[];
  return Promise.all(commitments.map(async (commitment) => {
    const effectiveStatus = canCompleteCommitment(commitment, now) ? "active" : commitment.status === "active" ? "missed" : commitment.status;
    const consequence = effectiveStatus === "missed" ? await getRevealedConsequence(supabase, commitment.id) : undefined;
    return toCommitmentView(commitment, now, consequence);
  }));
}

async function getRevealedConsequence(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.rpc("get_revealed_commitment_consequence", { p_id: id });
  if (error) throw databaseError("Unable to load commitments right now.");
  return typeof data === "string" ? data : null;
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
  const { data, error } = await supabase.rpc("create_commitment", {
    p_title: input.title,
    p_description: input.description,
    p_deadline_at: input.deadlineAt,
    p_priority: input.priority,
    p_consequence: input.consequence,
  });
  if (error) throw databaseError("Unable to create this commitment right now.");
  if (typeof data !== "string") throw new CommitmentAccessError("Unable to verify commitment ownership.");
  const commitment = await getCommitment(supabase, userId, data);
  return toCommitmentView(commitment);
}

export async function updateCommitment(supabase: SupabaseClient, userId: string, id: string, input: StoredCommitmentUpdate): Promise<CommitmentView> {
  const current = await getCommitment(supabase, userId, id);
  if (!canEditCommitment(current)) throw new CommitmentStateError("Only active commitments can be edited.");
  const { error } = await supabase.rpc("update_commitment", {
    p_id: id,
    p_title: input.title,
    p_description: input.description,
    p_deadline_at: input.deadlineAt,
    p_priority: input.priority,
    p_replace_consequence: input.consequence !== undefined,
    p_consequence: input.consequence ?? null,
  });
  if (error) throw databaseError("Unable to update this commitment right now.");
  return toCommitmentView(await getCommitment(supabase, userId, id));
}

export async function completeCommitment(supabase: SupabaseClient, userId: string, id: string): Promise<CommitmentView> {
  const current = await getCommitment(supabase, userId, id);
  if (current.status === "completed") return toCommitmentView(current);
  if (!canCompleteCommitment(current)) throw new CommitmentStateError("This commitment has already missed its deadline.");
  const { data, error } = await supabase.rpc("complete_commitment", { p_id: id });
  if (error) throw databaseError("Unable to complete this commitment right now.");
  if (data === "not_found") throw new CommitmentNotFoundError("Commitment not found.");
  if (data === "missed") throw new CommitmentStateError("This commitment has already missed its deadline.");
  if (data !== "completed" && data !== "already_completed") throw databaseError("Unable to complete this commitment right now.");
  return toCommitmentView(await getCommitment(supabase, userId, id));
}

export async function listCommitmentHistory(supabase: SupabaseClient, userId: string, now = new Date()): Promise<CommitmentView[]> {
  const commitments = await listCommitments(supabase, userId, now);
  return commitments.filter((commitment) => commitment.effectiveStatus !== "active");
}
