"use client";

import * as React from "react";
import { Button, Slider } from "@noorddev/vlak-react";
import { equalizerBands, silentReading } from "./audio-graph";
import type { ListeningAudioGraph, ProcessingMode } from "./audio-graph";

type Props = { graph: ListeningAudioGraph; playing: boolean; mode: ProcessingMode; gains: readonly number[]; bypass: boolean; onGainsChange: (gains: number[]) => void; onBypassChange: (bypass: boolean) => void };

export function SoundPanel({ graph, playing, mode, gains, bypass, onGainsChange, onBypassChange }: Props) {
  const [reading, setReading] = React.useState(silentReading);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);
  const [foreground, setForeground] = React.useState(true);
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => { const media = matchMedia("(prefers-reduced-motion: reduce)"); const change = () => setReduced(media.matches); change(); media.addEventListener("change", change); return () => media.removeEventListener("change", change); }, []);
  React.useEffect(() => {
    const observer = new IntersectionObserver(entries => setVisible(entries[0]?.isIntersecting ?? false));
    if (panelRef.current) observer.observe(panelRef.current);
    const change = () => setForeground(!document.hidden); change();
    document.addEventListener("visibilitychange", change);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", change); };
  }, []);
  React.useEffect(() => {
    setReading(silentReading());
    if (!playing || mode !== "processed" || reduced || !visible || !foreground) return;
    let frame = 0, last = 0;
    const draw = (time: number) => { frame = requestAnimationFrame(draw); if (document.hidden || time - last < 80) return; last = time; setReading(graph.read()); };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [graph, playing, mode, reduced, visible, foreground]);
  const description = mode === "direct" ? "Direct playback. Attach local audio to use sound processing." : reduced ? "Visualizer held for reduced motion." : playing ? "Measured from the playing audio." : "Play audio to see its frequency spectrum.";
  return <div ref={panelRef} className="mp-sound-panel" data-processing={mode} data-level={reading.rms === null ? "silent" : reading.rms.toFixed(2)}>
    <div className="mp-analyser"><div className="mp-sound-label"><h3>Frequency spectrum</h3><span>{reading.rms === null ? "—" : `${reading.rms.toFixed(1)} dBFS`}</span></div><svg viewBox="0 0 240 76" role="img" aria-label="Audio frequency spectrum"><path d="M0 70H240" className="mp-spectrum-baseline" />{reading.levels.map((level, index) => <rect key={index} x={index * 10 + 2} y={70 - level * 64} width="6" height={level * 64} />)}</svg><div className="mp-spectrum-scale"><span>40 Hz</span><span>1 kHz</span><span>16 kHz</span></div><p>{description}</p></div>
    <div className="mp-eq-heading"><h3>Equalizer</h3><div><Button variant="ghost" aria-label="Bypass equalizer" aria-pressed={bypass} disabled={mode === "direct"} onClick={() => onBypassChange(!bypass)}>Bypass</Button><Button variant="ghost" aria-label="Reset equalizer" onClick={() => onGainsChange([0, 0, 0, 0, 0])}>Reset</Button></div></div>
    <div className="mp-eq-bands">{equalizerBands.map((band, index) => <div key={band.frequency} className="mp-eq-band"><span>{band.label}</span><Slider aria-label={`${band.label} gain`} min={-12} max={12} step={1} value={gains[index] ?? 0} disabled={mode === "direct" || bypass} onValueChange={gain => { const next = [...gains]; next[index] = gain; onGainsChange(next); }} aria-valuetext={`${gains[index] ?? 0} decibels`} /><span>{(gains[index] ?? 0) > 0 ? "+" : ""}{gains[index] ?? 0} dB</span></div>)}</div>
    <p className="mp-eq-note">{bypass ? "Equalizer bypassed. Your settings are kept." : "Five bands, ±12 dB. Boosts can increase the output level."}</p>
  </div>;
}
