import assert from "node:assert/strict";
import { test } from "node:test";
import { assertApprovedPayload, decisionCommand, freezeActionForReview } from "../../action-approval/recipe.ts";
import { scheduleEditCommand, validateScheduleEvent } from "../../schedule-editing/recipe.ts";

test("approval binds the frozen payload version", () => {
  const review = freezeActionForReview({ actionId: "action-1", revision: 4, actionType: "create task", payload: { title: "Review notes" }, createdAt: "2026-09-11T10:00:00.000Z" });
  const command = decisionCommand(review, "approved", "approve-1");
  const approved = { ...review.reviewRecord, revision: 5, status: "approved" as const };
  assert.equal(command.expectedRevision, 4);
  assert.doesNotThrow(() => assertApprovedPayload(review, approved, { title: "Review notes" }));
  assert.throws(() => assertApprovedPayload(review, approved, { title: "Changed notes" }), /changed after review/);
});

test("schedule recipe validates and emits a revision-checked command", () => {
  const current = { id: "event-1", revision: 2, title: "Site walk", startsAt: "2026-09-14T09:00:00+02:00", endsAt: "2026-09-14T10:00:00+02:00", timeZone: "Europe/Amsterdam", allDay: false, updatedAt: "2026-09-11T10:00:00.000Z" };
  assert.deepEqual(validateScheduleEvent(current), []);
  const command = scheduleEditCommand(current, { ...current, endsAt: "2026-09-14T10:30:00+02:00" }, "schedule-1");
  assert.equal(command.expectedRevision, 2);
  assert.match(command.changes.summary ?? "", /10:30/);
  assert.match(validateScheduleEvent({ ...current, endsAt: current.startsAt })[0] ?? "", /after start/);
  assert.match(validateScheduleEvent({ ...current, startsAt: "2026-09-14T09:00:00" })[0] ?? "", /offsets/);
  assert.throws(() => scheduleEditCommand(current, { ...current, id: "event-2" }, "schedule-2"), /retain the event ID/);
});
