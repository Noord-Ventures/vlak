"use client";

import { useState } from "react";
import { ClipTimeline } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  const [selected, setSelected] = useState<string | null>("opening");
  const [position, setPosition] = useState(12);
  return <UseField name="clip-timeline"><UseType>Inspect an assembly</UseType><UseBody><UseStack><UseKicker>First cut · seconds</UseKicker><ClipTimeline label="Sequence" duration={60} unit="seconds" tracks={[{ id: "video", label: "Video" }, { id: "audio", label: "Dialogue" }]} clips={[{ id: "opening", trackId: "video", label: "Opening", start: 0, duration: 18 }, { id: "interview", trackId: "video", label: "Interview", start: 18, duration: 36 }, { id: "voice", trackId: "audio", label: "Voice", start: 4, duration: 48 }]} selectedClipId={selected} onSelectClip={setSelected} position={position} onSeek={setPosition} /></UseStack></UseBody></UseField>;
}
