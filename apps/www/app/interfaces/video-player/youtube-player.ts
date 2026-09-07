export type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void | Promise<number | undefined>;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoLoadedFraction: () => number;
  getVolume: () => number;
  setVolume: (volume: number) => void;
  isMuted: () => boolean;
  mute: () => void;
  unMute: () => void;
  getPlaybackRate: () => number;
  setPlaybackRate: (rate: number) => void;
  getAvailablePlaybackRates: () => number[];
  getPlayerState: () => number;
  destroy: () => void;
};
export type PlayerEvent = { target: YouTubePlayer; data: number };
export type PlayerEvents = { onReady: (event: PlayerEvent) => void; onStateChange: (event: PlayerEvent) => void; onError: (event: PlayerEvent) => void; onAutoplayBlocked: () => void; onControlError?: (message: string) => void };
export type PlayerApi = { Player: new (iframe: HTMLIFrameElement, options: { events: PlayerEvents }) => YouTubePlayer };
type YouTubeWindow = Window & { YT?: PlayerApi & { loading?: number }; onYouTubeIframeAPIReady?: () => void };
let loading: Promise<PlayerApi> | undefined;

/** The official iframe API, shared by any player mounted in this page. */
export function loadYouTubeApi(): Promise<PlayerApi> {
  const host = window as YouTubeWindow;
  if (host.YT?.Player) return Promise.resolve(host.YT);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const previous = host.onYouTubeIframeAPIReady;
    const script = document.createElement("script");
    let finished = false;
    const complete = () => {
      previous?.();
      if (finished || !host.YT?.Player) return;
      finished = true; window.clearTimeout(timeout); resolve(host.YT);
    };
    const fail = () => {
      if (finished) return;
      finished = true; window.clearTimeout(timeout); loading = undefined; script.remove();
      if (!host.YT?.Player && host.YT) {
        host.YT.loading = 0;
        for (const widget of document.querySelectorAll<HTMLScriptElement>('script[src^="https://www.youtube.com/s/player/"]')) if (widget.src.includes("/www-widgetapi")) widget.remove();
      }
      if (host.onYouTubeIframeAPIReady === complete) host.onYouTubeIframeAPIReady = previous;
      reject(new Error("YouTube controls could not connect"));
    };
    const timeout = window.setTimeout(fail, 15000);
    host.onYouTubeIframeAPIReady = complete;
    script.src = "https://www.youtube.com/iframe_api"; script.async = true; script.onerror = fail;
    document.head.appendChild(script);
  });
  return loading;
}
