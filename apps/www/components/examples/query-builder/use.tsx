"use client";

import { QueryBuilder } from "@noorddev/vlak-react";

export function Use() {
  return <QueryBuilder fields={[{ id: "name", label: "Name" }, { id: "range", label: "Range", type: "number" }]} defaultValue={{ id: "root", combinator: "and", rules: [{ id: "rule", field: "name", operator: "contains", value: "Drive" }] }} />;
}
