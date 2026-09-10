"use client";

import * as React from "react";

import type { DeviceProfile } from "./device-profiles";
import { createFoldScene, type FoldCapture, type FoldScene } from "./fold-scene";
import { IOSDuoSignals } from "./ios-duo-signals";

/** Keep one mounted app while its hardware, display and safe areas resize. */
export function DeviceFrame({ device, expanded, rotated, live, prepareFold, inspectionAngle, children }: { device: DeviceProfile; expanded: boolean; rotated: boolean; live: boolean; inspectionAngle: number | null; prepareFold: React.RefObject<(() => void) | null>; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const fit = React.useRef<HTMLDivElement>(null);
  const previous = React.useRef({ expanded, rotated, device: device.id });
  const beforeFold = React.useRef<FoldCapture | null>(null);
  const scene = React.useRef<FoldScene | null>(null);
  const inspecting = React.useRef(inspectionAngle !== null);
  inspecting.current = inspectionAngle !== null;
  const [available, setAvailable] = React.useState<number | null>(null);
  const display = expanded && device.expanded ? device.expanded : device.display;
  const width = live ? available ?? 320 : (rotated ? display.height : display.width) + display.bezel * 2;
  const height = live ? 680 : (rotated ? display.width : display.height) + display.bezel * 2;
  const scale = live || available === null ? 1 : Math.min(1, available / width);
  const restingHeight = React.useRef(height * scale);
  restingHeight.current = height * scale;
  React.useLayoutEffect(() => {
    prepareFold.current = () => {
      const screen = fit.current?.querySelector<HTMLElement>(".mo-phone");
      const context = screen?.closest<HTMLElement>(".mo-device");
      if (screen && context) beforeFold.current = { screen: screen.cloneNode(true) as HTMLElement, context: { ...context.dataset }, scrollTop: screen.querySelector(".mo-scroll")?.scrollTop ?? 0 };
    };
    return () => { prepareFold.current = null; };
  }, [prepareFold]);
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const resize = () => setAvailable(node.getBoundingClientRect().width);
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  React.useLayoutEffect(() => {
    const old = previous.current;
    previous.current = { expanded, rotated, device: device.id };
    const viewport = ref.current, frame = fit.current;
    const screen = frame?.querySelector<HTMLElement>(".mo-phone");
    const captured = beforeFold.current;
    beforeFold.current = null;
    const changedDevice = old.device !== device.id || old.rotated !== rotated;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (changedDevice || live || reduced && inspectionAngle === null) {
      scene.current?.destroy(); scene.current = null;
      if (frame) frame.style.height = `${restingHeight.current}px`;
      return;
    }
    if (!viewport || !frame || !screen || !device.expanded) return;
    if (!scene.current && (old.expanded !== expanded || inspectionAngle !== null)) {
      const current: FoldCapture = { screen, context: { ...screen.closest<HTMLElement>(".mo-device")?.dataset }, scrollTop: screen.querySelector(".mo-scroll")?.scrollTop ?? 0 };
      scene.current = createFoldScene({ viewport, frame, device, rotated,
        inner: !expanded && captured ? captured : current,
        outer: expanded && captured ? captured : current,
        initial: old.expanded ? 1 : 0,
        onRest: () => { if (!inspecting.current) { scene.current?.destroy(); scene.current = null; } },
      });
      if (reduced && inspectionAngle !== null) scene.current.seek(inspectionAngle / 180);
      else scene.current.move(inspectionAngle === null ? Number(expanded) : inspectionAngle / 180);
    } else if (scene.current) {
      if (inspectionAngle !== null) scene.current.seek(inspectionAngle / 180);
      else scene.current.move(Number(expanded));
    }
  }, [expanded, rotated, device, live, inspectionAngle]);
  // Refit after React commits its resting geometry, including a paused inspection.
  React.useLayoutEffect(() => { if (available !== null) scene.current?.resize(); }, [available]);
  React.useEffect(() => () => { scene.current?.destroy(); scene.current = null; }, []);
  const geometry = {
    "--mo-device-radius": `${display.radius}px`,
    "--mo-device-bezel": `${display.bezel}px`,
    "--mo-safe-top": `${rotated ? 44 : display.safeTop}px`,
    "--mo-device-width": `${width}px`,
    "--mo-device-height": `${height}px`,
    "--mo-device-scale": scale,
  } as React.CSSProperties;
  return <div className="mo-device-viewport" ref={ref}>
    <div ref={fit} className="mo-device-fit" data-cutout={display.cutout} data-live={live} style={{ ...geometry, width: width * scale, height: height * scale }}>
      <div className="mo-handset" style={{ width, height, transform: `scale(${scale})` }}>
        <div className="mo-hardware" aria-hidden="true"><i className="mo-side-key mo-side-key-power" /><i className="mo-side-key mo-side-key-volume" />{device.platform === "ios" && <><i className="mo-side-key mo-side-key-action" /><i className="mo-side-key mo-side-key-volume-down" /></>}<i className="mo-antenna mo-antenna-top" /><i className="mo-antenna mo-antenna-bottom" /><i className="mo-earpiece" />{device.expanded && <i className="mo-hinge" />}</div>
        {children}
      </div>
    </div>
  </div>;
}

export function StatusSignals({ platform, wifi, cellular, duo = false }: { platform: "ios" | "android"; wifi: boolean; cellular: boolean; duo?: boolean }) {
  if (duo) return <IOSDuoSignals wifi={wifi} cellular={cellular} />;
  return <span className="mo-status-signals" aria-hidden="true">
    {platform === "ios" ? <svg width="19" height="12" viewBox="0 0 19 12"><g fill="currentColor" opacity={cellular ? 1 : .3}><rect y="8" width="3" height="4" rx=".7" /><rect x="5" y="5.5" width="3" height="6.5" rx=".7" /><rect x="10" y="3" width="3" height="9" rx=".7" /><rect x="15" width="3" height="12" rx=".7" /></g></svg> : null}
    {wifi && <svg width="17" height="13" viewBox="0 0 17 13"><g fill="currentColor"><path d="M.2 3.5a12 12 0 0 1 16.6 0L15.2 5a9.8 9.8 0 0 0-13.4 0Z" /><path d="M3.1 6.4a7.7 7.7 0 0 1 10.8 0L12.3 8a5.5 5.5 0 0 0-7.6 0Z" /><path d="M6 9.3a3.6 3.6 0 0 1 5 0L8.5 12Z" /></g></svg>}
    {platform === "android" && <svg width="13" height="13" viewBox="0 0 13 13"><path d="M1 12 12 1v11Z" fill="currentColor" opacity={cellular ? 1 : .3} /></svg>}
    <span className="mo-battery"><span /></span>
  </span>;
}
