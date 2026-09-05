"use client";
import { useState } from "react";
import { PlaybackControls, MediaScrubber } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseCopy } from "../use-frame";
export function Use() {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(42);
  return <UseField name="playback-controls"><UseType>Transport</UseType><UseBody><UseStack>
    <UseCopy>{playing ? "Playing" : "Paused"} · Studio session</UseCopy>
    <PlaybackControls playing={playing} onPlayingChange={setPlaying} onPrevious={() => setPosition(0)} previousLabel="Restart recording" onNext={() => setPosition(Math.min(180, position + 15))} nextLabel="Skip ahead 15 seconds" onStop={() => setPosition(0)} />
    <MediaScrubber duration={180} value={position} onValueChange={setPosition} />
  </UseStack></UseBody></UseField>;
}
