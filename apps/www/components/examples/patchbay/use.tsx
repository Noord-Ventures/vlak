"use client";

import { Patchbay } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker, UseCopy } from "../use-frame";

export function Use() {
  return <UseField name="patchbay"><UseType>Route the studio</UseType><UseBody><UseStack><UseKicker>Monitor patch · local routing state</UseKicker><Patchbay label="Output connections" sources={[{ id: "mix-l", label: "Mix left", group: "Mix bus", signalType: "audio" }, { id: "mix-r", label: "Mix right", group: "Mix bus", signalType: "audio" }]} destinations={[{ id: "out-l", label: "Monitor left", group: "Interface", signalType: "audio" }, { id: "out-r", label: "Monitor right", group: "Interface", signalType: "audio" }, { id: "clock", label: "Clock", group: "Sync", signalType: "control" }]} defaultValue={[{ sourceId: "mix-l", destinationId: "out-l" }, { sourceId: "mix-r", destinationId: "out-r" }]} /><UseCopy>Choose a crosspoint to connect or disconnect. Different signal types remain blocked.</UseCopy></UseStack></UseBody></UseField>;
}
