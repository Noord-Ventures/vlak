"use client";

import { useCallback, useEffect, useRef, type SyntheticEvent } from "react";

/** The sample provider accepts a theme fragment without scripts or a document reload. */
export function useCalendarTheme() {
  const frame = useRef<HTMLIFrameElement | null>(null);
  const update = useCallback(() => {
    const element = frame.current;
    if (!element) return;
    const url = new URL(element.src, window.location.href);
    if (url.origin !== window.location.origin || url.pathname !== "/widgets/calendar-demo.html") return;
    const explicit = document.documentElement.dataset.theme;
    const theme = explicit === "dark" || (explicit !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
    if (url.hash === `#theme-${theme}`) return;
    url.hash = `theme-${theme}`;
    element.src = url.href;
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    media.addEventListener("change", update);
    update();
    return () => { observer.disconnect(); media.removeEventListener("change", update); frame.current = null; };
  }, [update]);
  return useCallback((event: SyntheticEvent<HTMLIFrameElement>) => { frame.current = event.currentTarget; update(); }, [update]);
}
