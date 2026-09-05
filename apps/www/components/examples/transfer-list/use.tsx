"use client";

import { TransferList } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";

export function Use() {
  return <UseField name="transfer-list"><h3 className="rs-use-type">Choose the coverage</h3><div className="rs-use-body"><div className="rs-use-stack"><p className="rs-use-kicker">Assigned areas</p><p className="rs-use-copy">Mark places, then move them between the available and selected lists.</p><TransferList label="Coverage areas" name="areas" defaultValue={["alkmaar"]} options={[{ value: "alkmaar", label: "Alkmaar" }, { value: "bergen", label: "Bergen" }, { value: "castricum", label: "Castricum" }, { value: "heiloo", label: "Heiloo" }]} /></div></div></UseField>;
}
