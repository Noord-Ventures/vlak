"use client";

import { useEffect, useState } from "react";
import { Shdr29, type Shdr29Props } from "./shdr-29";

export interface AiAvatarProps {
  size?: number;
  state?: "idle" | "thinking" | "speaking";
  className?: string;
  /** Pause the shader while retaining its current image. */
  paused?: boolean;
  /** Use the same mosaic without allocating a WebGL context for older messages. */
  static?: boolean;
}

const monochrome = { lit: "#ffffff", wall: "#343434" };
const params = { confetti: 0, shuffle: 0, swirl: 0.85, scale: 1.05, light: 0.42, contrast: 0.92 };
// Broad, slow currents keep the small mosaic legible; the runtime eases between these targets.
const statePresets: Shdr29Props["statePresets"] = {
  idle: { drift: 0.2, churn: 0.28, spin: 0.035, pulse: 0, coverage: 0.5, gain: 0.9 },
  thinking: { drift: 0.16, churn: 0.48, spin: 0.035, pulse: 0, coverage: 0.49, gain: 0.91 },
  speaking: { drift: 0.22, churn: 0.36, spin: 0.06, pulse: 0.12, coverage: 0.49, gain: 0.94 },
};
// A restrained state drive avoids synthetic speech peaks flashing at avatar scale.
const stateVolumes: Shdr29Props["stateVolumes"] = {
  idle: { input: 0, output: 0.24 },
  thinking: { input: 0.12, output: 0.3 },
  speaking: { input: 0.2, output: 0.38 },
};
const fallbackTiles = Array.from({ length: 64 }, (_, index) => {
  const x = index % 8;
  const y = Math.floor(index / 8);
  const distance = Math.hypot(x - 3.5, y - 3.5);
  return { x: x * 4 + 0.5, y: y * 4 + 0.5, distance, opacity: 0.3 + 0.7 * (Math.sin(x * 1.8 + y * 0.9) + 1) / 2 };
}).filter(tile => tile.distance < 3.8);

/**
 * Monochrome Orbkit Mosaic (shdr-29). Decorative; pair with a named response.
 * Mount one live avatar for the latest assistant turn, not one per history item.
 */
export function AiAvatar({ size = 28, state = "idle", className, paused = false, static: staticVisual = false }: AiAvatarProps) {
  const [ready, setReady] = useState(false);
  const [forcedColors, setForcedColors] = useState(false);
  const diameter = Number.isFinite(size) ? Math.max(1, size) : 28;

  useEffect(() => {
    const query = window.matchMedia("(forced-colors: active)");
    const update = () => setForcedColors(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <span
      aria-hidden="true"
      className={className}
      data-ai-avatar={state}
      style={{ display: "inline-block", position: "relative", flexShrink: 0, width: diameter, height: diameter, verticalAlign: "middle" }}
    >
      {(!ready || forcedColors || staticVisual) && (
        <svg viewBox="0 0 32 32" width={diameter} height={diameter} focusable="false" style={{ display: "block", position: "absolute", inset: 0 }}>
          {fallbackTiles.map(tile => <rect key={`${tile.x}-${tile.y}`} x={tile.x} y={tile.y} width="3" height="3" fill="currentColor" opacity={forcedColors ? 1 : tile.opacity} />)}
        </svg>
      )}
      {!forcedColors && !staticVisual && <Shdr29 size={diameter} state={state} colors={monochrome} params={params} statePresets={statePresets} stateVolumes={stateVolumes} paused={paused} maxDpr={2} pauseOffscreen onReadyChange={setReady} />}
    </span>
  );
}
