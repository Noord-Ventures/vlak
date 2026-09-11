import type { CommitReviewCommand, ReviewRecord } from "../record-review/domain/types.ts";

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

export interface ReviewedAction {
  actionId: string;
  revision: number;
  actionType: string;
  payload: JsonValue;
  createdAt: string;
}

export interface FrozenActionReview {
  action: Readonly<ReviewedAction>;
  payloadFingerprint: string;
  reviewRecord: ReviewRecord;
}

export function freezeActionForReview(action: ReviewedAction): FrozenActionReview {
  const payload = canonicalJson(action.payload);
  const payloadFingerprint = fingerprint(payload);
  const frozen = deepFreeze(structuredClone(action));
  return {
    action: frozen,
    payloadFingerprint,
    reviewRecord: {
      id: action.actionId,
      revision: action.revision,
      title: `Approve ${action.actionType}`,
      reference: payloadFingerprint,
      summary: payload,
      status: "ready-for-review",
      updatedAt: action.createdAt,
    },
  };
}

export function decisionCommand(review: FrozenActionReview, decision: "approved" | "rejected", idempotencyKey: string): CommitReviewCommand {
  return {
    recordId: review.reviewRecord.id,
    expectedRevision: review.reviewRecord.revision,
    idempotencyKey,
    changes: {},
    requestedStatus: decision,
  };
}

/** Call immediately before host-owned execution. */
export function assertApprovedPayload(review: FrozenActionReview, approvedRecord: ReviewRecord, payload: JsonValue): void {
  if (approvedRecord.id !== review.action.actionId || approvedRecord.status !== "approved") throw new Error("The action does not have a recorded approval.");
  if (approvedRecord.reference !== review.payloadFingerprint || fingerprint(canonicalJson(payload)) !== review.payloadFingerprint) {
    throw new Error("The action payload changed after review. Request a new approval.");
  }
}

export function canonicalJson(value: JsonValue): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(value[key]!)}`).join(",")}}`;
}

function fingerprint(value: string): string {
  let hash = 2166136261;
  for (const character of value) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return `payload-v1-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function deepFreeze<T>(value: T): Readonly<T> {
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}
