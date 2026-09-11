import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type {
  CommitReviewCommand,
  RecordReviewAdapter,
  ReviewListFilter,
  ReviewOperationStatus,
  ReviewPrincipal,
  ReviewRecord,
  ReviewRecordDetail,
  ReviewWriteOutcome,
  UndoReviewCommand,
} from "../domain/types.ts";
import { MemoryReviewAdapter, type MemoryReviewOptions, type MemoryReviewSnapshot } from "./memory.ts";

/**
 * Durable single-process reference adapter. It serializes in-process writes and
 * atomically replaces one JSON file. Use a transactional database adapter for
 * multiple processes or organization deployments.
 */
export class LocalFileReviewAdapter implements RecordReviewAdapter {
  readonly #filePath: string;
  readonly #options: Omit<MemoryReviewOptions, "snapshot">;
  #memory: MemoryReviewAdapter | null = null;
  #loading: Promise<MemoryReviewAdapter> | null = null;
  #writes: Promise<void> = Promise.resolve();

  constructor(filePath: string, options: Omit<MemoryReviewOptions, "snapshot"> = {}) {
    this.#filePath = resolve(filePath);
    this.#options = options;
  }

  async list(principal: ReviewPrincipal, filter?: ReviewListFilter): Promise<ReviewRecord[]> {
    return (await this.#load()).list(principal, filter);
  }

  async get(principal: ReviewPrincipal, recordId: string): Promise<ReviewRecordDetail | null> {
    return (await this.#load()).get(principal, recordId);
  }

  async commit(principal: ReviewPrincipal, command: CommitReviewCommand): Promise<ReviewWriteOutcome> {
    return this.#mutate(adapter => adapter.commit(principal, command));
  }

  async undo(principal: ReviewPrincipal, command: UndoReviewCommand): Promise<ReviewWriteOutcome> {
    return this.#mutate(adapter => adapter.undo(principal, command));
  }

  async getOperation(principal: ReviewPrincipal, idempotencyKey: string): Promise<ReviewOperationStatus> {
    return (await this.#load()).getOperation(principal, idempotencyKey);
  }

  async #mutate(run: (adapter: MemoryReviewAdapter) => Promise<ReviewWriteOutcome>): Promise<ReviewWriteOutcome> {
    let outcome!: ReviewWriteOutcome;
    const write = this.#writes.then(async () => {
      const adapter = await this.#load();
      const before = adapter.snapshot();
      outcome = await run(adapter);
      try {
        await this.#persist(adapter.snapshot());
      } catch {
        this.#memory = new MemoryReviewAdapter({ ...this.#options, snapshot: before });
        this.#loading = Promise.resolve(this.#memory);
        outcome = { kind: "unavailable", code: "local-persistence-failed", retryable: true, message: "The local file could not be replaced. Check the data path and retry the same command." };
      }
    });
    this.#writes = write.catch(() => undefined);
    await write;
    return outcome;
  }

  async #load(): Promise<MemoryReviewAdapter> {
    if (this.#memory) return this.#memory;
    if (!this.#loading) {
      this.#loading = (async () => {
        let snapshot: MemoryReviewSnapshot | undefined;
        try {
          snapshot = JSON.parse(await readFile(this.#filePath, "utf8")) as MemoryReviewSnapshot;
        } catch (error) {
          if (!(error && typeof error === "object" && "code" in error && error.code === "ENOENT")) throw error;
        }
        const adapter = new MemoryReviewAdapter(snapshot ? { ...this.#options, snapshot } : this.#options);
        this.#memory = adapter;
        return adapter;
      })();
    }
    return this.#loading;
  }

  async #persist(snapshot: MemoryReviewSnapshot): Promise<void> {
    await mkdir(dirname(this.#filePath), { recursive: true, mode: 0o700 });
    const temporary = `${this.#filePath}.${process.pid}.tmp`;
    await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
    await rename(temporary, this.#filePath);
  }
}
