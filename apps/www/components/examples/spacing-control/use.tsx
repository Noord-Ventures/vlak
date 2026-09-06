"use client";

import { SpacingControl } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  return <UseField name="spacing-control"><UseType>Give content room</UseType><UseBody><UseStack><UseKicker>Selected frame</UseKicker><SpacingControl label="Padding" name="padding" unit="px" min={0} defaultValue={{ top: 16, right: 24, bottom: 16, left: 24 }} /></UseStack></UseBody></UseField>;
}
