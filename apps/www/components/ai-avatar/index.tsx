"use client";

import { useEffect, useRef, useState } from "react";
import { orbDots, orbFrame, orbMotion, type OrbState } from "./orb-field";

export interface AiAvatarProps {
  size?: number;
  state?: OrbState;
  className?: string;
  /** Pause the currents while retaining the current image. */
  paused?: boolean;
  /** Render a still orb without scheduling animation for older messages. */
  static?: boolean;
}

const initialFrame = orbFrame(0, orbMotion.idle);

/** Original decorative dot orb. Pair it with a response that names its assistant. */
export function AiAvatar({ size = 28, state = "idle", className, paused = false, static: staticVisual = false }: AiAvatarProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const stateRef = useRef(state);
  const motionRef = useRef({ phase: 0, ...orbMotion.idle });
  const [forcedColors, setForcedColors] = useState(false);
  const diameter = Number.isFinite(size) ? Math.max(1, size) : 28;

  useEffect(() => {
    const query = window.matchMedia("(forced-colors: active)");
    const update = () => setForcedColors(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const circles = Array.from(svg.children);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = typeof IntersectionObserver === "undefined";
    let frame: number | null = null;
    let previousTime: number | null = null;

    const paint = () => {
      const current = motionRef.current;
      const dots = orbFrame(current.phase, current);
      for (const [index, dot] of dots.entries()) {
        const circle = circles[index];
        if (!circle) continue;
        circle.setAttribute("cx", dot.x.toFixed(3));
        circle.setAttribute("cy", dot.y.toFixed(3));
        circle.setAttribute("r", dot.radius.toFixed(3));
        circle.setAttribute("opacity", forcedColors ? "1" : dot.opacity.toFixed(3));
      }
    };
    const canAnimate = () => !paused && !staticVisual && visible && !document.hidden && !reducedMotion.matches && !forcedColors;
    const tick = (time: number) => {
      frame = null;
      if (!canAnimate()) return;
      // Retain the clock across state changes, but never catch up after a pause.
      const elapsed = previousTime === null ? 0 : Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      const current = motionRef.current;
      const target = orbMotion[stateRef.current];
      const blend = 1 - Math.exp(-elapsed * 1.8);
      current.speed += (target.speed - current.speed) * blend;
      current.drift += (target.drift - current.drift) * blend;
      current.breath += (target.breath - current.breath) * blend;
      current.phase += elapsed * current.speed;
      paint();
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      if (canAnimate()) {
        if (frame === null) frame = requestAnimationFrame(tick);
      } else {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        previousTime = null;
      }
    };
    paint();

    // Static history has no visibility observers or animation clock.
    if (staticVisual) return;

    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      sync();
    });
    observer?.observe(svg);
    reducedMotion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      observer?.disconnect();
      reducedMotion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [paused, staticVisual, forcedColors]);

  return (
    <span aria-hidden="true" className={className} data-ai-avatar={state}
      style={{ display: "inline-block", flexShrink: 0, width: diameter, height: diameter, verticalAlign: "middle" }}>
      <svg ref={svgRef} viewBox="0 0 100 100" width={diameter} height={diameter} focusable="false" fill="currentColor" style={{ display: "block", overflow: "visible" }}>
        {initialFrame.map((dot, index) => <circle key={orbDots[index]?.key} cx={dot.x.toFixed(3)} cy={dot.y.toFixed(3)} r={dot.radius.toFixed(3)} opacity={forcedColors ? "1" : dot.opacity.toFixed(3)} />)}
      </svg>
    </span>
  );
}
