import assert from "node:assert/strict";
import test from "node:test";
import { canCompleteCommitment, getEffectiveCommitmentStatus, toCommitmentView } from "../src/features/commitments/domain.ts";
import type { CommitmentRecord } from "../src/features/commitments/types.ts";

const now = new Date("2026-09-06T12:00:00.000Z");
function commitment(overrides: Partial<CommitmentRecord> = {}): CommitmentRecord {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    user_id: "22222222-2222-2222-2222-222222222222",
    title: "Write tests",
    description: null,
    deadline_at: "2026-09-06T12:01:00.000Z",
    priority: "medium",
    status: "active",
    completed_at: null,
    created_at: "2026-09-06T10:00:00.000Z",
    updated_at: "2026-09-06T10:00:00.000Z",
    ...overrides,
  };
}

test("active commitments remain active before and exactly at deadline", () => {
  assert.equal(getEffectiveCommitmentStatus(commitment(), now), "active");
  assert.equal(getEffectiveCommitmentStatus(commitment({ deadline_at: now.toISOString() }), now), "active");
  assert.equal(canCompleteCommitment(commitment({ deadline_at: now.toISOString() }), now), true);
});

test("active commitments become missed only after deadline", () => {
  const overdue = commitment({ deadline_at: "2026-09-06T11:59:59.999Z" });
  assert.equal(getEffectiveCommitmentStatus(overdue, now), "missed");
  assert.equal(canCompleteCommitment(overdue, now), false);
});

test("completed records remain completed regardless of deadline", () => {
  const completed = commitment({ status: "completed", completed_at: "2026-09-06T11:00:00.000Z", deadline_at: "2026-09-06T11:30:00.000Z" });
  assert.equal(getEffectiveCommitmentStatus(completed, now), "completed");
  assert.equal(canCompleteCommitment(completed, now), false);
});

test("only an effectively missed view receives a supplied consequence", () => {
  const active = toCommitmentView(commitment(), now, "Do 20 push-ups");
  const completed = toCommitmentView(commitment({ status: "completed", completed_at: now.toISOString() }), now, "Do 20 push-ups");
  const missed = toCommitmentView(commitment({ deadline_at: "2026-09-06T11:00:00.000Z" }), now, "Do 20 push-ups");
  assert.equal(active.consequence, undefined);
  assert.equal(completed.consequence, undefined);
  assert.equal(missed.consequence, "Do 20 push-ups");
  assert.equal("user_id" in missed, false);
});
