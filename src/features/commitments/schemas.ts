import { z } from "zod";
import { commitmentPriorities } from "@/features/commitments/types";

const localDeadline = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Choose a valid deadline.").refine((value) => {
  const [date, time] = value.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const candidate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  return candidate.getUTCFullYear() === year && candidate.getUTCMonth() === month - 1 && candidate.getUTCDate() === day && hour < 24 && minute < 60;
}, "Choose a valid deadline.");

export const commitmentInputSchema = z.object({
  title: z.string().trim().min(1, "Give this commitment a title.").max(160),
  description: z.string().trim().max(2000).optional().transform((value) => value || null),
  priority: z.enum(commitmentPriorities),
  deadline: localDeadline,
  consequence: z.string().trim().max(500).optional().transform((value) => value || null),
});

export type CommitmentInput = z.infer<typeof commitmentInputSchema>;
