"use client";
import { useState } from "react";
import { Waveform, type WaveformRegion } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseCopy } from "../use-frame";
const samples = Array.from({ length: 96 }, (_, i) => Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.11)) * 0.85 + 0.1);
export function Use() {
  const [position, setPosition] = useState(0.32);
  const [region, setRegion] = useState<WaveformRegion>({ start: 0.2, end: 0.65 });
  return <UseField name="waveform"><UseType>Find the passage</UseType><UseBody><UseStack><UseCopy>Select a region or move the playhead.</UseCopy><Waveform samples={samples} label="Recording position" value={position} onValueChange={setPosition} region={region} onRegionChange={setRegion} /></UseStack></UseBody></UseField>;
}
