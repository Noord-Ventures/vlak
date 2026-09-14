"use client";

import { useRef } from "react";
import { trackSiteEvent } from "@/lib/site-analytics";
import type { InterfaceSlug } from "./catalog";
import { hasInterfaceFilm } from "./films";

export function InterfaceFilm({ slug, title }: { slug: InterfaceSlug; title: string }) {
  const tracked = useRef(false);
  const video = useRef<HTMLVideoElement>(null);
  if (!hasInterfaceFilm(slug)) return null;
  function recordPlay() {
    if (tracked.current) return;
    tracked.current = true;
    trackSiteEvent("interface_video_play", { slug });
  }
  return (
    <details className="if-film" onToggle={event => { if (!event.currentTarget.open) video.current?.pause(); }}>
      <summary>Watch the 20-second walkthrough</summary>
      <div className="if-film-body">
        <video ref={video} controls playsInline preload="none" poster={`/interfaces/films/posters/${slug}.jpg`} onPlay={recordPlay} aria-label={`${title} walkthrough`} aria-describedby={`${slug}-film-note`}>
          <source src={`/interfaces/films/${slug}.mp4`} type="video/mp4" />
          <track default kind="captions" src="/interfaces/films/captions.vtt" srcLang="en" label="English" />
          Your browser does not support embedded video.
        </video>
        <p id={`${slug}-film-note`} className="if-film-note">A short walkthrough of the working {title.toLowerCase()} study.</p>
      </div>
    </details>
  );
}
