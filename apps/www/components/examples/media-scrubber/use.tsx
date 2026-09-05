"use client";
import { useState } from "react";
import { MediaScrubber } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseCopy } from "../use-frame";
export function Use() {
  const [position, setPosition] = useState(42);
  return <UseField name="media-scrubber"><UseType>A closer look</UseType><UseBody><UseStack>
    <UseCopy>Three chapters · Four minutes</UseCopy>
    <MediaScrubber duration={240} value={position} buffered={180} onValueChange={setPosition} chapters={[{ time: 0, label: "Opening" }, { time: 80, label: "The detail" }, { time: 160, label: "In context" }]} preview={seconds => <span>{Math.floor(seconds / 60)}:{String(Math.floor(seconds % 60)).padStart(2, "0")}</span>} />
  </UseStack></UseBody></UseField>;
}
