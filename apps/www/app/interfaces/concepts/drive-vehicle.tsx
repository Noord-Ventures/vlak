"use client";

import * as React from "react";
import { Button, Icon } from "@noorddev/vlak-react";
import type { DriveSceneState } from "./drive-scene";

type SceneApi = { update(state: DriveSceneState): void; dispose(): void };
export function DriveVehicle({ mode, lights, locked, navigating, load, charge, charging, onToggleLock, onToggleLights }: Pick<DriveSceneState,"mode"|"lights"|"navigating"|"load"|"charge"|"charging"> & {locked:boolean; onToggleLock():void; onToggleLights():void}) {
  const host=React.useRef<HTMLDivElement>(null),engine=React.useRef<SceneApi|null>(null);
  const [status,setStatus]=React.useState<"loading"|"ready"|"fallback">("loading");
  const [attempt, setAttempt] = React.useState(0);
  const [paused,setPaused]=React.useState(false),[reducedMotion,setReducedMotion]=React.useState(false);
  const current=React.useRef<DriveSceneState>({mode,lights,navigating,load,charge,charging,paused,reducedMotion});
  current.current={mode,lights,navigating,load,charge,charging,paused,reducedMotion};
  React.useEffect(()=>{const preference=matchMedia("(prefers-reduced-motion: reduce)");const sync=()=>setReducedMotion(preference.matches);sync();preference.addEventListener("change",sync);return()=>preference.removeEventListener("change",sync);},[]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: retry intentionally creates a fresh renderer after disposing the previous attempt
  React.useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    setStatus("loading");
    Promise.all([import("./drive-scene"), import("./drive-car")]).then(async ([{ createDriveScene }, { loadDriveCar }]) => {
      const car = await loadDriveCar(controller.signal);
      if (cancelled || !host.current) {
        car.traverse(object => { const mesh = object as import("three").Mesh; mesh.geometry?.dispose(); if (mesh.material) for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) material.dispose(); });
        return;
      }
      engine.current = createDriveScene(host.current, current.current, car, () => setStatus("fallback"));
      setStatus("ready");
    }).catch(() => { if (!cancelled) setStatus("fallback"); }).finally(() => window.clearTimeout(timeout));
    return () => { cancelled = true; window.clearTimeout(timeout); controller.abort(); engine.current?.dispose(); engine.current = null; };
  }, [attempt]);
  React.useEffect(()=>{engine.current?.update({mode,lights,navigating,load,charge,charging,paused,reducedMotion});},[mode,lights,navigating,load,charge,charging,paused,reducedMotion]);
  const viewLabel=mode==="vehicle"?"Side profile":mode==="journey"?"Third-person journey":"Exploded battery assembly";
  return <figure className={`ev-model ev-${mode==="vehicle"?"profile":mode}`} data-renderer={status} data-animation={paused||reducedMotion?"paused":"playing"}>
    <div className="ev-visual-caption"><span>{mode==="vehicle"?"Vehicle 01":mode==="journey"?"Home → Utrecht Centraal":"Traction battery / 12 modules"}</span><span>{viewLabel}</span></div>
    <div className="ev-model-viewport">
      <div ref={host} className="ev-scene" role="img" aria-label={`${mode === "energy" ? "Illustrative electric battery pack" : "Detailed Evoque vehicle model"}, ${viewLabel.toLowerCase()}`} aria-hidden={status!=="ready"} />
      {status!=="ready"&&<div className="ev-scene-fallback"><img src="/interfaces/concepts/vehicle-line-v6.png" alt="Electric vehicle concept, side-profile line illustration" draggable="false" /><span role="status">{status==="loading"?"Preparing 3D view…":"3D unavailable. Showing the concept illustration."}</span></div>}
      {mode==="energy"&&<div className="ev-energy-labels"><span>01 / Pack cover</span><span>02 / Charge per module</span><span>03 / Current bus</span></div>}
      {mode==="journey"&&<span className="ev-scene-route">{navigating?"Journey simulation running":"Journey preview · Looping streetscape"} · Via A2</span>}
    </div>
    <figcaption className="ev-model-footer"><div>{mode==="vehicle"?<><Button variant="ghost" aria-label="Door lock" aria-pressed={locked} onClick={onToggleLock}><Icon name={locked?"lock":"unlock"} size={16}/>{locked?"Doors locked":"Doors unlocked"}</Button><Button variant="ghost" aria-label="Lights" aria-pressed={lights} onClick={onToggleLights}><Icon name="sun" size={16}/>{lights?"Lights on":"Lights off"}</Button></>:mode==="journey"?<span>Illustrative 3D streetscape · Local simulation</span>:<><span>{charge.toFixed(1)}% charge</span><strong>{Math.abs(load).toFixed(1)} <small>kW</small></strong><span>{charging?"Simulated charge input":"Simulated current load"}</span></>}</div>{status === "fallback" ? <Button variant="ghost" className="ev-scene-motion" onClick={() => setAttempt(value => value + 1)} aria-label="Retry 3D view"><Icon name="refresh" size={16} /><span>Retry</span></Button> : <Button variant="ghost" className="ev-scene-motion" disabled={reducedMotion||status!=="ready"} aria-label={reducedMotion?"3D motion disabled for reduced motion":paused?"Resume 3D motion":"Pause 3D motion"} onClick={()=>setPaused(value=>!value)}><Icon name={paused||reducedMotion?"play":"pause"} size={16}/><span>{reducedMotion?"Still frame":paused?"Resume":"Pause"}</span></Button>}</figcaption>
  </figure>;
}
