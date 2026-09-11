# Vlak workflow kits

These source examples connect Vlak components to application behavior. `record-review` is the complete reference kit. `action-approval` and `schedule-editing` are smaller runnable recipes that reuse its revision, idempotency, conflict, and lost-response contract.

## Run record review

When exported with `vlak workflow record-review --output review`, use that `review` directory in place of `examples/workflows` below. All companion sources and the license are included.

Node.js 22.6 or newer runs the domain, adapters, server, and tests directly. The React interface needs the dependencies declared in this directory, installed without changing the repository root workspace or lockfile:

```sh
cd examples/workflows
pnpm install --ignore-workspace --ignore-scripts
pnpm test
pnpm server
```

In a second terminal:

```sh
cd examples/workflows
pnpm ui
```

Open [http://127.0.0.1:5174](http://127.0.0.1:5174). The UI proxies `/api` to the reference server at port 3212. Data is written to `examples/workflows/.data/record-review.json` unless `VLAK_WORKFLOW_DATA_FILE` points elsewhere. The fixture has inspection records only; it creates no users or accounts.

The server and UI commands are separate so a host can replace either side. To run the dependency-free checks or recipes, installation is unnecessary:

```sh
node --experimental-strip-types --test record-review/tests/*.test.ts
node --experimental-strip-types action-approval/example.ts
node --experimental-strip-types schedule-editing/example.ts
```

## What to copy

Start with `record-review/domain` and one adapter. The domain files have no React, framework, or storage dependency. `handlers/reference/handler.ts` is framework-neutral; `server/node-server.ts` shows the Node HTTP bridge. `transports/http/client.ts` preserves an `outcome-unknown` state when a write response is lost. `ui/src/record-review-app.tsx` composes existing Vlak components and keeps the draft through validation, conflicts, and retryable transport failures.

The write contract has four properties that should survive an integration:

1. The client sends an expected revision and bounded fields.
2. The server owns status transitions and derives the actor and ownership scope.
3. One idempotency key is permanently bound to one command.
4. Undo is a new authorized write against the latest revision.

The memory adapter is deterministic and useful for tests. The JSON adapter atomically replaces one file and serializes writes inside one Node.js process. It is a solo evaluation reference, not shared production storage. A deployed organization application needs the boundary described in [AUTHENTICATED-ADAPTER.md](./record-review/AUTHENTICATED-ADAPTER.md).

## Source catalog

[`catalog.ts`](./catalog.ts) is the authored machine-readable index. Each manifest names its compatibility, install and run commands, Vlak components, adapters, ownership boundary, states, acceptance cases, limitations, and every source path with a role. It is safe for a registry or documentation generator to consume without importing React or starting a server.
