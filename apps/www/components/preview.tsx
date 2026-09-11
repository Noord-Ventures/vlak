"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { hasPreview, loadPreview } from "./previews/loaders";

let observer: IntersectionObserver | undefined;
const waiting = new Map<Element, Set<() => void>>();

/** One observer for the catalogue; start loading before a specimen is visible. */
function whenNear(element: Element, load: () => void) {
  if (!("IntersectionObserver" in window)) {
    load();
    return () => {};
  }
  observer ??= new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const callbacks = waiting.get(entry.target);
      waiting.delete(entry.target);
      observer?.unobserve(entry.target);
      callbacks?.forEach(callback => { callback(); });
    }
  }, { rootMargin: "600px 0px" });
  const callbacks = waiting.get(element) ?? new Set<() => void>();
  callbacks.add(load);
  waiting.set(element, callbacks);
  observer.observe(element);
  return () => {
    callbacks.delete(load);
    if (!callbacks.size) {
      waiting.delete(element);
      observer?.unobserve(element);
    }
  };
}

/**
 * Every preview ships its authored HTML. Interactive code is fetched by group
 * only when needed; a failed download leaves the specimen and a retry action.
 */
export function Preview({ name, snippet, defer = false }: { name: string; snippet: string; defer?: boolean }) {
  const boundary = useRef<HTMLSpanElement>(null);
  const [loaded, setLoaded] = useState<{ name: string; Demo: ComponentType | null } | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const interactive = hasPreview(name);
  const Demo = loaded?.name === name ? loaded.Demo : null;

  useEffect(() => {
    if (!interactive) return;
    let active = true;
    const load = () => {
      setFailed(false);
      void loadPreview(name).then(Demo => {
        if (active) setLoaded({ name, Demo });
      }, () => {
        if (active) setFailed(true);
      });
    };
    // A hidden marker preserves the original direct-child layout. Its parent
    // is the actual gallery/kit box with observable dimensions.
    const target = boundary.current?.parentElement;
    const stop = defer && target && attempt === 0 ? whenNear(target, load) : (load(), () => {});
    return () => { active = false; stop(); };
  }, [name, interactive, defer, attempt]);

  return <>
    <span ref={boundary} data-preview={name} data-preview-ready={Boolean(Demo)} hidden />
    {Demo ? <Demo /> : <>
      <div inert={interactive || undefined} data-preview-fallback
        style={{ contain: "layout paint", minWidth: 0, maxWidth: "100%" }}
        dangerouslySetInnerHTML={{ __html: snippet }} />
      {interactive && <noscript><p className="rs-sr">Enable JavaScript to interact with this preview.</p></noscript>}
      {failed && <button type="button" className="rs-btn rs-btn-ghost" onClick={() => setAttempt(value => value + 1)}>Retry interactive preview</button>}
    </>}
  </>;
}
