"use client";

/*
 * Adapted from Orbkit by zzzzshawn (MIT), retrieved 2026-09-09.
 * Source: https://github.com/zzzzshawn/orbkit
 * Copyright and permission notice: ./LICENSE
 * Vlak adaptation removes unused ornamental wrappers, adds a fallback-ready
 * callback, and responds when the reduced-motion preference changes.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";

/* ----------------------------------------------------------------------------
   Orbkit core — raw WebGL shader orb runtime. No dependencies.

   An orb is a full-screen triangle rendered into a transparent canvas by a
   fragment shader. Every orb declares a parameter schema (sliders + colors);
   the values are uploaded as uniforms each frame from a ref, so a controls
   panel can tune them live without ever remounting the canvas (a remount would
   drop the WebGL context).

   Animation model: every state synthesizes two volume signals — input (user
   speech energy) and output (agent speech energy) — smooths them, and the
   shaders react to those. The flow clock's speed itself follows the output
   volume, so orbs visibly quicken when the agent is talking.
---------------------------------------------------------------------------- */

export type OrbState = "idle" | "thinking" | "speaking";

export const ORB_STATES = ["idle", "thinking", "speaking"] as const;

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/** Per-state [input, output] volume synthesis. */
/**
 * Transition rate shared by params, colours and the flow-speed multiplier.
 * They must move together: if the rate multiplier eases faster than the look,
 * a state change spins the orb up before it has finished cross-fading, which
 * reads as a lurch.
 *
 * This drives a critically damped spring rather than the exponential ease it
 * used to. An exponential's velocity is highest at the instant the target
 * changes, so every state change began with a jolt — and for params that are
 * spatial frequencies (Corona's warpFreq travels 5.25 -> 19.5 between states)
 * that jolt sweeps the field through its intermediate frequencies at maximum
 * rate, which is what read as the transition "scrambling".
 *
 * A spring starts at rest and accelerates, so the sweep is spread across the
 * transition instead of front-loaded. Measured on that warpFreq move it is a
 * 20% lower peak rate of change (20.3/s vs 25.3/s) AND it arrives sooner —
 * 1.50s to within 2% against the exponential's 2.18s, since an exponential
 * only ever asymptotes toward its target.
 */
const PARAM_EASE = 4;
const COLOR_CHANNELS = [0, 1, 2] as const;

/*
  One step of a critically damped spring, implicit (semi-implicit Euler would
  blow up at the frame times a backgrounded tab produces). Returns nothing and
  writes through the scratch pair so the hot loop allocates nothing.
*/
const springOut = { x: 0, v: 0 };
function springStep(x: number, v: number, target: number, dt: number, omega: number) {
  const f = 1 + 2 * dt * omega;
  const oo = omega * omega;
  const hoo = dt * oo;
  const hhoo = dt * hoo;
  const detInv = 1 / (f + hhoo);
  springOut.x = (f * x + dt * v + hhoo * target) * detInv;
  springOut.v = (v + hoo * (target - x)) * detInv;
}

function targetVolumes(state: OrbState, t: number): [number, number] {
  switch (state) {
    case "idle":
      return [0, 0.3];
    case "speaking":
      return [
        clamp01(0.65 + Math.sin(t * 4.8) * 0.22),
        clamp01(0.75 + Math.sin(t * 3.6) * 0.22)
      ];
    case "thinking": {
      const base = 0.38 + 0.07 * Math.sin(t * 0.7);
      const wander = 0.05 * Math.sin(t * 2.1) * Math.sin(t * 0.37 + 1.2);
      return [clamp01(base + wander), clamp01(0.48 + 0.12 * Math.sin(t * 1.05 + 0.6))];
    }
  }
}

/* ------------------------------ param schema ------------------------------- */

export interface OrbParamDef {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  /**
   * Rate params. The engine integrates them into a clock
   * (`clock += dt * value * volumeSpeed`) and uploads the clock instead of the
   * raw value, so changing the rate never jumps the phase — the motion speeds
   * up or slows down rather than snapping to a new position.
   */
  integrate?: boolean;
}

export interface OrbColorDef {
  key: string;
  label: string;
  /** hex, e.g. `#ff8b73` */
  default: string;
}

export interface OrbVariant {
  key: string;
  label: string;
  note: string;
  /** GLSL fragment shader body. Uniform declarations are generated for you. */
  frag: string;
  params: OrbParamDef[];
  colors: OrbColorDef[];
  /**
   * Per-state parameter targets. The engine glides each param toward the
   * active state's preset. Params passed explicitly via the `params` prop
   * always win over the preset.
   */
  statePresets?: Partial<Record<OrbState, Record<string, number>>>;
  /**
   * Per-state colour targets, the colour counterpart of `statePresets`.
   * Kept a separate map because presets are numeric and colours are hex
   * strings — a union would lose type safety on both. Colours glide in RGB
   * on the same easing as params, so a state change cross-fades rather
   * than cutting. Colours passed explicitly via the `colors` prop always
   * win, exactly as with params.
   */
  stateColors?: Partial<Record<OrbState, Record<string, string>>>;
}

export type OrbParamValues = Partial<Record<string, number>>;
export type OrbColorValues = Partial<Record<string, string>>;

/** Every param and color at its schema default. */
export function defaultValuesFor(variant: OrbVariant): {
  params: Record<string, number>;
  colors: Record<string, string>;
} {
  return {
    params: Object.fromEntries(variant.params.map((p) => [p.key, p.default])),
    colors: Object.fromEntries(variant.colors.map((c) => [c.key, c.default]))
  };
}

export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.charAt(0).repeat(2) + h.charAt(1).repeat(2) + h.charAt(2).repeat(2);
  const n = parseInt(h, 16);
  if (h.length !== 6 || Number.isNaN(n)) return [1, 1, 1];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/* ------------------------------- GLSL shared ------------------------------- */

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

/**
 * Prelude prepended to every orb fragment shader: uniforms, value noise, fbm,
 * and the centered aspect-corrected UV helper.
 */
export const ORB_GLSL_HELPERS = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;   // slow ambient clock (half real-time)
uniform float uAnim;   // flow clock — its speed follows the output volume
uniform float uInput;  // input volume 0..1: user speech energy
uniform float uOutput; // output volume 0..1: agent speech energy

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(11.7, 7.3);
    a *= 0.5;
  }
  return v;
}
vec2 orbUV() { return (2.0 * gl_FragCoord.xy - uRes) / min(uRes.x, uRes.y); }

// GLSL ES 1.0 has no tanh() — it arrived in ES 3.0. Shader-golf listings lean
// on it as a tone-mapper, so it ships here. Clamped against exp() overflow;
// accurate for the non-negative accumulators those shaders produce.
vec3 tanh3(vec3 x) {
  x = clamp(x, -10.0, 10.0);
  vec3 e = exp(2.0 * x);
  return (e - 1.0) / (e + 1.0);
}

`;

function paramUniformDecls(variant: OrbVariant): string {
  return [
    ...variant.params.map((p) => `uniform float uP_${p.key};`),
    ...variant.colors.map((c) => `uniform vec3 uC_${c.key};`)
  ].join("\n");
}

/* ------------------------------- engine ------------------------------------ */

/**
 * Per-canvas context-lifecycle controller. Created on first mount of a canvas
 * and kept for the element's whole life — the router can hide a page and show
 * the same DOM again, and React re-runs effects on the same canvas, so the
 * lost/restored listeners must outlive any single effect run: an uncanceled
 * webglcontextlost event marks the context permanently unrestorable.
 */
interface CanvasContextController {
  /** Whether a mounted orb currently wants this context alive. */
  desired: boolean;
  /** Builds a render generation; returns its teardown. Rebound per effect run. */
  start: (() => () => void) | null;
  /** Teardown of the live generation, if one is running. */
  stopGen: (() => void) | null;
}

const canvasControllers = new WeakMap<HTMLCanvasElement, CanvasContextController>();

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("[orbkit] shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export interface ShaderOrbProps {
  /** The orb definition: shader + param schema + state presets. */
  variant: OrbVariant;
  /** Drives the synthesized volume signals. Defaults to `"idle"`. */
  state?: OrbState;
  /** Rendered size in CSS pixels. Ignored when `className` sizes the canvas. */
  size?: number;
  /** Explicit param overrides. Any key present here wins over the state preset. */
  params?: OrbParamValues;
  /** Explicit color overrides, as hex strings. */
  colors?: OrbColorValues;
  /**
   * Per-state parameter targets, overriding the variant's own. Merged KEY BY
   * KEY over what the orb already defines, so `{ thinking: { churn: 1.62 } }`
   * retouches one param of one state and leaves every other param — and the
   * other two states — exactly as the orb ships them.
   *
   * This is the prop form of the variant's `statePresets`, so you can retune
   * an orb's states from the outside without forking its file. Values still
   * glide, so switching states cross-fades into your targets. An explicit
   * `params` value outranks this, the same way it outranks the variant.
   */
  statePresets?: Partial<Record<OrbState, Record<string, number>>>;
  /** The colour counterpart of `statePresets`, merged the same key-by-key way. */
  stateColors?: Partial<Record<OrbState, Record<string, string>>>;
  /**
   * Per-state volume drive, the third member of the same family. Use it to
   * give each state its own energy; use `volumes` below instead when you have
   * a real signal to feed in, such as live mic level.
   */
  stateVolumes?: Partial<Record<OrbState, { input?: number; output?: number }>>;
  /**
   * Overrides the synthesized volume signals for the active state. The engine
   * normally derives these from `state` — a slow breath at idle, a restless
   * wander while thinking, speech-shaped peaks while speaking — and most
   * shaders read them as their reactivity. Setting either channel here pins
   * it instead, which is how the playground lets you dial each state's drive
   * independently. Omit a channel to keep its synthesized motion.
   */
  volumes?: { input?: number; output?: number };
  /** Freeze the animation on the current frame. */
  paused?: boolean;
  /**
   * Stop rendering while the orb is scrolled out of view. Defaults to `true` —
   * a page full of orbs would otherwise run a WebGL loop per card.
   */
  pauseOffscreen?: boolean;
  /** Device-pixel-ratio ceiling. Defaults to `2`. */
  maxDpr?: number;
  /** Applied to the outermost element — the wrapper when there is one. */
  className?: string;
  /** Merged onto the outermost element's style. */
  style?: CSSProperties;
  /** Accessible label. When omitted the orb is hidden from assistive tech. */
  ariaLabel?: string;
  /** Whether a usable frame is available, for the host fallback. */
  onReadyChange?: (ready: boolean) => void;
}

export function ShaderOrb({
  variant,
  state = "idle",
  size,
  params,
  colors,
  statePresets,
  stateColors,
  stateVolumes,
  volumes,
  paused = false,
  pauseOffscreen = true,
  maxDpr = 2,
  className,
  style,
  ariaLabel,
  onReadyChange
}: ShaderOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Live refs: the render loop reads these every frame, so changing a param
  // never re-runs the GL setup effect (which would drop the context). Synced in
  // an effect rather than during render — a ref write during render is unsafe
  // under concurrent rendering, and the loop picks the new value up on the very
  // next frame anyway.
  /*
    Whether the canvas has drawn a frame yet, tracked per variant because a
    variant swap mounts a brand new canvas (see the `key` below).

    A mounted-but-never-drawn canvas is at the browser's mercy: rather than
    the transparent rectangle you would expect, a page that mounts a dozen at
    once gets white boxes — and in some browsers a broken-image placeholder —
    for as long as the compositor has nothing to raster. That window is not
    small here: every orb compiles a full fragment shader synchronously in its
    own mount effect, so on the gallery grid the first canvases sit empty
    while the last ones are still compiling. Holding each canvas invisible
    until its own first frame lands is what makes the grid fade in cleanly
    instead of flashing. One state change per orb, once, on mount.
  */
  const [paintedKey, setPaintedKey] = useState<string | null>(null);
  const painted = paintedKey === variant.key;

  useEffect(() => { onReadyChange?.(painted); }, [painted, onReadyChange]);

  const stateRef = useRef<OrbState>(state);
  const paramsRef = useRef<OrbParamValues | undefined>(params);
  const colorsRef = useRef<OrbColorValues | undefined>(colors);
  const statePresetsRef = useRef(statePresets);
  const stateColorsRef = useRef(stateColors);
  const stateVolumesRef = useRef(stateVolumes);
  const volumesRef = useRef(volumes);
  const pausedRef = useRef(paused);

  useEffect(() => {
    stateRef.current = state;
    paramsRef.current = params;
    colorsRef.current = colors;
    statePresetsRef.current = statePresets;
    stateColorsRef.current = stateColors;
    stateVolumesRef.current = stateVolumes;
    volumesRef.current = volumes;
    pausedRef.current = paused;
  }, [state, params, colors, statePresets, stateColors, stateVolumes, volumes, paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null = null;
    try { gl = canvas.getContext("webgl", {
      alpha: true,
      // No MSAA: the geometry is a single full-screen triangle, so there are no
      // primitive edges to antialias — softness comes from the shaders. Leaving
      // it on costs the multisample buffers plus a resolve every frame.
      antialias: false,
      premultipliedAlpha: true
    }); } catch { return; }
    if (!gl) return;
    // A stable non-null reference is also available inside render callbacks.
    const context = gl;

    const loseExt = context.getExtension("WEBGL_lose_context");

    /*
      A "generation" is everything tied to a live context: program, buffers,
      observers, render loop. Browsers cap live WebGL contexts per page and
      evict the oldest past the cap, and an evicted orb's canvas stays blank
      forever unless the app rebuilds — so generations tear down and rebuild on
      the lost/restored events instead of assuming the context is immortal.
    */
    let announcedPaint = false;

    const startGeneration = (): (() => void) => {
      if (context.isContextLost()) return () => {};
      // Every generation announces its own first frame: a context that was
      // lost and restored has an empty drawing buffer and is hidden again
      // (below), so it has to earn its reveal back.
      announcedPaint = false;

      const vs = compile(context, context.VERTEX_SHADER, VERT);
      const fs = compile(
        context,
        context.FRAGMENT_SHADER,
        ORB_GLSL_HELPERS + paramUniformDecls(variant) + variant.frag
      );
      const releaseShaders = () => {
        if (vs) context.deleteShader(vs);
        if (fs) context.deleteShader(fs);
      };
      if (!vs || !fs) return releaseShaders;

      const prog = context.createProgram();
      if (!prog) return releaseShaders;
      context.attachShader(prog, vs);
      context.attachShader(prog, fs);
      context.linkProgram(prog);
      if (!context.getProgramParameter(prog, context.LINK_STATUS)) {
        console.error("[orbkit] program link error:", context.getProgramInfoLog(prog));
        context.deleteProgram(prog);
        return releaseShaders;
      }
      // biome-ignore lint/correctness/useHookAtTopLevel: WebGL's useProgram binds a GPU program; it is not a React hook.
      context.useProgram(prog);

      const buf = context.createBuffer();
      context.bindBuffer(context.ARRAY_BUFFER, buf);
      context.bufferData(context.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), context.STATIC_DRAW);
      const aPos = context.getAttribLocation(prog, "aPos");
      context.enableVertexAttribArray(aPos);
      context.vertexAttribPointer(aPos, 2, context.FLOAT, false, 0, 0);

      context.enable(context.BLEND);
      context.blendFunc(context.ONE, context.ONE_MINUS_SRC_ALPHA);

      const uRes = context.getUniformLocation(prog, "uRes");
      const uTime = context.getUniformLocation(prog, "uTime");
      const uAnim = context.getUniformLocation(prog, "uAnim");
      const uInput = context.getUniformLocation(prog, "uInput");
      const uOutput = context.getUniformLocation(prog, "uOutput");

      const paramLocs = variant.params.map((p) => ({
        def: p,
        loc: context.getUniformLocation(prog, `uP_${p.key}`)
      }));
      const colorLocs = variant.colors.map((c) => ({
        def: c,
        loc: context.getUniformLocation(prog, `uC_${c.key}`)
      }));

      /* --- sizing: track the element box, not a one-shot measurement ------- */
      // Backing-store scale, stepped down by the adaptive-resolution logic in
      // the loop when the GPU can't hold frame rate. CSS size never changes —
      // the browser upscales, which these soft shaders absorb gracefully.
      let resScale = 1;
      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, maxDpr) * resScale;
        const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
        const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          context.viewport(0, 0, w, h);
        }
        /*
          Uploaded UNCONDITIONALLY, outside the size guard. A rebuilt
          generation (React strict-mode remount, a restored context) links a
          fresh program whose uRes starts at zero — and the canvas usually
          already holds the right backing size, so an upload gated behind
          the resize never ran. With uRes = 0, orbUV() divides by zero and
          every fragment lands transparent: a healthy context, a bound
          program, and a permanently blank orb.
        */
        context.uniform2f(uRes, w, h);
      };
      resize();

      const resizeObserver =
        typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
      resizeObserver?.observe(canvas);

      /* --- visibility: don't burn a render loop on an offscreen orb -------- */
      let visible = !pauseOffscreen;
      const intersectionObserver =
        pauseOffscreen && typeof IntersectionObserver !== "undefined"
          ? new IntersectionObserver(
              (entries) => {
                visible = Boolean(entries[0]?.isIntersecting);
                if (visible) {
                  last = performance.now() / 1000;
                }
              },
              { rootMargin: "150px 0px", threshold: 0 }
            )
          : null;
      if (intersectionObserver) {
        intersectionObserver.observe(canvas);
      } else {
        visible = true;
      }

      const reduceMotion =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      /* --- driver state ---------------------------------------------------- */
      let tSec = 0;
      // random phase so two orbs on the same page never look synchronized
      let anim = Math.random() * 100;
      let speed = 0.1;
      const cur = { in: 0, out: 0.3 };
      const presets = variant.statePresets;
      const paramCur: Record<string, number> = {};
      const paramVel: Record<string, number> = {};
      const paramClocks: Record<string, number> = {};
      const colorCur: Record<string, [number, number, number]> = {};
      const colorVel: Record<string, [number, number, number]> = {};
      let speedVel = 0;
      const [initialIn, initialOut] = targetVolumes(stateRef.current, 0);
      cur.in = initialIn;
      cur.out = initialOut;
      let last = performance.now() / 1000;
      let raf = 0;
      // smoothed frame time for the adaptive-resolution check
      let frameEma = 1 / 60;

      const uploadAndDraw = (dt: number, snap = false) => {
        // Synthesized from the state, unless a channel is pinned via
        // `volumes`. Pinned values still glide on the same easing, so dialing
        // one in the playground cross-fades rather than jumping.
        const [tin, tout] = targetVolumes(stateRef.current, tSec);
        // Same order as params and colours: direct prop, then the per-state
        // map, then the engine's own synthesis.
        const liveVolumes = volumesRef.current;
        const stateVolume = stateVolumesRef.current?.[stateRef.current];
        const targetIn = liveVolumes?.input ?? stateVolume?.input ?? tin;
        const targetOut = liveVolumes?.output ?? stateVolume?.output ?? tout;
        const kVol = 1 - Math.exp(-dt * 12);
        cur.in += (targetIn - cur.in) * kVol;
        cur.out += (targetOut - cur.out) * kVol;

        /*
          Flow speed follows the output volume. It multiplies every integrated
          clock's increment, so it is a RATE: easing it quickly makes the orb
          visibly lurch — a state change would spin the orb up hard before the
          params had finished gliding.

          It is therefore eased on the same constant as the params below, so a
          state change ramps its motion over the same half second that its look
          takes to cross-fade. The steady-state values are unchanged, so a
          speaking orb still flows faster than an idle one; only the transition
          into that rate is gradual.
        */
        const targetSpeed = 0.1 + (1 - (cur.out - 1) ** 2) * 0.9;
        if (snap) {
          speed = targetSpeed;
          speedVel = 0;
        } else {
          springStep(speed, speedVel, targetSpeed, dt, PARAM_EASE);
          speed = springOut.x;
          speedVel = springOut.v;
        }
        anim += dt * speed;

        context.uniform1f(uTime, tSec * 0.5);
        context.uniform1f(uAnim, anim);
        context.uniform1f(uInput, cur.in);
        context.uniform1f(uOutput, cur.out);

        // Resolution order per param: explicit `params` → `statePresets`
        // prop → the variant's own preset → schema default. The two middle
        // steps are per-key, so overriding one param of one state leaves the
        // rest of that state alone. Values glide rather than snap.
        const liveParams = paramsRef.current;
        const statePreset = presets?.[stateRef.current];
        const overridePreset = statePresetsRef.current?.[stateRef.current];

        for (const { def, loc } of paramLocs) {
          const explicit = liveParams?.[def.key];
          const target =
            typeof explicit === "number"
              ? explicit
              : (overridePreset?.[def.key] ?? statePreset?.[def.key] ?? def.default);
          const curVal = paramCur[def.key] ?? target;
          let next: number;
          if (snap) {
            next = target;
            paramVel[def.key] = 0;
          } else {
            springStep(curVal, paramVel[def.key] ?? 0, target, dt, PARAM_EASE);
            next = springOut.x;
            paramVel[def.key] = springOut.v;
          }
          paramCur[def.key] = next;

          if (def.integrate) {
            const clock = (paramClocks[def.key] ?? Math.random() * 100) + dt * speed * next;
            paramClocks[def.key] = clock;
            context.uniform1f(loc, clock);
          } else {
            context.uniform1f(loc, next);
          }
        }

        // Same resolution order and same easing as params, so a state change
        // cross-fades the palette instead of cutting to it.
        const liveColors = colorsRef.current;
        const stateColor = variant.stateColors?.[stateRef.current];
        const overrideColor = stateColorsRef.current?.[stateRef.current];
        for (const { def, loc } of colorLocs) {
          const target = hexToRgb(
            liveColors?.[def.key] ??
              overrideColor?.[def.key] ??
              stateColor?.[def.key] ??
              def.default
          );
          const curCol: [number, number, number] = colorCur[def.key] ?? [...target];
          const velCol: [number, number, number] = colorVel[def.key] ?? [0, 0, 0];
          colorCur[def.key] = curCol;
          colorVel[def.key] = velCol;
          for (const i of COLOR_CHANNELS) {
            if (snap) {
              curCol[i] = target[i];
              velCol[i] = 0;
            } else {
              springStep(curCol[i], velCol[i], target[i], dt, PARAM_EASE);
              curCol[i] = springOut.x;
              velCol[i] = springOut.v;
            }
          }
          context.uniform3f(loc, curCol[0], curCol[1], curCol[2]);
        }

        context.clearColor(0, 0, 0, 0);
        context.clear(context.COLOR_BUFFER_BIT);
        context.drawArrays(context.TRIANGLES, 0, 3);
        // Deferred a microtask: the first of these draws runs synchronously
        // inside this effect, and a sync setState there trips the compiler
        // lint. A microtask still resolves before the browser paints, so the
        // reveal is not delayed by a frame.
        if (!announcedPaint) {
          announcedPaint = true;
          queueMicrotask(() => {
            /*
              Re-check: the context can be evicted between this draw and the
              microtask, and mounting one more orb anywhere on the page is
              enough to do it — opening the details drawer over a full gallery
              is exactly that. Revealing on the strength of a frame that has
              already been thrown away puts a dead canvas on screen, which is
              what the browser draws its broken-canvas placeholder over. The
              generation that follows the restore announces again.
            */
            if (context.isContextLost()) return;
            setPaintedKey(variant.key);
          });
        }
      };

      const releaseGL = () => {
        resizeObserver?.disconnect();
        intersectionObserver?.disconnect();
        context.deleteProgram(prog);
        context.deleteShader(vs);
        context.deleteShader(fs);
        context.deleteBuffer(buf);
      };

      if (reduceMotion) {
        // One representative frame, then stop — snapped straight onto the
        // state's targets, since a spring would only be part-way there.
        tSec = 1;
        uploadAndDraw(1, true);
        return releaseGL;
      }

      const loop = () => {
        raf = requestAnimationFrame(loop);
        const now = performance.now() / 1000;
        const dt = Math.min(now - last, 0.05);
        last = now;
        if (!visible || pausedRef.current) return;
        tSec += dt;

        /*
          Adaptive resolution. When the smoothed frame time sits above ~30fps,
          the GPU is drowning in fragment work (these shaders are pure fill
          cost), so step the backing store down 20% and re-measure. Steps only
          go down — never back up — so the resolution can't oscillate. The
          warm-up guard keeps page-load jank (hydration, first compiles) from
          triggering a downgrade the GPU never asked for.
        */
        /*
          Only unstalled frames are evidence about GPU fill cost. `dt` above is
          clamped at 0.05, so a frame that hits the clamp is the main thread
          having been blocked — a slider drag re-rendering React, a GC pause, a
          tab regaining focus — and feeding those in made UI jank look
          identical to a drowning GPU.
        */
        if (dt < 0.05) frameEma += (dt - frameEma) * 0.08;

        if (tSec > 1.5 && frameEma > 1 / 34 && resScale > 0.5) {
          resScale = Math.max(0.5, resScale * 0.8);
          frameEma = 1 / 60; // require fresh evidence before the next step
          resize();
        } else if (tSec > 1.5 && frameEma < 1 / 55 && resScale < 1) {
          /*
            And step back up once frames are comfortably fast again. This used
            to be one-way, on the reasoning that it could not then oscillate —
            but that also meant one transient stall permanently halved the
            orb's resolution, and at half resolution a high-frequency shader
            aliases into shimmer that reads as the shader itself misbehaving.
            The gap between the two thresholds (29ms down, 18ms up) is the
            hysteresis that stops it hunting.
          */
          resScale = Math.min(1, resScale / 0.8);
          frameEma = 1 / 60;
          resize();
        }

        uploadAndDraw(dt);
      };
      /*
        First frame synchronously, before entering the rAF loop. rAF does not
        run at all in hidden documents (background tabs, embedded previews),
        so a freshly mounted orb would otherwise sit fully transparent until
        the page next becomes visible — a grid of mounted, healthy, blank
        canvases. The sync frame guarantees every mount paints: background
        documents get a static frame, visible ones start animating over it.
        dt = 1 lands the param glide on its targets, as in the reduce-motion
        frame above.
      */
      uploadAndDraw(1);
      loop();

      return () => {
        cancelAnimationFrame(raf);
        releaseGL();
      };
    };

    /*
      Wire the canvas's lifecycle controller. The listeners are attached ONCE
      per canvas element and never removed, deliberately: the lost event must
      be canceled even while no orb is mounted on the canvas — an uncanceled
      webglcontextlost marks the context permanently unrestorable, and the
      router can show this exact canvas again later. Whether a loss leads to
      a revival is decided by `desired`, not by listener presence.
    */
    /*
      A canvas whose context has gone is not simply blank: Chrome paints its
      broken-image placeholder over the element's whole box — the white square
      you see on a reloaded grid. Hide the canvas the moment the context is
      lost, and let the generation that follows a restore reveal it again.
    */
    const hideNow = () => {
      /*
        Both, deliberately. The style write lands in this tick — the browser
        paints its placeholder over a dead canvas immediately, and a busy main
        thread can hold a React update for several frames. The state change is
        what keeps React's own view in sync, so the reveal that follows a
        restore clears the inline value again rather than fighting it.
      */
      canvas.style.opacity = "0";
      setPaintedKey(null);
    };

    const onContextLostHide = () => hideNow();
    canvas.addEventListener("webglcontextlost", onContextLostHide);

    /*
      Hand the context back before the next document asks for one.

      A hard reload never runs this effect's cleanup — the document is
      discarded whole — so the outgoing page's contexts are still alive while
      the incoming page allocates its own. On a grid of orbs that puts the
      live count past the browser's ~16 cap, and the ones it evicts are
      exactly the canvases that come back as placeholders until the restore
      path catches them. `persisted` is a bfcache suspend, where the page is
      shown again untouched and must keep everything it holds.
    */
    const onPageHide = (event: PageTransitionEvent) => {
      if (event.persisted) return;
      try {
        loseExt?.loseContext();
      } catch {
        // Already released — nothing to hand back.
      }
    };
    window.addEventListener("pagehide", onPageHide);

    let ctl = canvasControllers.get(canvas);
    if (!ctl) {
      const created: CanvasContextController = { desired: false, start: null, stopGen: null };
      canvas.addEventListener("webglcontextlost", (event) => {
        event.preventDefault(); // always cancel — keeps the context restorable
        created.stopGen?.();
        created.stopGen = null;
        if (created.desired) {
          /*
            Ask for the context back — but in a LATER task. The browser only
            marks a loss as restorable once the lost event's dispatch has
            completed and it has seen the canceled flag, so a restoreContext()
            issued during dispatch (or before it, as the mount path may) is
            silently refused. This is the path a synchronous cleanup+setup
            pair hits — React re-running the effect on the same canvas loses
            the context and wants it right back. For losses we didn't cause
            (eviction, GPU reset) the call may refuse; the canceled event then
            lets the browser restore on its own schedule.
          */
          setTimeout(() => {
            if (!created.desired) return;
            try {
              loseExt?.restoreContext();
            } catch {
              // Natural loss — restoration is the browser's call now.
            }
          }, 0);
        }
      });
      canvas.addEventListener("webglcontextrestored", () => {
        if (created.desired && created.start) {
          created.stopGen = created.start();
        }
      });
      canvasControllers.set(canvas, created);
      ctl = created;
    }
    const controller = ctl;

    controller.desired = true;
    controller.start = startGeneration;
    if (context.isContextLost()) {
      // A previous run on this canvas released the context (effect re-run, or
      // the router re-showing a kept-alive page). If the lost event already
      // dispatched this request is honored now; if it is still queued, the
      // lost handler above re-requests it on dispatch.
      try {
        loseExt?.restoreContext();
      } catch {
        // No restore path — the orb stays blank rather than throwing.
      }
    } else {
      controller.stopGen = startGeneration();
    }

    const motionQuery = typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    const onMotionChange = () => {
      controller.stopGen?.();
      controller.stopGen = controller.start?.() ?? null;
    };
    motionQuery?.addEventListener("change", onMotionChange);

    return () => {
      motionQuery?.removeEventListener("change", onMotionChange);
      /*
        Hide BEFORE tearing the context down.

        This cleanup releases the context deliberately, and the lost event it
        provokes is dispatched asynchronously — by which point the listener
        below is unhooked and the replacement effect has not drawn yet. That
        leaves a revealed canvas with a dead context, which is precisely what
        the browser paints its broken-canvas placeholder over. The window is
        not rare: any prop change in this effect's deps re-runs it, so it hits
        every time the drawer switches preview example (maxDpr differs on the
        layout one) or a wrapper is toggled.
      */
      hideNow();
      canvas.removeEventListener("webglcontextlost", onContextLostHide);
      window.removeEventListener("pagehide", onPageHide);
      controller.desired = false;
      controller.start = null;
      controller.stopGen?.();
      controller.stopGen = null;
      /*
        Release the context NOW instead of when the canvas is garbage
        collected. Browsers cap live WebGL contexts per page (~8–16) and evict
        the oldest when the cap is hit — client-side navigation that unmounts
        and remounts a page of orbs otherwise piles up zombie contexts until
        freshly mounted orbs get evicted and render blank.
      */
      try {
        loseExt?.loseContext();
      } catch {
        // Context already lost — nothing to release.
      }
    };
  }, [variant, pauseOffscreen, maxDpr]);

  const sizeStyle: CSSProperties =
    size === undefined ? {} : { width: size, height: size };

  /*
    Spread ahead of the caller's `style`, so an orb that wants to own its own
    opacity still can — it simply opts out of the reveal.

    A hard flip, deliberately: no transition, no fade. A hidden document
    (background tab, embedded preview) does not advance CSS transitions, so a
    faded reveal left orbs pinned at zero in exactly the case the synchronous
    first frame above exists to serve — mounted, healthy, and invisible. The
    cut is not a pop either way, since it happens on the frame the orb first
    has something to show.
  */
  const revealStyle: CSSProperties = painted ? {} : { opacity: 0 };

  return (
    <canvas
      key={variant.key}
      ref={canvasRef}
      className={className}
      style={{ display: "block", ...sizeStyle, ...revealStyle, ...style }}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    />
  );
}
