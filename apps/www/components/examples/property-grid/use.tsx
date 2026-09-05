"use client";

import { PropertyGrid } from "@noorddev/vlak-react";

export function Use() {
  return <PropertyGrid defaultValue={{ name: "Drive", range: 386, enabled: true }} fields={[{ id: "name", label: "Name" }, { id: "range", label: "Range", type: "number", unit: "km", min: 0 }, { id: "enabled", label: "Connected", type: "switch" }]} />;
}
