export const equalizerBands = [
  { frequency: 80, label: "80 Hz", type: "lowshelf" },
  { frequency: 250, label: "250 Hz", type: "peaking" },
  { frequency: 1000, label: "1 kHz", type: "peaking" },
  { frequency: 4000, label: "4 kHz", type: "peaking" },
  { frequency: 12000, label: "12 kHz", type: "highshelf" },
] as const;
export type ProcessingMode = "ready" | "processed" | "direct";
export type AudioReading = { levels: number[]; rms: number | null; active: boolean };
export const silentReading = (): AudioReading => ({ levels: Array.from({ length: 24 }, () => 0), rms: null, active: false });

/** Created without an AudioContext; prepare is called only by an explicit playback request. */
export class ListeningAudioGraph {
  private context: AudioContext | null = null;
  private filters: BiquadFilterNode[] = [];
  private analyser: AnalyserNode | null = null;
  private sources = new WeakMap<HTMLAudioElement, MediaElementAudioSourceNode | false>();
  private preparing = new WeakMap<HTMLAudioElement, Promise<ProcessingMode>>();
  private sourceNodes = new Set<MediaElementAudioSourceNode>();
  private requests = new Set<AbortController>();
  private previewSupport = new Map<string, boolean>();
  private current: HTMLAudioElement | null = null;
  private gains = [0, 0, 0, 0, 0];
  private bypass = false;
  private disposed = false;
  private frequencies = new Float32Array(1024);
  private samples = new Float32Array(2048);
  onInterrupted: (() => void) | null = null;

  activate() {
    if (!this.disposed) return;
    this.disposed = false; this.context = null; this.filters = []; this.analyser = null;
    this.sources = new WeakMap(); this.preparing = new WeakMap(); this.previewSupport.clear();
  }

  async prepare(audio: HTMLAudioElement): Promise<ProcessingMode> {
    const pending = this.preparing.get(audio);
    if (pending) return pending;
    const task = this.prepareSource(audio);
    this.preparing.set(audio, task);
    try { return await task; } finally { this.preparing.delete(audio); }
  }
  /** A metadata-only probe runs on selection, never in the Play gesture path. */
  async probe(url: string): Promise<boolean> {
    if (url.startsWith("blob:") || url.startsWith("data:")) return true;
    const controller = new AbortController(); this.requests.add(controller);
    const timeout = window.setTimeout(() => controller.abort(), 3500);
    let allowed = false;
    try {
      const response = await fetch(url, { method: "HEAD", mode: "cors", cache: "no-store", signal: controller.signal });
      allowed = response.ok && response.type !== "opaque";
    } catch { allowed = false; }
    finally { clearTimeout(timeout); this.requests.delete(controller); }
    if (!this.disposed && !controller.signal.aborted) this.previewSupport.set(url, allowed);
    return allowed;
  }
  private async prepareSource(audio: HTMLAudioElement): Promise<ProcessingMode> {
    if (this.disposed || !audio.isConnected) throw new Error("Recording changed");
    const previous = this.sources.get(audio);
    if (previous === false) return "direct";
    const local = audio.src.startsWith("blob:") || audio.src.startsWith("data:");
    // Pressing Play before the probe finishes remains immediate and audible.
    // This element stays direct; a non-CORS MediaElementSource would be silent.
    if (!previous && !local && this.previewSupport.get(audio.src) !== true) {
      this.sources.set(audio, false); return "direct";
    }
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.context.onstatechange = () => { if (!this.disposed && this.current && !this.current.paused && this.context?.state !== "running") this.onInterrupted?.(); };
        this.filters = equalizerBands.map(band => { const filter = this.context!.createBiquadFilter(); filter.type = band.type; filter.frequency.value = band.frequency; filter.Q.value = .8; return filter; });
        this.analyser = this.context.createAnalyser(); this.analyser.fftSize = 2048; this.analyser.smoothingTimeConstant = .65;
        this.filters.forEach((filter, index) => { filter.connect(this.filters[index + 1] ?? this.analyser!); });
        this.analyser.connect(this.context.destination);
        this.update(this.gains, this.bypass);
      }
    } catch (error) {
      if (previous) throw error;
      this.sources.set(audio, false); return "direct";
    }
    if (this.current && this.current !== audio) this.detach(this.current);
    if (previous) {
      if (!this.sourceNodes.has(previous)) { previous.connect(this.filters[0]!); this.sourceNodes.add(previous); }
    } else {
      if (!local) { audio.crossOrigin = "anonymous"; audio.load(); }
      const source = this.context.createMediaElementSource(audio);
      source.connect(this.filters[0]!); this.sources.set(audio, source); this.sourceNodes.add(source);
    }
    this.current = audio;
    // Node construction and resume both happen before the first await. The
    // caller invokes audio.play in the same gesture, including Safari/iOS.
    await this.context.resume();
    if (this.disposed || !audio.isConnected) throw new Error("Recording changed");
    if (this.context.state !== "running") throw new Error("Audio context paused");
    return "processed";
  }
  update(gains: readonly number[], bypass: boolean) {
    this.gains = equalizerBands.map((_, index) => Math.max(-12, Math.min(12, gains[index] ?? 0)));
    this.bypass = bypass;
    const time = this.context?.currentTime ?? 0;
    this.filters.forEach((filter, index) => { filter.gain.cancelScheduledValues(time); filter.gain.setTargetAtTime(bypass ? 0 : this.gains[index]!, time, .012); });
  }
  read(): AudioReading {
    if (!this.analyser || this.context?.state !== "running" || !this.current || this.current.paused) return silentReading();
    this.analyser.getFloatFrequencyData(this.frequencies);
    this.analyser.getFloatTimeDomainData(this.samples);
    const binWidth = this.context.sampleRate / this.analyser.fftSize;
    const levels = Array.from({ length: 24 }, (_, index) => {
      const from = Math.max(0, Math.floor(40 * (400 ** (index / 24)) / binWidth));
      const to = Math.min(this.frequencies.length - 1, Math.ceil(40 * (400 ** ((index + 1) / 24)) / binWidth));
      let loudest = -100;
      for (let bin = from; bin <= to; bin += 1) loudest = Math.max(loudest, this.frequencies[bin] ?? -100);
      return Math.max(0, Math.min(1, (loudest + 80) / 80));
    });
    const power = this.samples.reduce((sum, value) => sum + value * value, 0) / this.samples.length;
    return { levels, rms: power > 0 ? 10 * Math.log10(power) : null, active: true };
  }
  detach(audio: HTMLAudioElement) {
    const source = this.sources.get(audio);
    if (source) { source.disconnect(); this.sourceNodes.delete(source); }
    if (this.current === audio) this.current = null;
  }
  dispose() {
    this.disposed = true;
    this.requests.forEach(request => { request.abort(); }); this.requests.clear();
    this.sourceNodes.forEach(source => { source.disconnect(); }); this.sourceNodes.clear();
    this.filters.forEach(filter => { filter.disconnect(); }); this.analyser?.disconnect();
    this.current = null;
    if (this.context) { this.context.onstatechange = null; void this.context.close().catch(() => {}); }
  }
}
