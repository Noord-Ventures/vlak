import { MemoryReviewAdapter } from "../record-review/adapters/memory.ts";
import { scheduleEditCommand, scheduleReviewRecord, type ScheduleEventDraft } from "./recipe.ts";

const current: ScheduleEventDraft = {
  id: "event-204",
  revision: 1,
  title: "Site walk",
  startsAt: "2026-09-14T09:00:00+02:00",
  endsAt: "2026-09-14T10:00:00+02:00",
  timeZone: "Europe/Amsterdam",
  allDay: false,
  updatedAt: "2026-09-11T10:00:00.000Z",
};
const draft = { ...current, endsAt: "2026-09-14T10:30:00+02:00" };
const principal = { scopeId: "schedule-example", actorLabel: "Local scheduler", canDecide: false };
const adapter = new MemoryReviewAdapter({ fixtures: { [principal.scopeId]: [scheduleReviewRecord(current)] } });
const outcome = await adapter.commit(principal, scheduleEditCommand(current, draft, "schedule-example-1"));
if (outcome.kind !== "committed") throw new Error(`Schedule edit failed: ${outcome.kind}`);
process.stdout.write(`${JSON.stringify({ outcome: outcome.kind, revision: outcome.record.revision, summary: outcome.record.summary }, null, 2)}\n`);
