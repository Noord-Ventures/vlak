"use client";

import { TimecodeField } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  return <UseField name="timecode-field"><UseType>Set the edit boundary</UseType><UseBody><UseStack><UseKicker>Sequence · 24 fps</UseKicker><TimecodeField label="In point" frameRate={24} defaultValue="00:01:24:12" name="inPoint" /></UseStack></UseBody></UseField>;
}
