import type {
  CommitReviewCommand,
  ReviewChangeSet,
  ReviewFieldErrors,
  ReviewPrincipal,
  ReviewRecord,
  ReviewStatus,
} from "./types.ts";

const MAX_ID_LENGTH = 128;
const MAX_CHANGE_FIELDS = 3;
const limits = { title: 120, reference: 80, summary: 4_000 } as const;

export function isOpaqueId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= MAX_ID_LENGTH && /^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(value);
}

export function isReviewStatus(value: unknown): value is ReviewStatus {
  return value === "needs-information" || value === "ready-for-review" || value === "approved" || value === "rejected";
}

export function validateCommandShape(command: CommitReviewCommand): ReviewFieldErrors {
  const errors: ReviewFieldErrors = {};
  if (!isOpaqueId(command.recordId)) errors.request = "Use a valid opaque record ID.";
  if (!Number.isSafeInteger(command.expectedRevision) || command.expectedRevision < 1) errors.request = "Expected revision must be a positive integer.";
  if (!isOpaqueId(command.idempotencyKey)) errors.idempotencyKey = "Use an idempotency key between 1 and 128 safe characters.";
  if (!command.changes || typeof command.changes !== "object" || Array.isArray(command.changes)) {
    errors.request = "Changes must be an object.";
    return errors;
  }
  const keys = Object.keys(command.changes);
  if (keys.length > MAX_CHANGE_FIELDS || keys.some(key => !Object.hasOwn(limits, key))) errors.request = "Changes may contain title, reference, and summary only.";
  for (const field of Object.keys(limits) as Array<keyof typeof limits>) {
    const value = command.changes[field];
    if (value === undefined) continue;
    if (typeof value !== "string") errors[field] = `${field} must be text.`;
    else if (!value.trim()) errors[field] = `${field} is required.`;
    else if (value.length > limits[field]) errors[field] = `${field} must be ${limits[field].toLocaleString("en")} characters or fewer.`;
  }
  if (command.requestedStatus !== undefined && !isReviewStatus(command.requestedStatus)) errors.status = "Choose a supported status.";
  if (!keys.length && command.requestedStatus === undefined) errors.request = "Submit at least one field or a status transition.";
  return errors;
}

export function validateRecord(record: ReviewRecord): ReviewFieldErrors {
  return validateCommandShape({
    recordId: record.id,
    expectedRevision: Math.max(record.revision, 1),
    idempotencyKey: "record-validation",
    changes: { title: record.title, reference: record.reference, summary: record.summary },
    requestedStatus: record.status,
  });
}

export function validateTransition(current: ReviewRecord, requestedStatus: ReviewStatus, principal: ReviewPrincipal, changes: ReviewChangeSet): string | null {
  if (requestedStatus === current.status) return null;
  if ((requestedStatus === "approved" || requestedStatus === "rejected") && !principal.canDecide) return "This actor cannot make a review decision.";
  const allowed: Record<ReviewStatus, readonly ReviewStatus[]> = {
    "needs-information": ["ready-for-review"],
    "ready-for-review": ["needs-information", "approved", "rejected"],
    approved: [],
    rejected: [],
  };
  if (!allowed[current.status].includes(requestedStatus)) return `Cannot move from ${current.status} to ${requestedStatus}.`;
  if ((requestedStatus === "approved" || requestedStatus === "rejected") && Object.keys(changes).length > 0) {
    return "Decide against the reviewed revision without changing its fields.";
  }
  return null;
}

export type EvaluatedCommit =
  | { kind: "accepted"; record: ReviewRecord; changedFields: string[] }
  | { kind: "validation-failed"; fieldErrors: ReviewFieldErrors };

export function evaluateCommit(current: ReviewRecord, command: CommitReviewCommand, principal: ReviewPrincipal, now: string): EvaluatedCommit {
  const fieldErrors = validateCommandShape(command);
  const requestedStatus = command.requestedStatus ?? current.status;
  const transitionError = validateTransition(current, requestedStatus, principal, command.changes);
  if (transitionError) fieldErrors.status = transitionError;
  const candidate: ReviewRecord = { ...current, ...command.changes, status: requestedStatus };
  Object.assign(fieldErrors, validateRecord(candidate));
  if (Object.keys(fieldErrors).length > 0) return { kind: "validation-failed", fieldErrors };

  const changedFields = [...Object.keys(command.changes).filter(field => current[field as keyof ReviewChangeSet] !== command.changes[field as keyof ReviewChangeSet])];
  if (requestedStatus !== current.status) changedFields.push("status");
  if (!changedFields.length) return { kind: "validation-failed", fieldErrors: { request: "The command does not change the record." } };
  return {
    kind: "accepted",
    changedFields,
    record: { ...candidate, revision: current.revision + 1, updatedAt: now },
  };
}

export function stableCommandFingerprint(command: CommitReviewCommand | { recordId: string; expectedRevision: number; targetOperationId: string }): string {
  if ("changes" in command) {
    return JSON.stringify({
      kind: "commit",
      recordId: command.recordId,
      expectedRevision: command.expectedRevision,
      changes: Object.fromEntries(Object.entries(command.changes).sort(([a], [b]) => a.localeCompare(b))),
      requestedStatus: command.requestedStatus ?? null,
    });
  }
  return JSON.stringify({ kind: "undo", ...command });
}
