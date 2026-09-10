"use client";

import { useRef } from "react";
import { trackSiteEvent } from "@/lib/site-analytics";
import type { InterfaceSlug } from "./catalog";
import { hasInterfaceFilm } from "./films";

export function InterfaceFilm({ slug, title }: { slug: InterfaceSlug; title: string }) {
  const tracked = useRef(false);
  if (!hasInterfaceFilm(slug)) return null;
  function recordPlay() {
    if (tracked.current) return;
    tracked.current = true;
    trackSiteEvent("interface_video_play", { slug });
  }
  return (
    <section className="if-film" aria-labelledby={`${slug}-film-title`}>
      <div className="if-film-head">
        <h2 id={`${slug}-film-title`}>Interface film</h2>
        <p>20 seconds</p>
      </div>
      <video controls playsInline preload="metadata" poster={`/interfaces/films/posters/${slug}.jpg`} onPlay={recordPlay} aria-describedby={`${slug}-film-note`}>
        <source src={`/interfaces/films/${slug}.mp4`} type="video/mp4" />
        <track default kind="captions" src="/interfaces/films/captions.vtt" srcLang="en" label="English" />
        Your browser does not support embedded video.
      </video>
      <p id={`${slug}-film-note`} className="if-film-note">A short walkthrough of the working {title.toLowerCase()} study. The interface and its behaviour are described below.</p>
    </section>
  );
}
