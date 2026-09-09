import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { rs } from "../rs";
import { mq, vlak } from "../tokens.stylex";

export interface ShimmerProps extends React.HTMLAttributes<HTMLSpanElement> { children: string; active?: boolean; duration?: number; spread?: number }
const sweep = stylex.keyframes({ from: { backgroundPosition: "100% 0" }, to: { backgroundPosition: "-100% 0" } });
const styles = stylex.create({
  root: { color: vlak.gray, "--rs-shimmer-duration": "2s", "--rs-shimmer-spread": "15%" },
  active: { backgroundImage: "linear-gradient(90deg, var(--text-secondary) 0%, var(--text-secondary) calc(50% - var(--rs-shimmer-spread, 15%)), var(--text) 50%, var(--text-secondary) calc(50% + var(--rs-shimmer-spread, 15%)), var(--text-secondary) 100%)", backgroundSize: "200% 100%", backgroundClip: "text", color: { default: "transparent", [mq.reduce]: vlak.gray, [mq.forcedColors]: "CanvasText" }, animationName: { default: sweep, [mq.reduce]: "none", [mq.forcedColors]: "none" }, animationDuration: "var(--rs-shimmer-duration, 2s)", animationTimingFunction: "linear", animationIterationCount: "infinite" },
});
/** Animated text for supplied progress. Screen readers receive the text once, without token announcements. */
export const Shimmer = React.forwardRef<HTMLSpanElement, ShimmerProps>(function Shimmer({ children, active = true, duration = 2, spread = 15, className, style, ...props }, ref) {
  const root = rs(["rs-shimmer", active && "rs-shimmer-active", className], styles.root, active && styles.active);
  return <span ref={ref} {...props} className={root.className} style={{ ...root.style, "--rs-shimmer-duration": `${Math.max(0.2, Number.isFinite(duration) ? duration : 2)}s`, "--rs-shimmer-spread": `${Math.max(0, Math.min(50, Number.isFinite(spread) ? spread : 15))}%`, ...style } as React.CSSProperties}>{children}</span>;
});
