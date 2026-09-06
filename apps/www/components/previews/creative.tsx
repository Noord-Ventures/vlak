"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import { AudioMeter, ChannelStrip, ParameterKnob, TimecodeField, ClipTimeline, RenderQueue, LayerStack, ColorInspector, SpacingControl } from "@noorddev/vlak-react";
import type { RenderJob } from "@noorddev/vlak-react";

function TimelinePreview() {
  const [selected, setSelected] = useState<string | null>("opening");
  const [position, setPosition] = useState(12);
  return <ClipTimeline label="Assembly" duration={60} unit="seconds" tracks={[{ id: "video", label: "Video" }]} clips={[{ id: "opening", trackId: "video", label: "Opening", start: 6, duration: 18 }, { id: "interview", trackId: "video", label: "Interview", start: 24, duration: 30 }]} selectedClipId={selected} onSelectClip={setSelected} position={position} onSeek={setPosition} />;
}

function QueuePreview() {
  const [jobs, setJobs] = useState<RenderJob[]>([{ id: "master", label: "Film master", status: "rendering", progress: 42 }, { id: "review", label: "Review copy", status: "failed", detail: "Destination unavailable" }]);
  return <RenderQueue label="Exports" jobs={jobs} onCancel={(id) => setJobs((current) => current.map((job) => job.id === id ? { ...job, status: "canceled" } : job))} onRetry={(id) => setJobs((current) => current.map((job) => job.id === id ? { ...job, status: "queued", progress: null, detail: "Waiting for the renderer" } : job))} />;
}

function LayersPreview() {
  const [layers, setLayers] = useState([{ id: "title", label: "Title", visible: true, locked: false }, { id: "background", label: "Background", visible: true, locked: true }]);
  const [selected, setSelected] = useState<string | null>("title");
  return <LayerStack label="Layers" layers={layers} onLayersChange={setLayers} selectedId={selected} onSelect={setSelected} />;
}

export const creativePreviews: Record<string, ComponentType> = {
  "audio-meter": () => <AudioMeter label="Output" channels={[{ id: "left", label: "Left", level: -12, peak: -3 }, { id: "right", label: "Right", level: -15, peak: -4 }]} />,
  "channel-strip": () => <ChannelStrip label="Dialogue" defaultValue={{ gain: -3, pan: 0, muted: false, solo: false }} />,
  "parameter-knob": () => <ParameterKnob label="Mix" defaultValue={35} unit="%" />,
  "timecode-field": () => <TimecodeField label="In point" frameRate={24} defaultValue="00:01:24:12" />,
  "clip-timeline": TimelinePreview,
  "render-queue": QueuePreview,
  "layer-stack": LayersPreview,
  "color-inspector": () => <ColorInspector label="Fill" defaultValue={{ hex: "#808080", alpha: 0.75 }} />,
  "spacing-control": () => <SpacingControl label="Padding" min={0} defaultValue={{ top: 16, right: 24, bottom: 16, left: 24 }} />,
};
