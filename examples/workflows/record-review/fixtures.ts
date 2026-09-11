import type { ReviewRecord } from "./domain/types.ts";

export const localFixtureRecords: ReviewRecord[] = [
  {
    id: "inspection-1042",
    revision: 1,
    title: "North quay inspection",
    reference: "FIELD-1042",
    summary: "The inspection notes need a weather observation before review.",
    status: "needs-information",
    updatedAt: "2026-09-11T08:30:00.000Z",
  },
  {
    id: "inspection-1043",
    revision: 1,
    title: "Warehouse door inspection",
    reference: "FIELD-1043",
    summary: "Measurements and photographs are attached to the source record.",
    status: "ready-for-review",
    updatedAt: "2026-09-11T08:45:00.000Z",
  },
  {
    id: "inspection-1044",
    revision: 1,
    title: "Loading ramp inspection",
    reference: "FIELD-1044",
    summary: "The ramp surface and edge markings meet the recorded checklist.",
    status: "approved",
    updatedAt: "2026-09-11T09:00:00.000Z",
  },
];

export const localReferencePrincipal = {
  scopeId: "local-reference",
  actorLabel: "Local evaluator",
  canDecide: true,
} as const;
