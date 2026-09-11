import type {
  CommitReviewCommand,
  ReviewOperationStatus,
  ReviewRecord,
  ReviewRecordDetail,
  ReviewWriteOutcome,
  UndoReviewCommand,
} from "../../domain/types.ts";

export const RECORD_REVIEW_HTTP_VERSION = "2026-09-11";
export const RECORD_REVIEW_MAX_BODY_BYTES = 16_384;

export interface ListRecordsResponse { records: ReviewRecord[] }
export interface GetRecordResponse extends ReviewRecordDetail {}
export type CommitRecordRequest = Omit<CommitReviewCommand, "recordId">;
export type UndoRecordRequest = Omit<UndoReviewCommand, "recordId">;
export type WriteRecordResponse = ReviewWriteOutcome;
export type GetOperationResponse = ReviewOperationStatus;

export const recordReviewHttpRoutes = [
  { method: "GET", path: "/api/records", purpose: "List records in the authenticated scope; accepts status and query parameters." },
  { method: "GET", path: "/api/records/:recordId", purpose: "Read one record and its bounded public history." },
  { method: "POST", path: "/api/records/:recordId/commits", purpose: "Validate and atomically commit one revision-checked change." },
  { method: "POST", path: "/api/records/:recordId/undo", purpose: "Apply a new revision that reverses the latest eligible commit." },
  { method: "GET", path: "/api/operations/:idempotencyKey", purpose: "Resolve a write whose client response was lost." },
] as const;

export function statusForOutcome(outcome: ReviewWriteOutcome): number {
  if (outcome.kind === "committed") return 200;
  if (outcome.kind === "validation-failed") return 422;
  if (outcome.kind === "conflict") return 409;
  if (outcome.kind === "not-found") return 404;
  return 503;
}
