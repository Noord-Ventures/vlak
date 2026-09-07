"use client";

import { useState } from "react";
import { Button, DatumTransformPicker } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker, UseActions, UseCopy } from "../use-frame";

export function Use() {
  const [gridAttached, setGridAttached] = useState(false);
  const [operation, setOperation] = useState<string | null>("parameter");
  return <UseField name="datum-transform-picker"><UseType>Choose the coordinate operation</UseType><UseBody><UseStack>
    <UseKicker>Survey import / Supplied operations</UseKicker>
    <DatumTransformPicker label="Available transformations" sourceReference="Site grid" destinationReference="Project grid" name="operation" value={operation} onValueChange={setOperation} description="Illustrative operation metadata supplied by the survey provider" transformations={[
      { id: "grid", label: "Grid correction", available: true, accuracy: "0.05 m", area: "Site survey extent", grids: [{ id: "site-grid", label: "Site correction grid", available: gridAttached }], unavailableReason: "Attach the supplied correction grid" },
      { id: "parameter", label: "Parameter transform", available: true, accuracy: "1.5 m", area: "Project extent", grids: [] },
    ]} />
    <UseActions><Button variant="ghost" onClick={() => { setGridAttached(attached => !attached); }}>{gridAttached ? "Detach example grid" : "Attach example grid"}</Button></UseActions>
    <UseCopy>{gridAttached ? "The example grid is available. Select Grid correction to use it." : "The correction grid is absent. Its operation remains visible for comparison."}</UseCopy>
  </UseStack></UseBody></UseField>;
}
