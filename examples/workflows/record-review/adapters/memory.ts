import { evaluateCommit, isOpaqueId, stableCommandFingerprint } from "../domain/review.ts";
import type {
  Clock,
  CommitReviewCommand,
  RecordReviewAdapter,
  ReviewHistoryEntry,
  ReviewListFilter,
  ReviewOperationStatus,
  ReviewPrincipal,
  ReviewRecord,
  ReviewRecordDetail,
  ReviewWriteOutcome,
  UndoReviewCommand,
} from "../domain/types.ts";
import { systemClock } from "../domain/types.ts";

interface StoredHistoryEntry extends ReviewHistoryEntry {
  before: ReviewRecord;
  after: ReviewRecord;
}

interface StoredOperation {
  fingerprint: string;
  outcome: ReviewWriteOutcome;
}

interface StoredRecord {
  record: ReviewRecord;
  history: StoredHistoryEntry[];
}

interface ScopeState {
  records: Map<string, StoredRecord>;
  operations: Map<string, StoredOperation>;
}

export interface MemoryReviewSnapshot {
  schemaVersion: 1;
  scopes: Record<string, {
    records: Array<{ record: ReviewRecord; history: StoredHistoryEntry[] }>;
    operations: Array<[string, StoredOperation]>;
  }>;
}

export interface MemoryReviewOptions {
  fixtures?: Record<string, ReviewRecord[]>;
  clock?: Clock;
  historyLimit?: number;
  snapshot?: MemoryReviewSnapshot;
}

const copy = <T>(value: T): T => structuredClone(value);

export class MemoryReviewAdapter implements RecordReviewAdapter {
  readonly #scopes = new Map<string, ScopeState>();
  readonly #clock: Clock;
  readonly #historyLimit: number;

  constructor(options: MemoryReviewOptions = {}) {
    this.#clock = options.clock ?? systemClock;
    this.#historyLimit = Math.max(1, Math.min(options.historyLimit ?? 20, 100));
    if (options.snapshot) this.#loadSnapshot(options.snapshot);
    for (const [scopeId, records] of Object.entries(options.fixtures ?? {})) {
      const scope = this.#scope(scopeId);
      for (const record of records) {
        if (!scope.records.has(record.id)) scope.records.set(record.id, { record: copy(record), history: [] });
      }
    }
  }

  async list(principal: ReviewPrincipal, filter: ReviewListFilter = {}): Promise<ReviewRecord[]> {
    const query = filter.query?.trim().toLocaleLowerCase("en") ?? "";
    return [...this.#scope(principal.scopeId).records.values()]
      .map(item => item.record)
      .filter(record => !filter.status || record.status === filter.status)
      .filter(record => !query || `${record.title} ${record.reference} ${record.summary}`.toLocaleLowerCase("en").includes(query))
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(copy);
  }

  async get(principal: ReviewPrincipal, recordId: string): Promise<ReviewRecordDetail | null> {
    const stored = this.#scope(principal.scopeId).records.get(recordId);
    return stored ? { record: copy(stored.record), history: stored.history.map(this.#publicHistory) } : null;
  }

  async commit(principal: ReviewPrincipal, command: CommitReviewCommand): Promise<ReviewWriteOutcome> {
    const scope = this.#scope(principal.scopeId);
    const fingerprint = stableCommandFingerprint(command);
    const replay = this.#replay(scope, command.idempotencyKey, fingerprint);
    if (replay) return replay;
    const stored = scope.records.get(command.recordId);
    if (!stored) return this.#remember(scope, command.idempotencyKey, fingerprint, { kind: "not-found" });
    if (stored.record.revision !== command.expectedRevision) {
      return this.#remember(scope, command.idempotencyKey, fingerprint, { kind: "conflict", current: copy(stored.record), message: "The record changed after this draft was opened." });
    }
    const evaluated = evaluateCommit(stored.record, command, principal, this.#clock.now());
    if (evaluated.kind === "validation-failed") return this.#remember(scope, command.idempotencyKey, fingerprint, evaluated);
    const operationId = command.idempotencyKey;
    const before = copy(stored.record);
    stored.record = copy(evaluated.record);
    stored.history.push({
      operationId,
      revision: evaluated.record.revision,
      action: "commit",
      changedFields: evaluated.changedFields,
      at: evaluated.record.updatedAt,
      actorLabel: principal.actorLabel,
      reversible: true,
      before,
      after: copy(evaluated.record),
    });
    this.#trimHistory(stored);
    return this.#remember(scope, command.idempotencyKey, fingerprint, { kind: "committed", operationId, record: copy(evaluated.record), replayed: false });
  }

  async undo(principal: ReviewPrincipal, command: UndoReviewCommand): Promise<ReviewWriteOutcome> {
    const scope = this.#scope(principal.scopeId);
    const fingerprint = stableCommandFingerprint(command);
    const replay = this.#replay(scope, command.idempotencyKey, fingerprint);
    if (replay) return replay;
    if (!isOpaqueId(command.recordId) || !isOpaqueId(command.idempotencyKey) || !isOpaqueId(command.targetOperationId) || !Number.isSafeInteger(command.expectedRevision)) {
      return this.#remember(scope, command.idempotencyKey, fingerprint, { kind: "validation-failed", fieldErrors: { request: "Undo requires a record, current revision, target operation, and new idempotency key." } });
    }
    const stored = scope.records.get(command.recordId);
    if (!stored) return this.#remember(scope, command.idempotencyKey, fingerprint, { kind: "not-found" });
    if (stored.record.revision !== command.expectedRevision) {
      return this.#remember(scope, command.idempotencyKey, fingerprint, { kind: "conflict", current: copy(stored.record), message: "The record changed before undo could be applied." });
    }
    const target = stored.history.find(entry => entry.operationId === command.targetOperationId && entry.action === "commit");
    if (!target) return this.#remember(scope, command.idempotencyKey, fingerprint, { kind: "validation-failed", fieldErrors: { request: "The target operation is outside retained history or cannot be undone." } });
    if (target.after.revision !== stored.record.revision) {
      return this.#remember(scope, command.idempotencyKey, fingerprint, { kind: "conflict", current: copy(stored.record), message: "A later change prevents this undo." });
    }
    const before = copy(stored.record);
    const restored: ReviewRecord = { ...copy(target.before), revision: before.revision + 1, updatedAt: this.#clock.now() };
    stored.record = restored;
    target.reversible = false;
    const entry: StoredHistoryEntry = {
      operationId: command.idempotencyKey,
      revision: restored.revision,
      action: "undo",
      changedFields: [...target.changedFields],
      at: restored.updatedAt,
      actorLabel: principal.actorLabel,
      reversible: false,
      before,
      after: copy(restored),
    };
    stored.history.push(entry);
    this.#trimHistory(stored);
    return this.#remember(scope, command.idempotencyKey, fingerprint, { kind: "committed", operationId: command.idempotencyKey, record: copy(restored), replayed: false });
  }

  async getOperation(principal: ReviewPrincipal, idempotencyKey: string): Promise<ReviewOperationStatus> {
    const operation = this.#scope(principal.scopeId).operations.get(idempotencyKey);
    return operation
      ? { kind: "known", idempotencyKey, outcome: copy(operation.outcome) }
      : { kind: "unknown", idempotencyKey };
  }

  snapshot(): MemoryReviewSnapshot {
    return {
      schemaVersion: 1,
      scopes: Object.fromEntries([...this.#scopes.entries()].map(([scopeId, scope]) => [scopeId, {
        records: [...scope.records.values()].map(copy),
        operations: [...scope.operations.entries()].map(copy),
      }])),
    };
  }

  #scope(scopeId: string): ScopeState {
    let scope = this.#scopes.get(scopeId);
    if (!scope) {
      scope = { records: new Map(), operations: new Map() };
      this.#scopes.set(scopeId, scope);
    }
    return scope;
  }

  #loadSnapshot(snapshot: MemoryReviewSnapshot): void {
    if (snapshot.schemaVersion !== 1 || !snapshot.scopes || typeof snapshot.scopes !== "object") throw new Error("Unsupported record-review snapshot.");
    for (const [scopeId, scope] of Object.entries(snapshot.scopes)) {
      this.#scopes.set(scopeId, {
        records: new Map(scope.records.map(item => [item.record.id, copy(item)])),
        operations: new Map(scope.operations.map(copy)),
      });
    }
  }

  #replay(scope: ScopeState, key: string, fingerprint: string): ReviewWriteOutcome | null {
    const existing = scope.operations.get(key);
    if (!existing) return null;
    if (existing.fingerprint !== fingerprint) return { kind: "validation-failed", fieldErrors: { idempotencyKey: "This idempotency key is already bound to another command." } };
    const outcome = copy(existing.outcome);
    return outcome.kind === "committed" ? { ...outcome, replayed: true } : outcome;
  }

  #remember(scope: ScopeState, key: string, fingerprint: string, outcome: ReviewWriteOutcome): ReviewWriteOutcome {
    if (isOpaqueId(key)) scope.operations.set(key, { fingerprint, outcome: copy(outcome) });
    return outcome;
  }

  #trimHistory(stored: StoredRecord): void {
    if (stored.history.length > this.#historyLimit) stored.history.splice(0, stored.history.length - this.#historyLimit);
  }

  #publicHistory(entry: StoredHistoryEntry): ReviewHistoryEntry {
    const { before: _before, after: _after, ...publicEntry } = copy(entry);
    return publicEntry;
  }
}
