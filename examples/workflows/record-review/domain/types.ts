export const REVIEW_STATUSES = ["needs-information", "ready-for-review", "approved", "rejected"] as const;

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];
export type ReviewEditableField = "title" | "reference" | "summary";

export interface ReviewRecord {
  id: string;
  revision: number;
  title: string;
  reference: string;
  summary: string;
  status: ReviewStatus;
  updatedAt: string;
}

export interface ReviewRecordDetail {
  record: ReviewRecord;
  history: ReviewHistoryEntry[];
}

export interface ReviewHistoryEntry {
  operationId: string;
  revision: number;
  action: "commit" | "undo";
  changedFields: string[];
  at: string;
  actorLabel: string;
  reversible: boolean;
}

export interface ReviewPrincipal {
  /** Server-derived ownership namespace. Never accept this value from an HTTP body. */
  scopeId: string;
  /** Server-derived audit label. */
  actorLabel: string;
  canDecide: boolean;
}

export type ReviewChangeSet = Partial<Pick<ReviewRecord, ReviewEditableField>>;

export interface CommitReviewCommand {
  recordId: string;
  expectedRevision: number;
  idempotencyKey: string;
  changes: ReviewChangeSet;
  requestedStatus?: ReviewStatus;
}

export interface UndoReviewCommand {
  recordId: string;
  expectedRevision: number;
  idempotencyKey: string;
  targetOperationId: string;
}

export type ReviewFieldErrors = Partial<Record<ReviewEditableField | "status" | "request" | "idempotencyKey", string>>;

export type ReviewWriteOutcome =
  | { kind: "committed"; operationId: string; record: ReviewRecord; replayed: boolean }
  | { kind: "validation-failed"; fieldErrors: ReviewFieldErrors }
  | { kind: "conflict"; current: ReviewRecord; message: string }
  | { kind: "not-found" }
  | { kind: "unavailable"; code: string; retryable: true; message: string };

export type ReviewOperationStatus =
  | { kind: "unknown"; idempotencyKey: string }
  | { kind: "known"; idempotencyKey: string; outcome: ReviewWriteOutcome };

export interface ReviewListFilter {
  status?: ReviewStatus;
  query?: string;
}

export interface RecordReviewAdapter {
  list(principal: ReviewPrincipal, filter?: ReviewListFilter): Promise<ReviewRecord[]>;
  get(principal: ReviewPrincipal, recordId: string): Promise<ReviewRecordDetail | null>;
  commit(principal: ReviewPrincipal, command: CommitReviewCommand): Promise<ReviewWriteOutcome>;
  undo(principal: ReviewPrincipal, command: UndoReviewCommand): Promise<ReviewWriteOutcome>;
  getOperation(principal: ReviewPrincipal, idempotencyKey: string): Promise<ReviewOperationStatus>;
}

export interface AuthenticatedOrganizationAdapter<RequestLike = unknown> {
  /** Authenticate the request and derive its organization scope. */
  authenticate(request: RequestLike): Promise<ReviewPrincipal | null>;
}

export interface Clock {
  now(): string;
}

export const systemClock: Clock = { now: () => new Date().toISOString() };
