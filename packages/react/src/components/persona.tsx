"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";

export type PersonaState = "idle" | "listening" | "thinking" | "speaking" | "asleep";
export type PersonaVariant = "waveform" | "orb" | "rings";
export interface PersonaVisualContext {
  state: PersonaState;
  size: number;
  /** Normalized input/output energy, or the state's representative intensity. */
  intensity: number;
  /** Whether motion is allowed by visibility, user preferences and paused/state. */
  animated: boolean;
}
export interface PersonaProps extends React.HTMLAttributes<HTMLDivElement> {
  state?: PersonaState;
  variant?: PersonaVariant;
  size?: number;
  label?: string;
  /** Input/output energy in the range 0–1. Asleep always settles to zero. */
  intensity?: number;
  /** Stop motion without changing the conversational state. */
  paused?: boolean;
  /** Called initially and whenever the effective motion policy changes. */
  onMotionChange?: (animated: boolean) => void;
  /** A custom decorative visual. The application owns its rendering lifecycle. */
  children?: React.ReactNode;
  /** Custom visuals should honor animated and release their own rendering resources. */
  renderVisual?: (context: PersonaVisualContext) => React.ReactNode;
}
const breathe = stylex.keyframes({ "0%, 100%": { transform: "scaleY(0.4)" }, "50%": { transform: "scaleY(1)" } });
const flow = stylex.keyframes({
  "0%, 100%": { borderRadius: "44% 56% 61% 39% / 47% 42% 58% 53%", transform: "rotate(-8deg)" },
  "50%": { borderRadius: "57% 43% 40% 60% / 42% 58% 42% 58%", transform: "rotate(8deg)" },
});
const resonate = stylex.keyframes({ "0%, 100%": { transform: "scale(0.88)", opacity: 0.5 }, "50%": { transform: "scale(1)", opacity: 1 } });
const styles = stylex.create({
  root: {
    display: "inline-grid", placeItems: "center", flexShrink: 0, verticalAlign: "middle", color: vlak.ink,
    overflow: "hidden", borderRadius: "50%", backgroundColor: { default: vlak.controlFill, [mq.forcedColors]: "Canvas" },
    "--rs-persona-play-state": "paused", "--rs-persona-wave-gap": "8%", "--rs-persona-ring-stretch": "1", "--rs-persona-wave-height": "58%", "--rs-persona-visual-scale": "0.88",
  },
  running: { "--rs-persona-play-state": "running" },
  listening: { "--rs-persona-wave-gap": "10%" },
  thinking: { "--rs-persona-wave-gap": "4%", "--rs-persona-ring-stretch": "0.86" },
  speaking: { "--rs-persona-wave-gap": "6%", "--rs-persona-ring-stretch": "0.96" },
  asleep: { "--rs-persona-play-state": "paused" },
  visual: { display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--rs-persona-wave-gap)", width: "60%", height: "50%", transitionProperty: "gap", transitionDuration: { default: "450ms", [mq.reduce]: "0ms", [mq.forcedColors]: "0ms" }, transitionTimingFunction: "ease-in-out" },
  bar: {
    width: "12%", height: "var(--rs-persona-wave-height, 58%)", backgroundColor: { default: "currentColor", [mq.forcedColors]: "CanvasText" }, borderRadius: vlak.radiusSm,
    transformOrigin: "center", animationName: { default: breathe, [mq.reduce]: "none", [mq.forcedColors]: "none" }, animationDuration: "2.4s", animationTimingFunction: "ease-in-out", animationIterationCount: "infinite", animationPlayState: "var(--rs-persona-play-state)",
    transitionProperty: "height", transitionDuration: { default: "450ms", [mq.reduce]: "0ms", [mq.forcedColors]: "0ms" }, transitionTimingFunction: "ease-in-out",
  },
  orb: { display: "grid", placeItems: "center", width: "74%", height: "74%", transform: "scale(var(--rs-persona-visual-scale, 0.88))", transitionProperty: "transform", transitionDuration: { default: "600ms", [mq.reduce]: "0ms", [mq.forcedColors]: "0ms" }, transitionTimingFunction: "ease-in-out" },
  orbSurface: {
    display: "block", width: "100%", height: "100%", borderRadius: "44% 56% 61% 39% / 47% 42% 58% 53%",
    backgroundImage: { default: `radial-gradient(circle at 32% 26%, ${vlak.paper}, ${vlak.gray} 36%, ${vlak.ink} 78%)`, [mq.forcedColors]: "none" }, backgroundColor: { default: vlak.ink, [mq.forcedColors]: "CanvasText" },
    animationName: { default: flow, [mq.reduce]: "none", [mq.forcedColors]: "none" }, animationDuration: "7.6s", animationTimingFunction: "ease-in-out", animationIterationCount: "infinite", animationPlayState: "var(--rs-persona-play-state)",
  },
  rings: { display: "grid", placeItems: "center", width: "82%", height: "82%", transform: "scale(var(--rs-persona-visual-scale, 0.88)) scaleY(var(--rs-persona-ring-stretch))", transitionProperty: "transform", transitionDuration: { default: "600ms", [mq.reduce]: "0ms", [mq.forcedColors]: "0ms" }, transitionTimingFunction: "ease-in-out" },
  ring: {
    display: "block", gridArea: "1 / 1", boxSizing: "border-box", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: { default: "currentColor", [mq.forcedColors]: "CanvasText" }, borderRadius: "50%",
    animationName: { default: resonate, [mq.reduce]: "none", [mq.forcedColors]: "none" }, animationDuration: "3.6s", animationTimingFunction: "ease-in-out", animationIterationCount: "infinite", animationPlayState: "var(--rs-persona-play-state)",
  },
});
const stateIntensity: Record<PersonaState, number> = { idle: 0.25, listening: 0.65, thinking: 0.45, speaking: 0.85, asleep: 0 };

/** Three native monochrome visuals share five conversational states and an optional custom renderer. */
export const Persona = React.forwardRef<HTMLDivElement, PersonaProps>(function Persona({ state = "idle", variant = "waveform", size = 48, label, intensity, paused = false, onMotionChange, children, renderVisual, className, style, ...props }, ref) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRefs(rootRef, ref);
  const [canAnimate, setCanAnimate] = React.useState(false);
  React.useEffect(() => {
    let mounted = true;
    let intersecting = typeof IntersectionObserver !== "function";
    const reduced = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    const forced = typeof window.matchMedia === "function" ? window.matchMedia("(forced-colors: active)") : null;
    const update = () => { if (mounted) setCanAnimate(intersecting && document.visibilityState !== "hidden" && !reduced?.matches && !forced?.matches); };
    const observer = typeof IntersectionObserver === "function" ? new IntersectionObserver(entries => { intersecting = entries[0]?.isIntersecting ?? false; update(); }) : null;
    if (rootRef.current) observer?.observe(rootRef.current);
    document.addEventListener("visibilitychange", update);
    reduced?.addEventListener("change", update); forced?.addEventListener("change", update); update();
    return () => {
      mounted = false; observer?.disconnect(); document.removeEventListener("visibilitychange", update);
      reduced?.removeEventListener("change", update); forced?.removeEventListener("change", update);
    };
  }, []);
  const animated = canAnimate && !paused && state !== "asleep";
  const motionCallback = React.useRef(onMotionChange);
  React.useEffect(() => { motionCallback.current = onMotionChange; }, [onMotionChange]);
  React.useEffect(() => { motionCallback.current?.(animated); }, [animated]);
  const diameter = Number.isFinite(size) ? Math.max(1, size) : 48;
  const energy = state === "asleep" ? 0 : typeof intensity === "number" && Number.isFinite(intensity) ? Math.max(0, Math.min(1, intensity)) : stateIntensity[state];
  const root = rs(["rs-persona", className, animated && "rs-persona-running", state === "listening" && "rs-persona-listening", state === "thinking" && "rs-persona-thinking", state === "speaking" && "rs-persona-speaking", state === "asleep" && "rs-persona-asleep"], styles.root, animated && styles.running, state === "listening" && styles.listening, state === "thinking" && styles.thinking, state === "speaking" && styles.speaking, state === "asleep" && styles.asleep);
  const visual = rs(["rs-persona-visual"], styles.visual);
  const bar = rs(["rs-persona-bar"], styles.bar);
  const orb = rs(["rs-persona-orb"], styles.orb);
  const orbSurface = rs(["rs-persona-orb-surface"], styles.orbSurface);
  const rings = rs(["rs-persona-rings"], styles.rings);
  const ring = rs(["rs-persona-ring"], styles.ring);
  const builtIn = variant === "orb" ? <span {...orb} aria-hidden="true"><span {...orbSurface} /></span> : variant === "rings" ? <span {...rings} aria-hidden="true">{[0, 1, 2].map(index => <span key={index} {...ring} style={{ ...ring.style, width: `${44 + index * 26}%`, height: `${44 + index * 26}%`, animationDelay: `${index * -0.6}s` }} />)}</span> : <span {...visual} aria-hidden="true">{[0, 1, 2, 3].map(index => <span key={index} {...bar} style={{ ...bar.style, animationDelay: `${index * -0.32}s` }} />)}</span>;
  const semantics: React.HTMLAttributes<HTMLDivElement> = label ? { role: "img", "aria-label": `${label}: ${state}` } : { "aria-hidden": true };
  return <div {...props} {...semantics} ref={mergedRef} data-state={state} data-variant={renderVisual || children != null ? "custom" : variant} data-animated={animated} className={root.className} style={{ ...root.style, width: diameter, height: diameter, "--rs-persona-wave-height": `${16 + energy * 84}%`, "--rs-persona-visual-scale": 0.72 + energy * 0.28, ...style } as React.CSSProperties}>
    {renderVisual ? renderVisual({ state, size: diameter, intensity: energy, animated }) : children ?? builtIn}
  </div>;
});
