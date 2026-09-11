import { compareTables, parseCsv, sha256 } from "./model.ts";
import type { Recipe, ReconciliationSource } from "./model.ts";

export type WorkerRequest =
  | { jobId: number; kind: "parse"; name: string; size: number; text: string }
  | { jobId: number; kind: "compare"; left: ReconciliationSource; right: ReconciliationSource; recipe: Recipe };
export type WorkerPayload =
  | { kind: "parse"; name: string; size: number; text: string }
  | { kind: "compare"; left: ReconciliationSource; right: ReconciliationSource; recipe: Recipe };

export type WorkerResponse =
  | { jobId: number; kind: "parsed"; source: ReconciliationSource }
  | { jobId: number; kind: "compared"; comparison: ReturnType<typeof compareTables> }
  | { jobId: number; kind: "error"; message: string };

export async function runWorkerJob(request: WorkerRequest): Promise<WorkerResponse> {
  try {
    if (request.kind === "parse") {
      const encodedSize = new TextEncoder().encode(request.text).byteLength;
      if (request.size !== encodedSize) throw new Error("The source size does not match its decoded CSV text.");
      const table = parseCsv(request.text);
      return { jobId: request.jobId, kind: "parsed", source: { name: request.name, size: request.size, text: request.text, hash: await sha256(request.text), table } };
    }
    return { jobId: request.jobId, kind: "compared", comparison: compareTables(request.left, request.right, request.recipe) };
  } catch (failure) {
    return { jobId: request.jobId, kind: "error", message: failure instanceof Error ? failure.message : "The local worker could not finish." };
  }
}

const workerScope = typeof self !== "undefined" && typeof document === "undefined" ? self as unknown as { onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null; postMessage: (value: WorkerResponse) => void } : null;
if (workerScope) workerScope.onmessage = event => { void runWorkerJob(event.data).then(result => workerScope.postMessage(result)); };
