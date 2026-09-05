"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import {
  PlaybackControls, MediaScrubber, MediaPlayer, Waveform, ImageViewer,
  CanvasControls, MessageComposer, FileBrowser, KanbanBoard, Scheduler,
  type BrowserEntry, type KanbanCard, type SchedulerEvent, type WaveformRegion,
} from "@noorddev/vlak-react";

function makeAudio() {
  const rate = 8000;
  const samples = rate * 8;
  const buffer = new ArrayBuffer(44 + samples);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const word = (at: number, value: string) => {
    for (let i = 0; i < value.length; i++) bytes[at + i] = value.charCodeAt(i);
  };
  word(0, "RIFF");
  view.setUint32(4, samples + 36, true);
  word(8, "WAVE");
  word(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  word(36, "data");
  view.setUint32(40, samples, true);
  for (let i = 0; i < samples; i++) {
    const t = i / rate;
    const envelope = Math.min(1, t * 4, (8 - t) * 4);
    bytes[44 + i] = Math.round(128 + Math.sin(2 * Math.PI * 220 * t) * 14 * envelope);
  }
  return `data:audio/wav;base64,${btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(""))}`;
}

function PlaybackPreview() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const element = new Audio(makeAudio());
    const sync = () => setPlaying(!element.paused && !element.ended);
    audio.current = element;
    element.addEventListener("play", sync);
    element.addEventListener("pause", sync);
    element.addEventListener("ended", sync);
    return () => {
      element.removeEventListener("play", sync);
      element.removeEventListener("pause", sync);
      element.removeEventListener("ended", sync);
      element.pause();
      audio.current = null;
    };
  }, []);
  return <PlaybackControls label="Playback preview" playing={playing}
    onPlayingChange={next => {
      if (next) void audio.current?.play().catch(() => setPlaying(false));
      else audio.current?.pause();
    }}
    previousLabel="Restart audio preview" onPrevious={() => { if (audio.current) audio.current.currentTime = 0; }}
    nextLabel="Skip ahead two seconds" onNext={() => { if (audio.current) audio.current.currentTime = Math.min(8, audio.current.currentTime + 2); }}
    onStop={() => { if (audio.current) { audio.current.pause(); audio.current.currentTime = 0; } }} />;
}

function ScrubberPreview() {
  const [position, setPosition] = useState(46);
  return <MediaScrubber label="Scrubber preview position" duration={180} buffered={130} value={position} onValueChange={setPosition} />;
}

function PlayerPreview() {
  const [src] = useState(makeAudio);
  return <MediaPlayer kind="audio" src={src} title="Audio preview" />;
}

const samples = Array.from({ length: 96 }, (_, index) => 0.12 + Math.abs(Math.sin(index * 0.43) * Math.cos(index * 0.17)) * 0.83);
function WaveformPreview() {
  const [position, setPosition] = useState(0.3);
  const [region, setRegion] = useState<WaveformRegion>({ start: 0.2, end: 0.75 });
  return <Waveform label="Waveform preview position" samples={samples} value={position} onValueChange={setPosition} region={region} onRegionChange={setRegion} />;
}

function ImagePreview() {
  return <ImageViewer label="Image preview" images={[
    { src: "/interfaces/threads/press-sheet.webp", alt: "A sheet of typographic print layouts" },
    { src: "/interfaces/threads/posters.webp", alt: "A set of printed posters" },
  ]} />;
}

function CanvasPreview() {
  const [zoom, setZoom] = useState(1);
  return <CanvasControls label="Canvas preview controls" zoom={zoom} onZoomChange={setZoom} onFit={() => setZoom(0.75)} />;
}

function ComposerPreview() {
  const [generating, setGenerating] = useState(false);
  return <MessageComposer label="Draft preview" allowAttachments generating={generating} onSend={() => setGenerating(true)} onStop={() => setGenerating(false)} />;
}

const files: BrowserEntry[] = [{
  id: "images", name: "Images", kind: "folder", children: [
    { id: "sheet", name: "Press sheet.webp", kind: "file" },
    { id: "posters", name: "Posters.webp", kind: "file" },
  ],
}];
const fileSources: Record<string, string> = { sheet: "/interfaces/threads/press-sheet.webp", posters: "/interfaces/threads/posters.webp" };
function FilesPreview() {
  return <FileBrowser label="Files preview" entries={files} defaultFolder="images" onOpen={file => {
    const src = fileSources[file.id];
    if (src) window.open(src, "_blank", "noopener,noreferrer");
  }} />;
}

function KanbanPreview() {
  const [cards, setCards] = useState<KanbanCard[]>([
    { id: "brief", title: "Write the brief", columnId: "planned" },
    { id: "layout", title: "Explore layouts", columnId: "active" },
    { id: "references", title: "Collect references", columnId: "complete" },
  ]);
  return <KanbanBoard label="Board preview" columns={[
    { id: "planned", label: "Planned" }, { id: "active", label: "Active" }, { id: "complete", label: "Complete" },
  ]} value={cards} onValueChange={setCards} />;
}

function SchedulerPreview() {
  const [events, setEvents] = useState<SchedulerEvent[]>([
    { id: "planning", title: "Planning", start: new Date("2026-09-14T09:00:00Z"), end: new Date("2026-09-14T09:30:00Z") },
    { id: "check-in", title: "Check-in", start: new Date("2026-09-14T13:00:00Z"), end: new Date("2026-09-14T13:30:00Z") },
  ]);
  return <Scheduler label="Schedule preview" timeZone="UTC" defaultValue={new Date("2026-09-14T12:00:00Z")} defaultView="agenda" events={events}
    onSlotSelect={start => setEvents(previous => [...previous, {
      id: `session-${previous.length}`, title: "Session", start, end: new Date(start.getTime() + 30 * 60000),
    }])}
    onEventMove={(event, next) => setEvents(previous => previous.map(item => item.id === event.id ? { ...item, ...next } : item))} />;
}

export const mediaPreviews: Record<string, ComponentType> = {
  "playback-controls": PlaybackPreview,
  "media-scrubber": ScrubberPreview,
  "media-player": PlayerPreview,
  waveform: WaveformPreview,
  "image-viewer": ImagePreview,
  "canvas-controls": CanvasPreview,
  "message-composer": ComposerPreview,
  "file-browser": FilesPreview,
  "kanban-board": KanbanPreview,
  scheduler: SchedulerPreview,
};
