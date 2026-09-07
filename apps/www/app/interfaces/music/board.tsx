"use client";

import { useEffect, useRef, useState } from "react";
import { AudioMeter, Button, ChannelStrip, Icon, Input, NumberField, ParameterKnob, Select, ToggleGroup } from "@noorddev/vlak-react";
import { initialSession, renderSession, SessionEngine } from "./engine";
import type { Clip, Session, Track } from "./engine";

const scenes = ["First light", "Open space", "After hours", "Home again"];
const notes = Array.from({ length: 25 }, (_, index) => ({ value: String(36 + index), label: `${["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"][index % 12]}${Math.floor((36 + index) / 12) - 1}` }));
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function MusicBoard() {
  const [session, setSession] = useState<Session>(initialSession);
  const [selected, setSelected] = useState({ track: 0, clip: 0 });
  const [view, setView] = useState("session");
  const [playing, setPlaying] = useState(false);
  const [starting, setStarting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [playhead, setPlayhead] = useState({ step: -1, bar: 1, levels: [-Infinity, -Infinity, -Infinity, -Infinity] });
  const [notice, setNotice] = useState("Press Play to hear your session.");
  const [undo, setUndo] = useState<{ trackId: string; clipIndex: number; clip: Clip } | null>(null);
  const engine = useRef<SessionEngine | null>(null);
  const alive = useRef(true);
  const editorHeading = useRef<HTMLHeadingElement>(null);
  const mixerHeading = useRef<HTMLHeadingElement>(null);
  const launchers = useRef(new Map<string, HTMLButtonElement>());
  const trackButtons = useRef(new Map<number, HTMLButtonElement>());
  const workspace = useRef<HTMLDivElement>(null);
  const screenPositions = useRef<Record<string, number>>({});
  function navigateView(next: string, reset = false) {
    screenPositions.current[view] = workspace.current?.scrollTop ?? 0;
    if (reset) screenPositions.current[next] = 0;
    setView(next);
    requestAnimationFrame(() => workspace.current?.scrollTo({ top: screenPositions.current[next] ?? 0 }));
  }
  function returnToSession(from: "clip" | "mixer") {
    navigateView("session", from === "mixer");
    requestAnimationFrame(() => (from === "clip" ? launchers.current.get(`${selected.track}:${selected.clip}`) : trackButtons.current.get(selected.track))?.focus({ preventScroll: true }));
  }
  const track = session.tracks[selected.track]!;
  const clip = track.clips[selected.clip]!;
  useEffect(() => { engine.current?.update(session); }, [session]);
  useEffect(() => { alive.current = true; return () => { alive.current = false; engine.current?.dispose(); engine.current = null; }; }, []);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      if (!engine.current) return;
      const sample = engine.current.read();
      if (sample.state !== "running") {
        engine.current.stop(); setPlaying(false); setPlayhead({ step: -1, bar: 1, levels: [-Infinity, -Infinity, -Infinity, -Infinity] });
        setNotice("The browser paused audio. Press Play to resume.");
        return;
      }
      setPlayhead(sample);
    }, 50);
    const visibility = () => { if (document.hidden) { engine.current?.stop(); setPlaying(false); setPlayhead({ step: -1, bar: 1, levels: [-Infinity, -Infinity, -Infinity, -Infinity] }); setNotice("Playback stopped while the page was hidden."); } };
    document.addEventListener("visibilitychange", visibility);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", visibility); };
  }, [playing]);
  function updateTrack(index: number, update: (item: Track) => Track) {
    setSession(current => ({ ...current, tracks: current.tracks.map((item, i) => i === index ? update(item) : item) }));
  }
  function editClip(update: (item: Clip) => Clip) {
    setUndo({ trackId: track.id, clipIndex: selected.clip, clip });
    updateTrack(selected.track, item => ({ ...item, clips: item.clips.map((value, i) => i === selected.clip ? update(value) : value) }));
  }
  async function start() {
    setStarting(true);
    try {
      engine.current ??= new SessionEngine(session); engine.current.update(session); await engine.current.start();
      if (alive.current) { setPlaying(true); setNotice("Playing the active clips. Edits change the sound as you work."); }
    } catch { if (alive.current) setNotice("Audio could not start. Try Play again in a browser with Web Audio enabled."); }
    finally { if (alive.current) setStarting(false); }
  }
  function stop() { engine.current?.stop(); setPlaying(false); setPlayhead({ step: -1, bar: 1, levels: [-Infinity, -Infinity, -Infinity, -Infinity] }); setNotice("Stopped. Your patterns are kept."); }
  function launchScene(index: number) {
    setSession(current => ({ ...current, tracks: current.tracks.map(item => ({ ...item, active: index })) }));
    setSelected(current => ({ ...current, clip: index })); setNotice(`${scenes[index]} is active on all four tracks${playing ? ". Playing from the current beat." : ". Press Play to listen."}`);
  }
  async function exportAudio() {
    setExporting(true); setNotice("Rendering four bars of the active clips…");
    try { const blob = await renderSession(session); if (alive.current) { download(blob, "vlak-session.wav"); setNotice("Stereo wave exported: four bars plus the instrument tails."); } }
    catch { if (alive.current) setNotice("Audio export failed. Your session is still here; try exporting again."); }
    finally { if (alive.current) setExporting(false); }
  }
  return <div className="mu-studio">
    <div className="mu-frame" data-view={view}>
      <header className="mu-transport">
        <div className="mu-project"><Icon name="music" size={24} /><Input plain aria-label="Session name" value={session.name} maxLength={48} onChange={event => setSession(current => ({ ...current, name: event.target.value }))} /><span>Local session</span></div>
        <div className="mu-controls"><Button size="sm" variant={playing ? "ghost" : "primary"} disabled={starting} onClick={playing ? stop : start} aria-label={playing ? "Stop playback" : "Play session"}><Icon name={playing ? "stop" : "play"} size={16} />{starting ? "Starting…" : playing ? "Stop" : "Play"}</Button><output className="mu-position" aria-label="Play position" aria-live="off">{String(playhead.bar).padStart(2, "0")}<span> . </span>{playhead.step < 0 ? "1" : Math.floor(playhead.step / 4) + 1}<span> . </span>{playhead.step < 0 ? "1" : playhead.step % 4 + 1}</output><div className="mu-tempo"><NumberField aria-label="Tempo" value={session.tempo} min={60} max={180} unit="bpm" incrementLabel="Increase tempo" decrementLabel="Decrease tempo" onValueChange={value => { if (value != null && value >= 60 && value <= 180) setSession(current => ({ ...current, tempo: value })); }} /></div><span className="mu-time-signature">4 / 4</span></div>
      </header>
      <nav className="mu-mobile-nav" aria-label="Music workspace"><ToggleGroup value={view} onValueChange={next => navigateView(next)} options={[{ value: "session", label: "Session" }, { value: "clip", label: "Clip" }, { value: "mixer", label: "Mixer" }]} /></nav>
      <div className="mu-workspace" ref={workspace}>
        <section className="mu-session" aria-label="Session clips">
          <div className="mu-panel-heading"><div><span className="mu-eyebrow">Session view</span><h2>Room for a loop.</h2></div><span>4 tracks / 4 scenes</span></div>
          <div className="mu-mobile-track"><span id="mu-session-track">Track to launch</span><Select fullWidth aria-labelledby="mu-session-track" value={String(selected.track)} options={session.tracks.map((item, index) => ({ value: String(index), label: item.name }))} onValueChange={value => setSelected({ track: Number(value), clip: session.tracks[Number(value)]!.active })} /></div>
          <div className="mu-matrix-viewport" role="region" aria-label="Clip launcher, scroll to all tracks" tabIndex={0}>
            <div className="mu-matrix">
              <div className="mu-scene-heading">Scenes</div>
              {session.tracks.map((item, index) => <Button key={item.id} variant="ghost" className="mu-track-heading" data-mobile-active={selected.track === index} ref={node => { if (node) trackButtons.current.set(index, node); else trackButtons.current.delete(index); }} aria-pressed={selected.track === index} onClick={() => { setSelected({ track: index, clip: item.active }); navigateView("mixer", true); requestAnimationFrame(() => mixerHeading.current?.focus({ preventScroll: true })); }}><span className="mu-track-index">{String(index + 1).padStart(2, "0")}</span><span>{item.name}</span></Button>)}
              {scenes.map((scene, sceneIndex) => <div className="mu-scene-row" key={scene}>
                <Button variant="ghost" className="mu-scene-launch" aria-label={`Launch ${scene}`} onClick={() => launchScene(sceneIndex)}><Icon name="play" size={12} /><span>{scene}</span></Button>
                {session.tracks.map((item, trackIndex) => <Button key={item.id} variant={item.active === sceneIndex ? "primary" : "ghost"} className="mu-clip" data-mobile-active={selected.track === trackIndex} ref={node => { const key = `${trackIndex}:${sceneIndex}`; if (node) launchers.current.set(key, node); else launchers.current.delete(key); }} aria-pressed={item.active === sceneIndex} aria-label={`Launch ${item.clips[sceneIndex]!.name}, ${item.name}`} onClick={() => { updateTrack(trackIndex, value => ({ ...value, active: sceneIndex })); setSelected({ track: trackIndex, clip: sceneIndex }); navigateView("clip", true); setNotice(`${item.clips[sceneIndex]!.name} selected for ${item.name}.`); requestAnimationFrame(() => editorHeading.current?.focus({ preventScroll: true })); }}><span><Icon name={item.active === sceneIndex && playing ? "activity" : "play"} size={12} />{item.clips[sceneIndex]!.name}</span><span className="mu-mini-pattern" aria-hidden="true">{item.clips[sceneIndex]!.steps.map((active, step) => <i key={`step-${step}`} data-active={active} />)}</span></Button>)}
              </div>)}
            </div>
          </div>
          <div className="mu-session-end"><span><i className={playing ? "mu-running" : ""} />{playing ? "Audio engine running" : "Audio engine stopped"}</span><span>One bar per clip · 16 steps</span></div>
        </section>
        <section className="mu-editor" aria-label="Clip editor">
          <div className="mu-panel-heading"><Button variant="ghost" className="mu-context-back" aria-label="Back to session clips" onClick={() => returnToSession("clip")}><Icon name="arrow-left" size={16} /></Button><div><span className="mu-eyebrow">{track.name} / {scenes[selected.clip]}</span><h2 ref={editorHeading} tabIndex={-1}>{clip.name}</h2></div><span>{clip.steps.filter(Boolean).length} notes</span></div>
          <div className="mu-editor-tools"><Input label="Clip name" value={clip.name} maxLength={48} onChange={event => editClip(value => ({ ...value, name: event.target.value }))} /><div><label id="mu-root-label">Root note</label><Select fullWidth aria-labelledby="mu-root-label" options={notes} value={String(clip.root)} disabled={track.instrument === "kick" || track.instrument === "hat"} onValueChange={value => editClip(item => ({ ...item, root: Number(value) }))} /></div></div>
          <div className="mu-pattern-viewport" role="region" aria-label="Sixteen-step pattern" tabIndex={0}>
            <div className="mu-beats" aria-hidden="true">{[1, 2, 3, 4].map(beat => <span key={beat}>Beat {beat}</span>)}</div>
            <div className="mu-steps" role="group" aria-label="Pattern steps">{[0, 1, 2, 3].map(beat => <div className="mu-beat-row" key={beat}><span className="mu-beat-title" aria-hidden="true">Beat {beat + 1}</span>{clip.steps.slice(beat * 4, beat * 4 + 4).map((active, offset) => { const step = beat * 4 + offset; return <Button key={`step-${step}`} variant={active ? "primary" : "ghost"} className="mu-step" data-current={playing && track.active === selected.clip && playhead.step === step} aria-label={`Step ${step + 1}`} aria-pressed={active} onClick={() => editClip(item => ({ ...item, steps: item.steps.map((value, index) => index === step ? !value : value) }))} onKeyDown={event => {
              const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
              if (!direction && event.key !== "Home" && event.key !== "End") return;
              event.preventDefault(); const next = event.key === "Home" ? 0 : event.key === "End" ? 15 : (step + direction + 16) % 16;
              event.currentTarget.closest(".mu-steps")?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
            }}><span>{String(step + 1).padStart(2, "0")}</span><i aria-hidden="true" /></Button>; })}</div>)}</div>
          </div>
          <div className="mu-editor-actions"><span>Click a step to add or remove a note.</span><div><Button variant="ghost" size="sm" disabled={!clip.steps.some(Boolean)} onClick={() => { editClip(value => ({ ...value, steps: value.steps.map(() => false) })); setNotice("Pattern cleared. Undo restores it."); }}>Clear</Button><Button variant="ghost" size="sm" disabled={!undo} onClick={() => { if (undo) setSession(current => ({ ...current, tracks: current.tracks.map(item => item.id === undo.trackId ? { ...item, clips: item.clips.map((value, index) => index === undo.clipIndex ? undo.clip : value) } : item) })); setUndo(null); setNotice("Last clip edit undone."); }}>Undo</Button></div></div>
        </section>
        <aside className="mu-mixer" aria-label="Instrument and mixer">
          <div className="mu-panel-heading"><Button variant="ghost" className="mu-context-back" aria-label="Back to session tracks" onClick={() => returnToSession("mixer")}><Icon name="arrow-left" size={16} /></Button><div><span className="mu-eyebrow">Instrument</span><h2 ref={mixerHeading} tabIndex={-1}>{track.name}</h2></div><span>{String(selected.track + 1).padStart(2, "0")}</span></div>
          <Select aria-label="Mixer track" fullWidth value={String(selected.track)} options={session.tracks.map((item, index) => ({ value: String(index), label: item.name }))} onValueChange={value => setSelected({ track: Number(value), clip: session.tracks[Number(value)]!.active })} />
          <div className="mu-device"><svg viewBox="0 0 240 60" role="img" aria-label={`${track.name} illustrative waveform`}><path d={track.instrument === "hat" ? "M0 30L5 2L10 56L16 10L21 42L30 20L40 37L52 26L64 33L80 29H240" : track.instrument === "kick" ? "M0 30C8 -12 16 -12 24 30S40 72 48 30S64 -2 78 30S99 52 115 30S140 17 160 30S190 36 205 30H240" : "M0 30C10 3 20 3 30 30S50 57 60 30S80 3 90 30S110 57 120 30S140 3 150 30S170 57 180 30S200 3 210 30S230 57 240 30"} /></svg><ParameterKnob label="Tone" value={track.tone} min={0} max={100} unit="%" onValueChange={tone => updateTrack(selected.track, item => ({ ...item, tone }))} /></div>
          <ChannelStrip label={`${track.name} channel`} value={track.channel} onValueChange={channel => updateTrack(selected.track, item => ({ ...item, channel }))} />
          <AudioMeter label="Channel levels" min={-60} max={0} channels={session.tracks.map((item, index) => ({ id: item.id, label: item.name, level: playing ? Math.round(playhead.levels[index]! * 10) / 10 : -Infinity }))} />
        </aside>
      </div>
      <footer className="mu-footer"><p role="status">{notice}</p><div><Button variant="ghost" size="sm" onClick={() => { download(new Blob([JSON.stringify(session, null, 2)], { type: "application/json" }), "vlak-session.json"); setNotice("Editable session saved as JSON."); }}><Icon name="download" size={16} />Save session</Button><Button size="sm" disabled={exporting} onClick={exportAudio}><Icon name="download" size={16} />{exporting ? "Rendering…" : "Export audio"}</Button></div></footer>
    </div>
  </div>;
}
