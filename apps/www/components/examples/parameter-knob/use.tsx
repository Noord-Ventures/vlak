"use client";

import { ParameterKnob } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker, UseCopy } from "../use-frame";

export function Use() {
  return <UseField name="parameter-knob"><UseType>A compact parameter</UseType><UseBody><UseStack><UseKicker>Effect inspector</UseKicker><ParameterKnob label="Mix" min={0} max={100} step={1} defaultValue={35} unit="%" /><UseCopy>Drag horizontally or use the arrow keys to adjust.</UseCopy></UseStack></UseBody></UseField>;
}
