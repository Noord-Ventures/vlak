# Record review

A runnable list, edit, review, commit, conflict recovery, history, and bounded undo workflow.

Reference version: 0.1.0. Status: reference.

## Run

From `examples/workflows`:

```sh
pnpm install --ignore-workspace --ignore-scripts
pnpm server
pnpm ui
```

## States

viewing → editing → validating → reviewing → submitting → confirmed → conflict → outcome-unknown

## Acceptance

- Stale revisions return the current record
- A duplicate command commits once
- Lost responses resolve by idempotency key
- Validation preserves the draft
- Conflicts preserve server and draft values
- Undo refuses a competing revision
- History retains at most 20 entries

## Host responsibilities

- Authentication
- Organization authorization
- Transactional shared storage
- Business eligibility rules
- Retention and audit policy

The AuthenticatedOrganizationAdapter derives scope, actor, and decision permission from trusted server state before the workflow adapter runs.

## Limitations

- The local file adapter supports one Node.js process
- The reference server has one fixed local owner
- No account, recovery, organization, or deployment authentication is included

## Source

- [examples/workflows/record-review/domain/types.ts](https://github.com/Noord-Ventures/vlak/blob/main/examples/workflows/record-review/domain/types.ts) (domain)
- [examples/workflows/record-review/domain/review.ts](https://github.com/Noord-Ventures/vlak/blob/main/examples/workflows/record-review/domain/review.ts) (domain)
- [examples/workflows/record-review/adapters/memory.ts](https://github.com/Noord-Ventures/vlak/blob/main/examples/workflows/record-review/adapters/memory.ts) (adapter)
- [examples/workflows/record-review/adapters/local-file.ts](https://github.com/Noord-Ventures/vlak/blob/main/examples/workflows/record-review/adapters/local-file.ts) (adapter)
- [examples/workflows/record-review/transports/http/contract.ts](https://github.com/Noord-Ventures/vlak/blob/main/examples/workflows/record-review/transports/http/contract.ts) (transport)
- [examples/workflows/record-review/transports/http/client.ts](https://github.com/Noord-Ventures/vlak/blob/main/examples/workflows/record-review/transports/http/client.ts) (transport)
- [examples/workflows/record-review/handlers/reference/handler.ts](https://github.com/Noord-Ventures/vlak/blob/main/examples/workflows/record-review/handlers/reference/handler.ts) (handler)
- [examples/workflows/record-review/server/node-server.ts](https://github.com/Noord-Ventures/vlak/blob/main/examples/workflows/record-review/server/node-server.ts) (handler)
- [examples/workflows/record-review/ui/src/record-review-app.tsx](https://github.com/Noord-Ventures/vlak/blob/main/examples/workflows/record-review/ui/src/record-review-app.tsx) (ui)
- [examples/workflows/record-review/tests/memory.test.ts](https://github.com/Noord-Ventures/vlak/blob/main/examples/workflows/record-review/tests/memory.test.ts) (test)
- [examples/workflows/record-review/tests/local-file.test.ts](https://github.com/Noord-Ventures/vlak/blob/main/examples/workflows/record-review/tests/local-file.test.ts) (test)
- [examples/workflows/record-review/README.md](https://github.com/Noord-Ventures/vlak/blob/main/examples/workflows/record-review/README.md) (documentation)
- [examples/workflows/record-review/HTTP.md](https://github.com/Noord-Ventures/vlak/blob/main/examples/workflows/record-review/HTTP.md) (documentation)
- [examples/workflows/record-review/AUTHENTICATED-ADAPTER.md](https://github.com/Noord-Ventures/vlak/blob/main/examples/workflows/record-review/AUTHENTICATED-ADAPTER.md) (documentation)
