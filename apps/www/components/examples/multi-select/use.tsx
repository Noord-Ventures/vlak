"use client";

import { MultiSelect } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";

export function Use() {
  return <UseField name="multi-select"><h3 className="rs-use-type">Coverage areas</h3><div className="rs-use-body"><div className="rs-use-stack"><p className="rs-use-kicker">One or more</p><p className="rs-use-copy">Search the available places and keep the ones the project covers.</p><MultiSelect label="Cities" name="cities" defaultValue={["alkmaar"]} options={[{ value: "alkmaar", label: "Alkmaar" }, { value: "bergen", label: "Bergen" }, { value: "castricum", label: "Castricum" }, { value: "heiloo", label: "Heiloo" }]} /></div></div></UseField>;
}
