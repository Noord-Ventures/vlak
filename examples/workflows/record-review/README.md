# Record review reference kit

The kit implements one review record with an opaque ID, revision, required title, required reference, required summary, and server-owned status. A user can filter and select records, edit a draft, review differences, submit, resolve a conflict, recover a lost response, inspect history, and undo the latest eligible commit.

## Layout

- `domain` contains types, validation, transition rules, and deterministic commit evaluation.
- `adapters/memory.ts` supplies isolated fixture scopes and the contract-test implementation.
- `adapters/local-file.ts` persists the same semantics to a local JSON file for one process.
- `transports/http` contains the versioned route contract and browser client.
- `handlers/reference` authenticates before routing to the adapter.
- `server/node-server.ts` is a dependency-free Node HTTP server.
- `ui` is a Vite React composition using Vlak components.
- `tests` runs the same adverse cases against both advertised adapters.

Run it using the commands in the parent [workflow README](../README.md).

## Record and transition contract

Editable fields are `title`, `reference`, and `summary`. The server applies status changes separately from those fields:

| Current status | Allowed next status |
| --- | --- |
| `needs-information` | `ready-for-review` |
| `ready-for-review` | `needs-information`, `approved`, `rejected` |
| `approved` | None |
| `rejected` | None |

An approval or rejection cannot change fields in the same command. The decision applies to the exact reviewed revision. The authenticated principal must have `canDecide` permission.

A successful commit increments the revision once and records a bounded history entry. Repeating the exact command with its idempotency key returns the original outcome and `replayed: true`. Reusing the key for different content fails validation. A stale expected revision returns `conflict` and the current record so the client can preserve both versions.

`GET /api/operations/:idempotencyKey` is authoritative after a response is lost. An unknown status means the server has no retained operation with that key; retry the exact request and key. Cancelling a request does not undo a write.

Undo names a retained commit operation, the current revision, and a new idempotency key. It succeeds only when the target commit produced the current revision. The restored content receives another revision and history entry. Once a later write exists, undo returns a conflict. The reference retains 20 history entries.

## Adapter contract

Both adapters implement `RecordReviewAdapter` from `domain/types.ts`. Contract tests cover stale writes, invalid transitions, duplicate commits, idempotency-key rebinding, unknown and known operation status, persistence after reopening the file adapter, eligible undo, and undo after competing work. The memory tests also cover scope isolation and bounded history.

The local JSON adapter creates its parent directory with mode `0700`, writes a temporary file with mode `0600`, and renames it over the current file. This handles process interruption during replacement and concurrent requests inside one process. A failed replacement rolls memory back to the previous snapshot and returns a typed `local-persistence-failed` outcome. The adapter does not provide a cross-process lock, compare-and-swap against shared object storage, encryption, backup, or a retention job.

## Integration boundary

The reference server uses one fixed local principal so it starts without credentials. That principal is fixture behavior. Do not make a deployment team-ready by accepting `scopeId`, `actorLabel`, `canDecide`, audit entries, approval flags, or history from the request body. Replace `fixedLocalOwnership` with a server-side authenticated organization adapter and use transactional shared storage. See [AUTHENTICATED-ADAPTER.md](./AUTHENTICATED-ADAPTER.md).
