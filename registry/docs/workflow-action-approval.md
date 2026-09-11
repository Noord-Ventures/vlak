# Action approval

A runnable recipe that binds a decision to one frozen action payload version.

Reference version: 0.1.0. Status: recipe.

## Run

From `examples/workflows`:

```sh
node --experimental-strip-types action-approval/example.ts
```

## States

pending → approved → rejected → executed → failed

## Acceptance

- Payload changes invalidate approval
- A decision targets the reviewed revision
- Execution remains host-owned and idempotent

## Host responsibilities

- Authenticated approver
- Durable signed approval
- Idempotent action executor
- Action audit and retention

The host authorizes the approver and rechecks the frozen payload immediately before executing the action.

## Limitations

- The recipe does not execute actions
- The non-cryptographic fixture fingerprint is a version marker, not an approval signature
- Use the assistant's persisted signed approval path for its live task writes

## Source

- [examples/workflows/action-approval/recipe.ts](https://github.com/Noord-Ventures/vlak/blob/main/examples/workflows/action-approval/recipe.ts) (recipe)
- [examples/workflows/action-approval/example.ts](https://github.com/Noord-Ventures/vlak/blob/main/examples/workflows/action-approval/example.ts) (recipe)
- [examples/workflows/action-approval/README.md](https://github.com/Noord-Ventures/vlak/blob/main/examples/workflows/action-approval/README.md) (documentation)
- [examples/workflows/record-review/tests/recipes.test.ts](https://github.com/Noord-Ventures/vlak/blob/main/examples/workflows/record-review/tests/recipes.test.ts) (test)
