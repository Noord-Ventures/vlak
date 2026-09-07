"use client";

import { KerningPairEditor } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  return <UseField name="kerning-pair-editor"><UseType>Refine the space between letters</UseType><UseBody><UseStack><UseKicker>Pair review · Georgia</UseKicker><KerningPairEditor label="Pair spacing" fontFamily="Georgia, serif" unitsPerEm={1000} pairs={[{ id: "av", left: "A", right: "V" }, { id: "to", left: "T", right: "o" }, { id: "wa", left: "W", right: "a" }]} baselineOffsets={{ av: -60, to: -40, wa: -30 }} defaultValue={{ av: -80, to: -50, wa: -30 }} /></UseStack></UseBody></UseField>;
}
