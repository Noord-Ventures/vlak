"use client";

import { ColorInspector } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  return <UseField name="color-inspector"><UseType>Inspect the fill</UseType><UseBody><UseStack><UseKicker>Selected shape</UseKicker><ColorInspector label="Fill" name="fill" defaultValue={{ hex: "#808080", alpha: 0.75 }} /></UseStack></UseBody></UseField>;
}
