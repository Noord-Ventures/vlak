"use client";

import { useState } from "react";
import { MemoryReviewAdapter } from "../../../../examples/workflows/record-review/adapters/memory";
import { localFixtureRecords, localReferencePrincipal } from "../../../../examples/workflows/record-review/fixtures";
import { RecordReviewApp, type ReviewClient } from "../../../../examples/workflows/record-review/ui/src/record-review-app";
import "../../../../examples/workflows/record-review/ui/src/style.css";

/** The same UI and domain contract as the reference server, with an explicit memory adapter. */
export function RecordReviewDemo() {
  const [client] = useState<ReviewClient>(() => {
    const adapter = new MemoryReviewAdapter({ fixtures: { [localReferencePrincipal.scopeId]: localFixtureRecords } });
    return {
      list: filter => adapter.list(localReferencePrincipal, filter),
      get: async id => { const detail = await adapter.get(localReferencePrincipal, id); if (!detail) throw new Error("Record no longer exists."); return detail; },
      commit: (recordId, request) => adapter.commit(localReferencePrincipal, { recordId, ...request }),
      undo: (recordId, request) => adapter.undo(localReferencePrincipal, { recordId, ...request }),
      getOperation: key => adapter.getOperation(localReferencePrincipal, key),
    };
  });
  return <div className="workflow-demo"><p className="rs-t-body">Try the reference flow. These fixture records stay in memory and reset when this page reloads. The downloadable kit also includes a local file adapter and HTTP server.</p><RecordReviewApp client={client} embedded /></div>;
}
