import type { ReviewListFilter, ReviewOperationStatus, ReviewRecord, ReviewRecordDetail, ReviewStatus, ReviewWriteOutcome } from "../../domain/types.ts";
import type { CommitRecordRequest, UndoRecordRequest } from "./contract.ts";

export type TransportWriteResult = ReviewWriteOutcome | { kind: "outcome-unknown"; idempotencyKey: string; message: string };

export class RecordReviewHttpClient {
  readonly baseUrl: string;
  constructor(baseUrl = "") { this.baseUrl = baseUrl; }

  async list(filter: ReviewListFilter = {}): Promise<ReviewRecord[]> {
    const query = new URLSearchParams();
    if (filter.query) query.set("query", filter.query);
    if (filter.status) query.set("status", filter.status);
    const response = await this.#json<{ records: ReviewRecord[] }>(`/api/records?${query}`);
    return response.records;
  }

  get(recordId: string): Promise<ReviewRecordDetail> {
    return this.#json(`/api/records/${encodeURIComponent(recordId)}`);
  }

  async commit(recordId: string, request: CommitRecordRequest): Promise<TransportWriteResult> {
    return this.#write(`/api/records/${encodeURIComponent(recordId)}/commits`, request, request.idempotencyKey);
  }

  async undo(recordId: string, request: UndoRecordRequest): Promise<TransportWriteResult> {
    return this.#write(`/api/records/${encodeURIComponent(recordId)}/undo`, request, request.idempotencyKey);
  }

  getOperation(idempotencyKey: string): Promise<ReviewOperationStatus> {
    return this.#json(`/api/operations/${encodeURIComponent(idempotencyKey)}`);
  }

  async #write(path: string, body: CommitRecordRequest | UndoRecordRequest, idempotencyKey: string): Promise<TransportWriteResult> {
    try {
      return await this.#json(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    } catch (error) {
      if (error instanceof HttpContractError) throw error;
      return { kind: "outcome-unknown", idempotencyKey, message: "The response was lost. Check operation status before retrying." };
    }
  }

  async #json<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, init);
    const body = await response.json().catch(() => null);
    if (!body || typeof body !== "object") throw new Error("The server returned an invalid JSON response.");
    if (!response.ok && !("kind" in body)) throw new HttpContractError(response.status, "The server rejected the request.");
    return body as T;
  }
}

export class HttpContractError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpContractError";
    this.status = status;
  }
}

export function asStatusFilter(value: string): ReviewStatus | undefined {
  return value === "needs-information" || value === "ready-for-review" || value === "approved" || value === "rejected" ? value : undefined;
}
