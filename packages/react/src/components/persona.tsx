"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export type PersonaState = "idle" | "listening" | "thinking" | "speaking" | "asleep";
export interface PersonaProps extends React.HTMLAttributes<HTMLDivElement> {
  state?: PersonaState;
  size?: number;
  label?: string;
  /** A custom decorative visual. The application owns its rendering lifecycle. */
  children?: React.ReactNode;
}
const breathe = stylex.keyframes({ "0%, 100%": { transform: "scaleY(0.35)" }, "50%": { transform: "scaleY(1)" } });
const styles = stylex.create({
  root: { display: "inline-grid", placeItems: "center", flexShrink: 0, verticalAlign: "middle", color: vlak.ink, overflow: "hidden", borderRadius: "50%", backgroundColor: { default: vlak.controlFill, [mq.forcedColors]: "Canvas" } },
  visual: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8%", width: "60%", height: "50%" },
  bar: { width: "12%", height: "100%", backgroundColor: { default: "currentColor", [mq.forcedColors]: "CanvasText" }, borderRadius: vlak.radiusSm, transformOrigin: "center", animationName: { default: breathe, [mq.reduce]: "none", [mq.forcedColors]: "none" }, animationDuration: "1.8s", animationTimingFunction: "ease-in-out", animationIterationCount: "infinite", animationPlayState: "paused" },
  running: { animationPlayState: "running" },
  listening: { animationDuration: "1s" },
  thinking: { animationDuration: "1.4s" },
  speaking: { animationDuration: "0.55s" },
  asleep: { height: "16%", animationName: "none" },
});

/** Five conversational states with a native monochrome visual and a custom rendering slot. */
export const Persona = React.forwardRef<HTMLDivElement, PersonaProps>(function Persona({ state = "idle", size = 48, label, children, className, style, ...props }, ref) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    let intersecting = true;
    const update = () => setVisible(intersecting && document.visibilityState !== "hidden");
    const observer = typeof IntersectionObserver === "function" ? new IntersectionObserver(entries => { intersecting = entries[0]?.isIntersecting ?? true; update(); }) : null;
    if (rootRef.current) observer?.observe(rootRef.current);
    document.addEventListener("visibilitychange", update); update();
    return () => { observer?.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);
  const diameter = Number.isFinite(size) ? Math.max(1, size) : 48;
  const root = rs(["rs-persona", className], styles.root);
  const visual = rs(["rs-persona-visual"], styles.visual);
  const bar = rs(["rs-persona-bar", visible && "rs-persona-running", state === "listening" && "rs-persona-listening", state === "thinking" && "rs-persona-thinking", state === "speaking" && "rs-persona-speaking", state === "asleep" && "rs-persona-asleep"], styles.bar, visible && styles.running, state === "listening" && styles.listening, state === "thinking" && styles.thinking, state === "speaking" && styles.speaking, state === "asleep" && styles.asleep);
  return <div {...props} ref={node => { rootRef.current = node; if (typeof ref === "function") ref(node); else if (ref) ref.current = node; }} role={label ? "img" : undefined} aria-label={label ? `${label}: ${state}` : undefined} aria-hidden={label ? undefined : true} data-state={state} className={root.className} style={{ ...root.style, width: diameter, height: diameter, ...style }}>
    {children ?? <span {...visual} aria-hidden="true">{[0, 1, 2, 3].map(index => <span key={index} {...bar} style={{ ...bar.style, animationDelay: `${index * -0.22}s` }} />)}</span>}
  </div>;
});
