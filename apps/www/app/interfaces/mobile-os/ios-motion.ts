"use client";

import { flushSync } from "react-dom";

type Motion = "open" | "close" | "push" | "back" | "sheet" | "dismiss" | "overlay-open" | "overlay-close";
type Origin = { x: number; y: number };
let transition: ViewTransition | undefined;
let sequence = 0;
let fallbackFrame: number | undefined;
let fallbackAnimation: Animation | undefined;

/** A skipped View Transition still invokes its update callback. Invalidate that
 * callback as well as its paint so an older navigation cannot win a fast race. */
export function cancelIOSMotion() {
  sequence++;
  transition?.skipTransition();
  transition = undefined;
  if (fallbackFrame !== undefined) cancelAnimationFrame(fallbackFrame);
  fallbackFrame = undefined;
  fallbackAnimation?.cancel();
  fallbackAnimation = undefined;
  if (typeof document !== "undefined") {
    delete document.documentElement.dataset.iosMotion;
    document.documentElement.style.removeProperty("--ios-launch-origin");
  }
}

/** Capture the outgoing app before React replaces it. Only this phone's
 * content participates; the document and the system chrome remain stationary. */
export function runIOSMotion(kind: Motion, update: () => void, origin?: Origin) {
  cancelIOSMotion();
  if (typeof document === "undefined" || matchMedia("(prefers-reduced-motion: reduce)").matches) { update(); return; }
  const screen = document.querySelector<HTMLElement>("section.mo-device[data-platform='ios'] .mo-device-fit:not([inert]) .mo-screen");
  if (!screen) { update(); return; }
  if (!document.startViewTransition) {
    update();
    fallbackFrame = requestAnimationFrame(() => {
      fallbackFrame = undefined;
      if (!screen.isConnected) return;
      fallbackAnimation = screen.animate([{ opacity: .5, transform: kind === "back" ? "translateX(-12px)" : "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 220, easing: "cubic-bezier(.2,.8,.2,1)" });
    });
    return;
  }
  const current = ++sequence;
  const root = document.documentElement;
  root.dataset.iosMotion = kind;
  root.style.setProperty("--ios-launch-origin", `${origin?.x ?? 50}% ${origin?.y ?? 50}%`);
  const next = document.startViewTransition(() => { if (current === sequence && screen.isConnected) flushSync(update); });
  transition = next;
  void next.ready.catch(() => {});
  void next.finished.catch(() => {}).finally(() => {
    if (current !== sequence) return;
    delete root.dataset.iosMotion;
    root.style.removeProperty("--ios-launch-origin");
    transition = undefined;
  });
}

export function iosLaunchOrigin(element: Element | null): Origin | undefined {
  const phone = element?.closest(".mo-phone"), screen = phone?.querySelector(".mo-screen");
  if (!element || !screen) return;
  const icon = element.querySelector("[data-app-icon]") ?? element;
  const from = icon.getBoundingClientRect(), to = screen.getBoundingClientRect();
  return { x: (from.x + from.width / 2 - to.x) / to.width * 100, y: (from.y + from.height / 2 - to.y) / to.height * 100 };
}
