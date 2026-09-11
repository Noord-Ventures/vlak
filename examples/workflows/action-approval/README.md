# Action approval recipe

This recipe freezes an action payload, exposes its version through a record-review item, and records an approval or rejection with the record-review commit contract. Run it from `examples/workflows`:

```sh
node --experimental-strip-types action-approval/example.ts
```

`assertApprovedPayload` is the last check before execution. A payload change requires a new proposal and approval. The host still owns authorization, durable approval storage, idempotent action execution, and audit retention. A model may propose an action; it cannot approve or execute it.

For the Vlak assistant, keep its persisted approval signatures, conversation ownership, and idempotent task writes authoritative. This recipe documents the portable version binding; it does not replace that implementation. Restoring conversation history does not reverse an executed action.
