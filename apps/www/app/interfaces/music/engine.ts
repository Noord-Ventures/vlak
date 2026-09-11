import type { ChannelStripValue } from "@noorddev/vlak-react";

export type Instrument = "kick" | "hat" | "bass" | "keys";
export interface Clip { id: string; name: string; steps: boolean[]; root: number }
export interface Track { id: string; name: string; instrument: Instrument; active: number; tone: number; channel: ChannelStripValue; clips: Clip[] }
export interface Session { name: string; tempo: number; tracks: Track[] }
const pattern = (positions: number[]) => Array.from({ length: 16 }, (_, index) => positions.includes(index));
const scenes = ["First light", "Open space", "After hours", "Home again"];
export const legacyClipId = (trackId: string, index: number) => `${trackId}:clip:${index + 1}`;

export function initialSession(): Session {
  return { name: "A little room", tempo: 112, tracks: [
    { id: "drums", name: "Drum machine", instrument: "kick", active: 0, tone: 48, channel: { gain: -4, pan: 0, muted: false, solo: false }, clips: scenes.map((_, i) => ({ id: legacyClipId("drums", i), name: ["Four on the floor", "Half time", "Off balance", "Steady return"][i]!, root: 36, steps: pattern([[0, 4, 8, 12], [0, 8, 11], [0, 3, 8, 10, 14], [0, 4, 8, 12, 15]][i]!) })) },
    { id: "hats", name: "Closed hats", instrument: "hat", active: 0, tone: 64, channel: { gain: -14, pan: 16, muted: false, solo: false }, clips: scenes.map((_, i) => ({ id: legacyClipId("hats", i), name: ["In between", "Little skips", "Sixteenths", "Breathing room"][i]!, root: 60, steps: pattern([[2, 6, 10, 14], [2, 5, 6, 10, 14, 15], [0, 2, 4, 6, 8, 10, 12, 14], [2, 6, 14]][i]!) })) },
    { id: "bass", name: "Round bass", instrument: "bass", active: 0, tone: 38, channel: { gain: -9, pan: -8, muted: false, solo: false }, clips: scenes.map((_, i) => ({ id: legacyClipId("bass", i), name: ["Rooted", "Small motion", "A longer walk", "Back to one"][i]!, root: [45, 48, 41, 45][i]!, steps: pattern([[0, 3, 6, 8, 11, 14], [0, 6, 8, 14], [0, 2, 5, 8, 10, 13], [0, 3, 8, 11]][i]!) })) },
    { id: "keys", name: "Soft keys", instrument: "keys", active: 0, tone: 56, channel: { gain: -14, pan: 22, muted: false, solo: false }, clips: scenes.map((_, i) => ({ id: legacyClipId("keys", i), name: ["Soft edges", "Window light", "Night air", "Still here"][i]!, root: [57, 60, 53, 57][i]!, steps: pattern([[0, 6, 10], [0, 8], [2, 6, 12], [0, 10]][i]!) })) },
  ] };
}

const level = (db: number) => 10 ** (db / 20);
const frequency = (note: number) => 440 * 2 ** ((note - 69) / 12);
const releaseDuration = (track: Track, beat: number) => track.instrument === "hat" ? 0.06 + track.tone / 1000 : track.instrument === "keys" ? beat * 2.5 : track.instrument === "kick" ? 0.22 : beat * 0.66;
interface Voice { stop(): void }

function playNote(context: BaseAudioContext, destination: AudioNode, track: Track, step: number, at: number, beat: number, onEnded?: () => void): Voice | undefined {
  const clip = track.clips[track.active]!;
  if (!clip.steps[step]) return;
  const envelope = context.createGain();
  const filter = context.createBiquadFilter();
  filter.type = track.instrument === "hat" ? "highpass" : "lowpass";
  filter.frequency.value = track.instrument === "hat" ? 4500 + track.tone * 60 : 250 + track.tone * 42;
  filter.connect(envelope); envelope.connect(destination);
  const duration = releaseDuration(track, beat);
  envelope.gain.setValueAtTime(0, at);
  envelope.gain.linearRampToValueAtTime(track.instrument === "keys" ? 0.16 : 0.5, at + 0.005);
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  const sources: AudioScheduledSourceNode[] = [];
  let ended = false;
  const end = () => {
    if (ended) return;
    ended = true;
    for (const source of sources) { source.onended = null; source.disconnect(); }
    envelope.disconnect(); filter.disconnect(); onEnded?.();
  };
  const voice: Voice = { stop() {
    if (ended) return;
    for (const source of sources) source.stop(context.currentTime);
    end();
  } };
  if (track.instrument === "hat") {
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
    const data = buffer.getChannelData(0);
    let seed = 1433 + step;
    for (let i = 0; i < data.length; i++) { seed = (seed * 16807) % 2147483647; data[i] = seed / 1073741824 - 1; }
    const noise = context.createBufferSource(); noise.buffer = buffer; noise.connect(filter);
    sources.push(noise); noise.start(at); noise.stop(at + duration); noise.onended = end;
    return voice;
  }
  const notes = track.instrument === "keys" ? [clip.root, clip.root + 3, clip.root + 7] : [clip.root + (track.instrument === "bass" && step % 8 === 6 ? 7 : 0)];
  let pending = notes.length;
  for (const note of notes) {
    const oscillator = context.createOscillator();
    oscillator.type = track.instrument === "kick" ? "sine" : track.instrument === "bass" ? "triangle" : "sine";
    if (track.instrument === "kick") { oscillator.frequency.setValueAtTime(110 + track.tone, at); oscillator.frequency.exponentialRampToValueAtTime(42, at + 0.12); }
    else oscillator.frequency.value = frequency(note);
    sources.push(oscillator); oscillator.connect(filter); oscillator.start(at); oscillator.stop(at + duration);
    oscillator.onended = () => { pending--; if (!pending) end(); };
  }
  return voice;
}

function routing(context: BaseAudioContext, tracks: Track[]) {
  const master = context.createGain(); master.gain.value = 0.7;
  const limiter = context.createDynamicsCompressor(); limiter.threshold.value = -6; limiter.knee.value = 4; limiter.ratio.value = 12; limiter.attack.value = 0.002; limiter.release.value = 0.08;
  master.connect(limiter); limiter.connect(context.destination);
  const channels = tracks.map(() => {
    const gain = context.createGain(); const pan = context.createStereoPanner(); const analyser = context.createAnalyser(); analyser.fftSize = 256;
    gain.connect(pan); pan.connect(analyser); analyser.connect(master);
    return { gain, pan, analyser, samples: new Float32Array(256) };
  });
  return { channels, master };
}

export class SessionEngine {
  private context: AudioContext;
  private graph: ReturnType<typeof routing>;
  private session: Session;
  private timer: ReturnType<typeof setInterval> | undefined;
  private nextTime = 0;
  private tick = 0;
  private queue: { step: number; bar: number; at: number }[] = [];
  private displayed = { step: -1, bar: 1 };
  private voices = new Set<Voice>();
  constructor(session: Session) {
    this.context = new AudioContext(); this.session = session; this.graph = routing(this.context, session.tracks); this.update(session);
  }
  update(session: Session) {
    this.session = session;
    const hasSolo = session.tracks.some(track => track.channel.solo);
    session.tracks.forEach((track, i) => {
      const { gain, pan } = this.graph.channels[i]!;
      gain.gain.setTargetAtTime(track.channel.muted || (hasSolo && !track.channel.solo) ? 0 : level(track.channel.gain), this.context.currentTime, 0.01);
      pan.pan.setTargetAtTime(track.channel.pan / 100, this.context.currentTime, 0.01);
    });
  }
  async start() {
    await this.context.resume();
    if (this.context.state !== "running") throw new Error("The browser did not resume its audio context.");
    if (this.timer) return;
    this.graph.master.gain.cancelScheduledValues(this.context.currentTime); this.graph.master.gain.setTargetAtTime(0.7, this.context.currentTime, 0.01);
    this.nextTime = this.context.currentTime + 0.05; this.tick = 0; this.queue = [];
    this.schedule(); this.timer = setInterval(() => this.schedule(), 25);
  }
  private schedule() {
    while (this.nextTime < this.context.currentTime + 0.12) {
      const step = this.tick % 16;
      const beat = 60 / this.session.tempo;
      this.session.tracks.forEach((track, i) => {
        const voice = playNote(this.context, this.graph.channels[i]!.gain, track, step, this.nextTime, beat, () => { if (voice) this.voices.delete(voice); });
        if (voice) this.voices.add(voice);
      });
      this.queue.push({ step, bar: Math.floor(this.tick / 16) + 1, at: this.nextTime });
      this.tick++; this.nextTime += beat / 4;
    }
  }
  read() {
    while (this.queue[0] && this.queue[0].at <= this.context.currentTime) this.displayed = this.queue.shift()!;
    return { ...this.displayed, state: this.context.state, levels: this.graph.channels.map(channel => {
      channel.analyser.getFloatTimeDomainData(channel.samples);
      const rms = Math.sqrt(channel.samples.reduce((sum, sample) => sum + sample * sample, 0) / channel.samples.length);
      return rms > 0 ? 20 * Math.log10(rms) : Number.NEGATIVE_INFINITY;
    }) };
  }
  stop() {
    clearInterval(this.timer); this.timer = undefined; this.queue = []; this.displayed = { step: -1, bar: 1 };
    for (const voice of this.voices) voice.stop();
    this.voices.clear();
    this.graph.master.gain.cancelScheduledValues(this.context.currentTime); this.graph.master.gain.setTargetAtTime(0, this.context.currentTime, 0.008);
  }
  dispose() { this.stop(); void this.context.close(); }
}

export async function renderSession(session: Session): Promise<Blob> {
  const beat = 60 / session.tempo;
  const tail = Math.max(1.5, ...session.tracks.map(track => releaseDuration(track, beat)));
  const context = new OfflineAudioContext(2, Math.ceil((beat * 16 + tail) * 44100), 44100);
  const { channels } = routing(context, session.tracks);
  const hasSolo = session.tracks.some(track => track.channel.solo);
  session.tracks.forEach((track, index) => {
    channels[index]!.gain.gain.value = track.channel.muted || (hasSolo && !track.channel.solo) ? 0 : level(track.channel.gain);
    channels[index]!.pan.pan.value = track.channel.pan / 100;
    for (let tick = 0; tick < 64; tick++) playNote(context, channels[index]!.gain, track, tick % 16, tick * beat / 4, beat);
  });
  const audio = await context.startRendering();
  const data = new ArrayBuffer(44 + audio.length * 4); const view = new DataView(data);
  const text = (offset: number, value: string) => { [...value].forEach((character, i) => { view.setUint8(offset + i, character.charCodeAt(0)); }); };
  text(0, "RIFF"); view.setUint32(4, data.byteLength - 8, true); text(8, "WAVE"); text(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 2, true); view.setUint32(24, 44100, true); view.setUint32(28, 176400, true); view.setUint16(32, 4, true); view.setUint16(34, 16, true); text(36, "data"); view.setUint32(40, audio.length * 4, true);
  const left = audio.getChannelData(0); const right = audio.getChannelData(1);
  for (let frame = 0; frame < audio.length; frame++) for (let channel = 0; channel < 2; channel++) {
    const value = Math.max(-1, Math.min(1, (channel ? right : left)[frame]!));
    view.setInt16(44 + (frame * 2 + channel) * 2, Math.round(value * (value < 0 ? 32768 : 32767)), true);
  }
  return new Blob([data], { type: "audio/wav" });
}
