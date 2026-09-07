import type { PlayerApi, PlayerEvents, YouTubePlayer } from "./youtube-player";

type VimeoEvent = { method?: string; muted?: boolean; seconds?: number; duration?: number; percent?: number; volume?: number; playbackRate?: number };
type VimeoPlayer = {
  ready: () => Promise<void>;
  on: (event: string, listener: (event: VimeoEvent) => void) => void;
  getDuration: () => Promise<number>;
  getCurrentTime: () => Promise<number>;
  getVolume: () => Promise<number>;
  getMuted: () => Promise<boolean>;
  getPlaybackRate: () => Promise<number>;
  getPaused: () => Promise<boolean>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  setCurrentTime: (seconds: number) => Promise<number>;
  setVolume: (volume: number) => Promise<number>;
  setMuted: (muted: boolean) => Promise<boolean>;
  setPlaybackRate: (rate: number) => Promise<number>;
  destroy: () => Promise<void>;
};
type VimeoSdk = { Player: new (iframe: HTMLIFrameElement) => VimeoPlayer };
type VimeoWindow = Window & { Vimeo?: VimeoSdk };
let loading: Promise<VimeoSdk> | undefined;

function loadSdk(): Promise<VimeoSdk> {
  const host = window as VimeoWindow;
  if (host.Vimeo?.Player) return Promise.resolve(host.Vimeo);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    let finished = false;
    const detach = () => { script.onload = null; script.onerror = null; };
    const fail = () => { if (finished) return; finished = true; window.clearTimeout(timeout); detach(); script.remove(); loading = undefined; reject(new Error("Vimeo controls could not connect")); };
    const timeout = window.setTimeout(fail, 15000);
    script.src = "https://player.vimeo.com/api/player.js"; script.async = true;
    script.onerror = fail;
    script.onload = () => { if (finished) return; if (host.Vimeo?.Player) { finished = true; window.clearTimeout(timeout); detach(); resolve(host.Vimeo); } else fail(); };
    document.head.appendChild(script);
  });
  return loading;
}

/** Native Vimeo events feed the same transport used by the YouTube controls. */
export async function loadVimeoApi(): Promise<PlayerApi> {
  const sdk = await loadSdk();
  return { Player: class implements YouTubePlayer {
    private media: VimeoPlayer;
    private events: PlayerEvents;
    private disposed = false;
    private state = 5;
    private time = 0;
    private duration = 0;
    private buffered = 0;
    private volume = 100;
    private muted = false;
    private rate = 1;
    private seekGeneration = 0;
    constructor(iframe: HTMLIFrameElement, { events }: { events: PlayerEvents }) {
      this.media = new sdk.Player(iframe); this.events = events;
      this.media.on("play", () => this.change(1));
      this.media.on("pause", () => this.change(2));
      this.media.on("ended", () => this.change(0));
      this.media.on("bufferstart", () => this.change(3));
      this.media.on("bufferend", () => { void this.media.getPaused().then(paused => this.change(paused ? 2 : 1)).catch(() => {}); });
      this.media.on("timeupdate", event => { if (this.disposed) return; this.time = event.seconds ?? this.time; this.duration = event.duration ?? this.duration; });
      this.media.on("progress", event => { if (!this.disposed) this.buffered = event.percent ?? this.buffered; });
      this.media.on("volumechange", event => { if (this.disposed) return; this.volume = (event.volume ?? this.volume / 100) * 100; this.muted = event.muted ?? this.muted; });
      this.media.on("playbackratechange", event => { if (!this.disposed) this.rate = event.playbackRate ?? this.rate; });
      this.media.on("error", event => { if (!this.disposed && !event.method) events.onError({ target: this, data: -1 }); });
      void this.media.ready().then(async () => {
        const [duration, time, volume, muted, rate, paused] = await Promise.all([this.media.getDuration(), this.media.getCurrentTime(), this.media.getVolume(), this.media.getMuted(), this.media.getPlaybackRate(), this.media.getPaused()]);
        if (this.disposed) return;
        this.duration = duration; this.time = time; this.volume = volume * 100; this.muted = muted; this.rate = rate; this.state = paused ? 5 : 1;
        events.onReady({ target: this, data: this.state });
      }).catch(() => { if (!this.disposed) events.onError({ target: this, data: -1 }); });
    }
    private change(state: number) { if (!this.disposed) { this.state = state; this.events.onStateChange({ target: this, data: state }); } }
    private controlError(message: string) { if (!this.disposed) this.events.onControlError?.(message); }
    playVideo() { void this.media.play().catch(() => { if (!this.disposed) this.events.onAutoplayBlocked(); }); }
    pauseVideo() { void this.media.pause().catch(() => this.controlError("Use the pause control inside the video.")); }
    seekTo(seconds: number) { const generation = ++this.seekGeneration; return this.media.setCurrentTime(seconds).then(time => { if (!this.disposed && generation === this.seekGeneration) this.time = time; return time; }).catch(() => { if (generation === this.seekGeneration) this.controlError("This video could not seek. Try again."); return undefined; }); }
    setVolume(volume: number) { return this.media.setVolume(volume / 100).then(value => { if (!this.disposed) this.volume = value * 100; }).catch(() => this.controlError("Use the volume control inside the video.")); }
    mute() { return this.media.setMuted(true).then(muted => { if (!this.disposed) this.muted = muted; }).catch(() => this.controlError("Use the mute control inside the video.")); }
    unMute() { return this.media.setMuted(false).then(muted => { if (!this.disposed) this.muted = muted; }).catch(() => this.controlError("Use the sound control inside the video.")); }
    setPlaybackRate(rate: number) { return this.media.setPlaybackRate(rate).then(value => { if (!this.disposed) this.rate = value; }).catch(() => this.controlError("This playback speed is unavailable for this video.")); }
    getCurrentTime() { return this.time; }
    getDuration() { return this.duration; }
    getVideoLoadedFraction() { return this.buffered; }
    getVolume() { return this.volume; }
    isMuted() { return this.muted; }
    getPlaybackRate() { return this.rate; }
    getAvailablePlaybackRates() { return [.5, .75, 1, 1.25, 1.5, 2]; }
    getPlayerState() { return this.state; }
    destroy() { this.disposed = true; void this.media.destroy().catch(() => {}); }
  } };
}
