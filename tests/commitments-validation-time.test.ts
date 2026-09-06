import assert from "node:assert/strict";
import test from "node:test";
import { commitmentInputSchema } from "../src/features/commitments/schemas.ts";
import { getUserDayRange, getUserToday, zonedDateTimeToUtc } from "../src/lib/time/user-time.ts";

const valid = { title: "Read chapter one", priority: "high", deadline: "2026-09-07T09:30" };

test("commitment input validates required fields and database-aligned length limits", () => {
  assert.equal(commitmentInputSchema.safeParse(valid).success, true);
  assert.equal(commitmentInputSchema.safeParse({ ...valid, title: " " }).success, false);
  assert.equal(commitmentInputSchema.safeParse({ ...valid, title: "x".repeat(161) }).success, false);
  assert.equal(commitmentInputSchema.safeParse({ ...valid, description: "x".repeat(2001) }).success, false);
  assert.equal(commitmentInputSchema.safeParse({ ...valid, consequence: "x".repeat(501) }).success, false);
  assert.equal(commitmentInputSchema.safeParse({ ...valid, priority: "urgent" }).success, false);
  assert.equal(commitmentInputSchema.safeParse({ ...valid, deadline: "2026-02-30T09:30" }).success, false);
});

test("local deadlines convert through the configured IANA timezone", () => {
  assert.equal(zonedDateTimeToUtc("2026-09-07T00:15", "Asia/Kolkata"), "2026-09-06T18:45:00.000Z");
  assert.equal(zonedDateTimeToUtc("2026-09-07T00:15", "America/New_York"), "2026-09-07T04:15:00.000Z");
});

test("user day boundaries use local midnight rather than server midnight", () => {
  const now = new Date("2026-09-06T20:00:00.000Z");
  assert.equal(getUserToday("Asia/Kolkata", now), "2026-09-07");
  assert.deepEqual(getUserDayRange("Asia/Kolkata", now), {
    start: "2026-09-06T18:30:00.000Z",
    endExclusive: "2026-09-07T18:30:00.000Z",
  });
});
