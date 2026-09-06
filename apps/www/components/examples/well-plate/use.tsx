"use client";

import { useState } from "react";
import { WellPlate } from "@noorddev/vlak-react";
import type { WellPosition } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker, UseCopy } from "../use-frame";

export function Use() {
  const [selected, setSelected] = useState<WellPosition | null>({ row: "A", column: "1" });
  return <UseField name="well-plate"><UseType>Inspect a plate</UseType><UseBody><UseStack>
    <UseKicker>Plate 042 / Preparation record</UseKicker>
    <WellPlate label="Sample positions" rows={["A", "B", "C", "D"]} columns={["1", "2", "3", "4", "5", "6"]} wells={[
      { row: "A", column: "1", label: "Control", status: "Loaded" }, { row: "A", column: "2", label: "Sample 042", status: "Loaded" }, { row: "A", column: "3", label: "Sample 043", status: "Loaded" }, { row: "B", column: "1", status: "Reserved", disabled: true },
    ]} value={selected} onValueChange={setSelected} />
    <UseCopy>{selected ? `Selected position: ${selected.row}${selected.column}` : "Choose a well to inspect its record"}</UseCopy>
  </UseStack></UseBody></UseField>;
}
