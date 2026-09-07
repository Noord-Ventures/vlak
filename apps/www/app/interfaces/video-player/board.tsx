"use client";

import * as React from "react";
import { Button, Icon, MediaScrubber, NativeSelect, PlaybackControls, Slider } from "@noorddev/vlak-react";
import { loadYouTubeApi, type YouTubePlayer } from "./youtube-player";
import { loadVimeoApi } from "./vimeo-player";
import { videos, watchUrl, providerName } from "./data";
import "./scene.css";

export function VideoPlayerBoard() {
  const [selected, setSelected] = React.useState(1);
  const [screen, setScreen] = React.useState<"watching" | "library">("watching");
  const [ready, setReady] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const [position, setPosition] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [buffered, setBuffered] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [muted, setMuted] = React.useState(false);
  const [speed, setSpeed] = React.useState(1);
  const [rates, setRates] = React.useState([1]);
  const [loop, setLoop] = React.useState(false);
  const [status, setStatus] = React.useState("Connecting to YouTube…");
  const [failed, setFailed] = React.useState(false);
  const [errorCode, setErrorCode] = React.useState<number | null>(null);
  const [canFullscreen, setCanFullscreen] = React.useState(false);
  const [fullscreen, setFullscreen] = React.useState(false);
  const viewer = React.useRef<HTMLDivElement>(null);
  const mount = React.useRef<HTMLDivElement>(null);
  const player = React.useRef<YouTubePlayer | null>(null);
  const pendingSeek = React.useRef<{ target: number; started: number } | null>(null);
  const preferences = React.useRef({ volume, muted, speed, loop });
  preferences.current = { volume, muted, speed, loop };
  const autoplay = React.useRef(false);
  const [attempt, setAttempt] = React.useState(0);
  const clip = videos[selected]!;
  const provider = providerName(clip);

  React.useEffect(() => {
    setCanFullscreen(Boolean(document.fullscreenEnabled));
    const changed = () => setFullscreen(document.fullscreenElement === viewer.current);
    document.addEventListener("fullscreenchange", changed);
    return () => document.removeEventListener("fullscreenchange", changed);
  }, []);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Retry deliberately remounts the selected official embed.
  React.useEffect(() => {
    const container = mount.current;
    if (!container) return;
    let cancelled = false, playbackError = false, instance: YouTubePlayer | undefined, poll: number | undefined;
    pendingSeek.current = null;
    const stopPolling = () => { if (poll !== undefined) window.clearInterval(poll); poll = undefined; };
    setReady(false); setPlaying(false); setPosition(0); setDuration(0); setBuffered(0); setRates([1]); setFailed(false); setErrorCode(null); setStatus(`Connecting to ${provider}…`);
    const iframe = document.createElement("iframe");
    iframe.title = `${clip.artist} · ${clip.title}, official music video`;
    iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    iframe.allowFullscreen = true; iframe.referrerPolicy = "strict-origin-when-cross-origin";
    const query = new URLSearchParams({ enablejsapi: "1", origin: window.location.origin, playsinline: "1", rel: "0", controls: "1", hl: "en" });
    iframe.src = clip.provider === "vimeo" ? `https://player.vimeo.com/video/${clip.id}?playsinline=1&autoplay=0&dnt=1` : `https://www.youtube.com/embed/${clip.id}?${query}`;
    container.replaceChildren(iframe);
    const readyTimeout = window.setTimeout(() => {
      if (cancelled) return;
      setFailed(true); setStatus(`The video is taking longer to connect. Retry or open it on ${provider}.`);
    }, 15000);
    const sync = (current: YouTubePlayer) => {
      if (cancelled || playbackError) return;
      const length = current.getDuration();
      setDuration(Number.isFinite(length) ? length : 0);
      const actualPosition = current.getCurrentTime() || 0;
      const pending = pendingSeek.current;
      if (pending && (Math.abs(actualPosition - pending.target) < 1 || performance.now() - pending.started > 3000)) pendingSeek.current = null;
      setPosition(pendingSeek.current?.target ?? actualPosition);
      setBuffered((current.getVideoLoadedFraction() || 0) * (length || 0));
      setVolume(current.getVolume() / 100); setMuted(current.isMuted()); setSpeed(current.getPlaybackRate());
      setPlaying(current.getPlayerState() === 1);
      const availableRates = current.getAvailablePlaybackRates(); if (availableRates.length) setRates(previous => previous.join() === availableRates.join() ? previous : availableRates);
    };
    void (clip.provider === "vimeo" ? loadVimeoApi() : loadYouTubeApi()).then(api => {
      if (cancelled) return;
      instance = new api.Player(iframe, { events: {
        onReady: async event => {
          if (cancelled || playbackError) return;
          player.current = event.target;
          const saved = preferences.current;
          await Promise.all([event.target.setVolume(saved.volume * 100), saved.muted ? event.target.mute() : event.target.unMute(), event.target.setPlaybackRate(saved.speed)]);
          if (cancelled || playbackError) return;
          window.clearTimeout(readyTimeout); setFailed(false);
          setReady(true); setStatus(""); sync(event.target);
          poll = window.setInterval(() => sync(event.target), 250);
          if (autoplay.current) { autoplay.current = false; event.target.playVideo(); }
        },
        onStateChange: event => {
          if (cancelled || playbackError) return;
          sync(event.target);
          setStatus(event.data === 3 ? "Buffering video…" : event.data === 0 ? "Video finished" : "");
          if (event.data === 0 && preferences.current.loop) { event.target.seekTo(0, true); event.target.playVideo(); }
        },
        onError: event => {
          if (cancelled) return;
          pendingSeek.current = null;
          playbackError = true; window.clearTimeout(readyTimeout); stopPolling(); setFailed(true); setErrorCode(event.data); setPlaying(false);
          setStatus([101, 150, 153].includes(event.data) ? `This video cannot play here. Open it on ${provider} below.` : `${provider} could not play this video. Retry or open it on ${provider}.`);
        },
        onAutoplayBlocked: () => { if (!cancelled) setStatus("Press Play in the video to begin."); },
        ...(clip.provider === "vimeo" ? { onControlError: (message: string) => { if (!cancelled) setStatus(message); } } : {}),
      } });
    }).catch(() => { if (!cancelled) { window.clearTimeout(readyTimeout); setFailed(true); setStatus(`Playback controls could not connect. Retry, use the video controls or open ${provider}.`); } });
    return () => { cancelled = true; pendingSeek.current = null; window.clearTimeout(readyTimeout); stopPolling(); player.current = null; instance?.destroy(); iframe.remove(); };
  }, [clip.id, clip.artist, clip.title, clip.provider, provider, attempt]);

  function selectVideo(index: number) {
    if (index < 0 || index >= videos.length) return;
    setScreen("watching");
    if (index === selected) { player.current?.playVideo(); return; }
    autoplay.current = true; setReady(false); setPlaying(false); setErrorCode(null); setFailed(false); setStatus(`Connecting to ${provider}…`); setSelected(index);
  }
  function togglePlayback(next: boolean) { if (next) player.current?.playVideo(); else player.current?.pauseVideo(); }
  function seek(next: number) {
    const current = player.current;
    if (!current) return;
    const pending = { target: Math.max(0, Math.min(duration, next)), started: performance.now() };
    pendingSeek.current = pending;
    // Keep the controlled range at the requested value while the provider acknowledges it.
    setPosition(pending.target);
    const acknowledgement = current.seekTo(pending.target, true);
    if (acknowledgement) void acknowledgement.then(actual => {
      if (player.current !== current || pendingSeek.current !== pending) return;
      pendingSeek.current = null;
      if (actual !== undefined) setPosition(actual);
    });
  }
  function changeVolume(next: number) { player.current?.setVolume(next * 100); player.current?.unMute(); setVolume(next); setMuted(false); }
  function toggleMute() { if (muted) player.current?.unMute(); else player.current?.mute(); setMuted(!muted); }
  async function toggleFullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await viewer.current?.requestFullscreen(); }
    catch { setStatus("Use the full screen control inside the video."); }
  }

  return <section className="vp" aria-label="Music video workspace" data-screen={screen} data-playing={playing} data-video={clip.id} data-provider={clip.provider} data-ready={ready} data-player-error={errorCode ?? undefined}>
    <header className="vp-header"><span><Icon name="video" size={16} />Screening room</span><span className="vp-local-note">Three films, one place</span><a className="vp-channel rs-link-underline" href={watchUrl(clip)} target="_blank" rel="noreferrer">Watch on {provider}<Icon name="external" size={12} /></a></header>
    <div className="vp-body">
      <div ref={viewer} className="vp-viewer" role="region" aria-label="Watching">
        <div className="vp-stage"><div ref={mount} className="vp-embed" /></div>
        <div className="vp-watch-info"><div><span className="vp-eyebrow">{clip.artist}</span><h2>{clip.title}</h2></div><span>Official music video</span></div>
        <div className="vp-controls"><MediaScrubber aria-label="Video position" value={position} duration={duration} buffered={buffered} disabled={!ready || failed} step={1} onValueChange={seek} />
          <div className="vp-control-row"><PlaybackControls playing={playing} disabled={!ready || failed} label="Video playback" onPlayingChange={togglePlayback} onPrevious={() => selectVideo(selected - 1)} previousLabel="Previous video" previousDisabled={selected === 0} onNext={() => selectVideo(selected + 1)} nextLabel="Next video" nextDisabled={selected === videos.length - 1} />
            <div className="vp-volume"><Button variant="ghost" className="vp-icon" disabled={!ready} aria-label={muted ? "Unmute video" : "Mute video"} onClick={toggleMute}><Icon name={muted || volume === 0 ? "volume-off" : "volume"} size={16} /></Button><Slider aria-label="Video volume" min={0} max={1} step={.05} value={muted ? 0 : volume} disabled={!ready} onValueChange={changeVolume} /></div>
            <div className="vp-display-controls">{canFullscreen && <Button variant="ghost" className="vp-icon" aria-label={fullscreen ? "Exit full screen" : "Full screen"} onClick={() => { void toggleFullscreen(); }}><Icon name={fullscreen ? "minimize" : "expand"} size={16} /></Button>}</div>
          </div>
          <div className="vp-preferences"><label><span>Speed</span><NativeSelect aria-label="Video playback speed" value={String(speed)} disabled={!ready || rates.length < 2} onChange={event => player.current?.setPlaybackRate(Number(event.target.value))}>{rates.map(rate => <option key={rate} value={rate}>{rate}×</option>)}</NativeSelect></label><Button variant="ghost" disabled={!ready} aria-pressed={loop} onClick={() => setLoop(value => !value)}>Loop</Button><span className="vp-native-note">Captions and quality in the video controls</span></div>
          {failed && <div className="vp-recovery"><Button variant="ghost" onClick={() => { setReady(false); setAttempt(value => value + 1); }}>Retry video</Button><a className="rs-link-underline" href={watchUrl(clip)} target="_blank" rel="noreferrer">Open on {provider}<Icon name="external" size={12} /></a></div>}
        </div>
      </div>
      <aside className="vp-library" aria-label="Music video playlist"><header><div><span className="vp-eyebrow">Selected films</span><h2>Playlist <span>03</span></h2></div><Icon name="list" size={16} /></header><ol className="vp-file-list">{videos.map((item, index) => <li key={item.id} data-selected={index === selected}><Button variant="ghost" className="vp-file" aria-label={`Play ${item.artist}, ${item.title}`} aria-current={index === selected ? "true" : undefined} onClick={() => selectVideo(index)}><img src={item.thumbnail} alt="" /><span><span className="vp-file-artist">{item.artist}</span><strong>{item.title}</strong><small>{String(index + 1).padStart(2, "0")} · Official video</small></span></Button></li>)}</ol>
        <div className="vp-library-footer"><p>Official videos from the artists and their labels.</p><details><summary>Playback controls</summary><p>Use the video’s controls for captions, quality and full screen. The video’s own keyboard shortcuts work while it is focused. Your browser may offer picture in picture.</p></details><a className="rs-link-underline" href={watchUrl(clip)} target="_blank" rel="noreferrer">{clip.publisher} on {provider}<Icon name="external" size={12} /></a></div>
      </aside>
    </div>
    <div className="vp-status" role="status"><span>{status || (playing ? "Playing" : "Ready to play")}</span><span>{String(selected + 1).padStart(2, "0")} / 03</span></div>
    <nav className="vp-mobile-nav" aria-label="Video screens"><Button variant="ghost" aria-label="Watching" aria-current={screen === "watching" ? "page" : undefined} onClick={() => setScreen("watching")}><Icon name="play" size={16} />Watching</Button><Button variant="ghost" aria-label="Playlist" aria-current={screen === "library" ? "page" : undefined} onClick={() => { autoplay.current = false; player.current?.pauseVideo(); setScreen("library"); }}><Icon name="list" size={16} />Playlist<span>3</span></Button></nav>
  </section>;
}
