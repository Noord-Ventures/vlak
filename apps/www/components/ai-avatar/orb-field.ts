export type OrbState = "idle" | "thinking" | "speaking";

interface OrbMotion {
  speed: number;
  drift: number;
  breath: number;
}

export const orbMotion: Record<OrbState, OrbMotion> = {
  idle: { speed: 0.24, drift: 0.04, breath: 0 },
  thinking: { speed: 0.38, drift: 0.065, breath: 0.004 },
  speaking: { speed: 0.32, drift: 0.055, breath: 0.012 },
};

// A staggered lattice samples the front of a sphere. Every point has a stable
// identity: the currents move its position and light, without replacing dots.
export const orbDots = Array.from({ length: 169 }, (_, index) => {
  const row = Math.floor(index / 13) - 6;
  const column = index % 13 - 6;
  const x = (column + (Math.abs(row) % 2) * 0.5) * 0.18;
  const y = row * 0.18 * Math.sqrt(3) / 2;
  const distance = x * x + y * y;
  return { key: `${row}:${column}`, x, y, distance, depth: Math.sqrt(Math.max(0, 1 - distance)) };
}).filter(dot => dot.distance < 0.97 * 0.97);

/** A fresh frame of Vlak's original dot field, with no renderer dependencies. */
export function orbFrame(phase: number, motion: OrbMotion) {
  const breath = 1 + motion.breath * Math.sin(phase * 1.8);
  return orbDots.map(dot => {
    const { x, y, distance, depth } = dot;
    const envelope = (1 - distance) ** 1.2;
    const horizontal = Math.sin(y * 2.8 + phase) * Math.cos(x * 1.7 - phase * 0.37);
    const vertical = Math.sin(x * 2.3 - phase * 0.72) * Math.cos(y * 2.1 + phase * 0.44);
    const light = 0.35 + depth * 0.55 + 0.24 * Math.sin(x * 3.2 + y * 2.1 - phase) - 0.16 * Math.cos(y * 4.2 + phase * 0.7);
    return {
      x: 50 + 47 * (x + horizontal * motion.drift * envelope) * breath,
      y: 50 + 47 * (y + vertical * motion.drift * envelope) * breath,
      radius: (2.05 + depth * 0.8) * (0.96 + 0.04 * Math.sin(x * 2.4 - y * 3 + phase)),
      opacity: 0.22 + 0.78 * Math.max(0, Math.min(1, light)),
    };
  });
}
