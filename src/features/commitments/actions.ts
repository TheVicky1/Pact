"use server";

import { revalidatePath } from "next/cache";
import { commitmentInputSchema } from "@/features/commitments/schemas";
import { CommitmentAccessError, completeCommitment, createCommitment, updateCommitment } from "@/features/commitments/repository";
import { requireUser } from "@/features/auth/require-user";
import { DEFAULT_TIMEZONE, zonedDateTimeToUtc } from "@/lib/time/user-time";

export type CommitmentActionResult = { error?: string };

async function getCommitmentContext() {
  const { supabase, userId } = await requireUser();
  const { data, error } = await supabase.from("profiles").select("timezone").eq("id", userId).maybeSingle();
  if (error) throw new CommitmentAccessError("Unable to load your timezone right now.");
  return { supabase, userId, timezone: data?.timezone ?? DEFAULT_TIMEZONE };
}

function messageFor(error: unknown) {
  return error instanceof CommitmentAccessError ? error.message : "Something went wrong. Please try again.";
}

function parseInput(rawInput: unknown, timezone: string) {
  const parsed = commitmentInputSchema.safeParse(rawInput);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the commitment details." } as const;
  const deadlineAt = zonedDateTimeToUtc(parsed.data.deadline, timezone);
  if (new Date(deadlineAt).getTime() <= Date.now()) return { error: "Choose a deadline in the future." } as const;
  return { data: { ...parsed.data, deadlineAt } } as const;
}

export async function createCommitmentAction(rawInput: unknown): Promise<CommitmentActionResult> {
  try {
    const context = await getCommitmentContext();
    const parsed = parseInput(rawInput, context.timezone);
    if ("error" in parsed) return parsed;
    await createCommitment(context.supabase, context.userId, parsed.data);
    revalidatePath("/app");
    revalidatePath("/app/commitments");
    return {};
  } catch (error) {
    return { error: messageFor(error) };
  }
}

export async function updateCommitmentAction(id: string, rawInput: unknown): Promise<CommitmentActionResult> {
  try {
    const context = await getCommitmentContext();
    const input = rawInput && typeof rawInput === "object" ? rawInput as Record<string, unknown> : {};
    const replacementConsequence = typeof input.newConsequence === "string" ? input.newConsequence.trim() : "";
    const editableInput = { ...input };
    delete editableInput.newConsequence;
    const parsed = parseInput(editableInput, context.timezone);
    if ("error" in parsed) return parsed;
    await updateCommitment(context.supabase, context.userId, id, {
      ...parsed.data,
      ...(replacementConsequence ? { consequence: replacementConsequence } : {}),
    });
    revalidatePath("/app");
    revalidatePath("/app/commitments");
    return {};
  } catch (error) {
    return { error: messageFor(error) };
  }
}

export async function completeCommitmentAction(id: string): Promise<CommitmentActionResult> {
  try {
    const { supabase, userId } = await requireUser();
    await completeCommitment(supabase, userId, id);
    revalidatePath("/app");
    revalidatePath("/app/commitments");
    return {};
  } catch (error) {
    return { error: messageFor(error) };
  }
}
