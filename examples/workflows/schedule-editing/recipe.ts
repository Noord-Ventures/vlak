import type { CommitReviewCommand, ReviewRecord } from "../record-review/domain/types.ts";

export interface ScheduleEventDraft {
  id: string;
  revision: number;
  title: string;
  startsAt: string;
  endsAt: string;
  timeZone: string;
  allDay: boolean;
  updatedAt: string;
}

export function validateScheduleEvent(event: ScheduleEventDraft): string[] {
  const errors: string[] = [];
  if (!event.title.trim()) errors.push("Title is required.");
  const offsetDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
  const start = Date.parse(event.startsAt);
  const end = Date.parse(event.endsAt);
  if (!offsetDateTime.test(event.startsAt) || !offsetDateTime.test(event.endsAt) || !Number.isFinite(start) || !Number.isFinite(end)) errors.push("Start and end must be ISO date-times with offsets.");
  else if (end <= start) errors.push("End must be after start.");
  try { new Intl.DateTimeFormat("en", { timeZone: event.timeZone }).format(0); }
  catch { errors.push("Use a supported IANA time zone."); }
  if (event.allDay && (!event.startsAt.includes("T00:00:00") || !event.endsAt.includes("T00:00:00"))) errors.push("All-day event boundaries must be local midnight.");
  return errors;
}

export function scheduleReviewRecord(event: ScheduleEventDraft): ReviewRecord {
  const errors = validateScheduleEvent(event);
  if (errors.length) throw new Error(errors.join(" "));
  return {
    id: event.id,
    revision: event.revision,
    title: event.title,
    reference: event.timeZone,
    summary: `${event.startsAt}\n${event.endsAt}\n${event.allDay ? "All day" : "Timed"}`,
    status: "needs-information",
    updatedAt: event.updatedAt,
  };
}

export function scheduleEditCommand(current: ScheduleEventDraft, draft: ScheduleEventDraft, idempotencyKey: string): CommitReviewCommand {
  if (draft.id !== current.id || draft.revision !== current.revision) throw new Error("The draft must retain the event ID and expected revision.");
  const errors = validateScheduleEvent(draft);
  if (errors.length) throw new Error(errors.join(" "));
  const currentRecord = scheduleReviewRecord(current);
  const nextRecord = scheduleReviewRecord(draft);
  return {
    recordId: current.id,
    expectedRevision: current.revision,
    idempotencyKey,
    changes: {
      ...(currentRecord.title !== nextRecord.title ? { title: nextRecord.title } : {}),
      ...(currentRecord.reference !== nextRecord.reference ? { reference: nextRecord.reference } : {}),
      ...(currentRecord.summary !== nextRecord.summary ? { summary: nextRecord.summary } : {}),
    },
  };
}
