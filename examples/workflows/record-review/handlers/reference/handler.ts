import type { AuthenticatedOrganizationAdapter, CommitReviewCommand, RecordReviewAdapter, ReviewChangeSet, ReviewPrincipal, UndoReviewCommand } from "../../domain/types.ts";
import { isReviewStatus } from "../../domain/review.ts";
import { RECORD_REVIEW_HTTP_VERSION, statusForOutcome } from "../../transports/http/contract.ts";

export interface ReferenceHttpRequest {
  method: string;
  url: string;
  headers: Readonly<Record<string, string | undefined>>;
  body?: unknown;
}

export interface ReferenceHttpResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
}

export interface ReferenceHandlerOptions {
  adapter: RecordReviewAdapter;
  ownership: AuthenticatedOrganizationAdapter<ReferenceHttpRequest>;
}

const jsonHeaders = { "content-type": "application/json; charset=utf-8", "x-vlak-workflow-version": RECORD_REVIEW_HTTP_VERSION };
const response = (status: number, body: unknown): ReferenceHttpResponse => ({ status, headers: jsonHeaders, body });

/**
 * Framework-neutral reference handler. The ownership adapter is the deliberate
 * integration boundary: it must derive principal scope and permissions from
 * trusted authentication state, never from request JSON.
 */
export function createRecordReviewHandler({ adapter, ownership }: ReferenceHandlerOptions) {
  return async (request: ReferenceHttpRequest): Promise<ReferenceHttpResponse> => {
    const principal = await ownership.authenticate(request);
    if (!principal) return response(401, { error: "authentication-required" });
    const url = new URL(request.url, "http://record-review.local");
    const parts = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);

    if (request.method === "GET" && url.pathname === "/api/records") {
      const rawStatus = url.searchParams.get("status");
      if (rawStatus && !isReviewStatus(rawStatus)) return response(400, { error: "invalid-status-filter" });
      const status = rawStatus && isReviewStatus(rawStatus) ? rawStatus : undefined;
      return response(200, { records: await adapter.list(principal, { status, query: url.searchParams.get("query") ?? undefined }) });
    }
    if (parts[0] !== "api") return response(404, { error: "route-not-found" });
    if (request.method === "GET" && parts[1] === "records" && parts.length === 3) {
      const detail = await adapter.get(principal, parts[2]!);
      return detail ? response(200, detail) : response(404, { error: "record-not-found" });
    }
    if (request.method === "POST" && parts[1] === "records" && parts.length === 4 && parts[3] === "commits") {
      const body = objectBody(request.body);
      const command = commitCommand(parts[2]!, body);
      if (!command) return response(422, { kind: "validation-failed", fieldErrors: { request: "Commit requires an expected revision, idempotency key, and changes object." } });
      const outcome = await adapter.commit(principal, command);
      return response(statusForOutcome(outcome), outcome);
    }
    if (request.method === "POST" && parts[1] === "records" && parts.length === 4 && parts[3] === "undo") {
      const body = objectBody(request.body);
      const command = undoCommand(parts[2]!, body);
      if (!command) return response(422, { kind: "validation-failed", fieldErrors: { request: "Undo requires an expected revision, idempotency key, and target operation." } });
      const outcome = await adapter.undo(principal, command);
      return response(statusForOutcome(outcome), outcome);
    }
    if (request.method === "GET" && parts[1] === "operations" && parts.length === 3) {
      return response(200, await adapter.getOperation(principal, parts[2]!));
    }
    return response(404, { error: "route-not-found" });
  };
}

function objectBody(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function commitCommand(recordId: string, body: Record<string, unknown>): CommitReviewCommand | null {
  if (!Number.isSafeInteger(body.expectedRevision) || typeof body.idempotencyKey !== "string" || !body.changes || typeof body.changes !== "object" || Array.isArray(body.changes)) return null;
  return {
    recordId,
    expectedRevision: body.expectedRevision as number,
    idempotencyKey: body.idempotencyKey,
    changes: body.changes as ReviewChangeSet,
    ...(body.requestedStatus !== undefined ? { requestedStatus: body.requestedStatus as CommitReviewCommand["requestedStatus"] } : {}),
  };
}

function undoCommand(recordId: string, body: Record<string, unknown>): UndoReviewCommand | null {
  if (!Number.isSafeInteger(body.expectedRevision) || typeof body.idempotencyKey !== "string" || typeof body.targetOperationId !== "string") return null;
  return { recordId, expectedRevision: body.expectedRevision as number, idempotencyKey: body.idempotencyKey, targetOperationId: body.targetOperationId };
}

/** Use only for a single-user local reference process. */
export function fixedLocalOwnership(principal: ReviewPrincipal): AuthenticatedOrganizationAdapter<ReferenceHttpRequest> {
  return { authenticate: async () => principal };
}
