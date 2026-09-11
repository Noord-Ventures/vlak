# Authenticated organization adapter boundary

`AuthenticatedOrganizationAdapter` is an external validation boundary, not a bundled authentication system. The HTTP handler calls it before reading or writing a scoped record:

```ts
const ownership: AuthenticatedOrganizationAdapter<ReferenceHttpRequest> = {
  async authenticate(request) {
    const session = await hostSessions.verify(request.headers.cookie);
    if (!session) return null;
    const membership = await hostOrganizations.requireMembership(session.userId);
    return {
      scopeId: membership.organizationId,
      actorLabel: membership.auditLabel,
      canDecide: membership.permissions.includes("record:decide"),
    };
  },
};
```

The names above are placeholders for host services, not dependencies supplied by the kit. A real adapter must validate the session, bind it to one active organization, and derive decision permission on the server. It should use a stable internal actor identifier for audit where policy permits; the public example exposes only a display-safe audit label.

The backing store must include `scopeId` in every record, operation, and history lookup. Its transaction should perform these steps atomically:

1. Look up the idempotency key inside the authenticated scope.
2. Return the stored outcome when its command fingerprint matches.
3. Reject a key already bound to different content.
4. Compare the record's current revision with `expectedRevision`.
5. Apply domain and business validation, write the next revision and history, and save the operation outcome.

Authorization can change while a draft is open. Recheck membership, decision permission, and business eligibility during the write transaction. Do not trust client-supplied organization IDs, actors, transition permission, approval state, timestamps, revisions other than the expected-revision precondition, or history.

The host also owns CSRF and origin checks, rate limits, storage encryption, secrets, observability, backups, deletion, retention, and recovery. Diagnostics can include kit ID, adapter version, operation state, outcome code, and revision without logging record contents.

The local file adapter is intentionally excluded from this deployment path. Use storage with an atomic compare-and-swap or serializable transaction across every server instance. Write contract tests against the organization adapter using two scopes with the same record ID and idempotency key; neither scope may observe the other's record, history, or operation status.
