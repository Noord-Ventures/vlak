# Record review HTTP contract

Contract version: `2026-09-11`. Every response includes `x-vlak-workflow-version`. Mutation bodies are JSON and limited to 16 KiB by the Node reference server. Deployments should add their normal same-origin and CSRF controls at the framework edge.

## Routes

| Method | Route | Result |
| --- | --- | --- |
| `GET` | `/api/records?status=&query=` | `{ records }` in the authenticated scope |
| `GET` | `/api/records/:recordId` | `{ record, history }` or `404` |
| `POST` | `/api/records/:recordId/commits` | A typed write outcome |
| `POST` | `/api/records/:recordId/undo` | A typed write outcome |
| `GET` | `/api/operations/:idempotencyKey` | A known or unknown operation status |

Commit body:

```json
{
  "expectedRevision": 3,
  "idempotencyKey": "01994393-6e56-742b-941f-aec516740acf",
  "changes": {
    "summary": "The weather observation has been added."
  },
  "requestedStatus": "ready-for-review"
}
```

Undo body:

```json
{
  "expectedRevision": 4,
  "idempotencyKey": "01994394-7f39-7bf6-a138-3aa13f8774bc",
  "targetOperationId": "01994393-6e56-742b-941f-aec516740acf"
}
```

The record ID comes from the route. Ownership, actor, permissions, audit history, and approval state are absent from both bodies by design.

## Write outcomes

| HTTP | `kind` | Meaning |
| --- | --- | --- |
| `200` | `committed` | The durable result, including revision and replay marker |
| `422` | `validation-failed` | Field or transition errors; keep the draft |
| `409` | `conflict` | Expected revision is stale or undo has competing work |
| `404` | `not-found` | The scoped record does not exist |
| `503` | `unavailable` | Typed retriable storage failure |

A connection loss has no HTTP outcome. The browser client returns local state `outcome-unknown` and retains the command. It then checks the operation route. When status is `known`, use the stored outcome. When status is `unknown`, retry the identical request with the identical key. Never generate a new key merely because a response was lost.

The reference adapters record terminal validation, conflict, not-found, and commit outcomes. This makes retries deterministic. A production adapter may represent an in-progress operation internally, but its public lookup must stay authoritative and must not report unknown after accepting the command.
