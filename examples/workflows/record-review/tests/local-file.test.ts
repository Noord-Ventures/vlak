import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { LocalFileReviewAdapter } from "../adapters/local-file.ts";
import { fixture, runAdapterContract } from "./adapter-contract.ts";

const principal = { scopeId: "scope-a", actorLabel: "Fixture operator", canDecide: true } as const;
const clock = { now: () => "2026-09-11T10:00:00.000Z" };

runAdapterContract("local file adapter", async () => {
  const directory = await mkdtemp(join(tmpdir(), "vlak-record-review-"));
  const file = join(directory, "store.json");
  const options = { fixtures: { [principal.scopeId]: [fixture()] }, clock };
  return {
    adapter: new LocalFileReviewAdapter(file, options),
    principal,
    recordId: "record-1",
    reopen: async () => new LocalFileReviewAdapter(file, options),
    cleanup: async () => rm(directory, { recursive: true, force: true }),
  };
});
