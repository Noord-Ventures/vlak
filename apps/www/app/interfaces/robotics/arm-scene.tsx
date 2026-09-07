"use client";

import * as React from "react";
import { Button, Icon } from "@noorddev/vlak-react";
import { armDimensions, armPose, sampleArm, type ArmAngles, type ArmClock, type JointId } from "./simulation";

export type ArmView = "perspective" | "front" | "top";
type Props = {
  clock: React.RefObject<ArmClock>;
  selected: JointId;
  draft: ArmAngles | null;
  aperture: number;
  cameraAvailable: boolean;
  pathVisible: boolean;
  view: ArmView;
  zoom: number;
};

/** One renderer, one articulated hierarchy; all transforms read the same local sample clock. */
export function ArmScene(props: Props) {
  const host = React.useRef<HTMLDivElement>(null);
  const live = React.useRef(props); live.current = props;
  const [status, setStatus] = React.useState("loading");
  const [restart, setRestart] = React.useState(0);
  React.useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let release = () => {};
    setStatus("loading");
    Promise.all([import("three"), import("three/addons/controls/OrbitControls.js"), import("./arm-model")]).then(([THREE, { OrbitControls }, { createArmModel }]) => {
      if (disposed) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" }); }
      catch { setStatus("fallback"); return; }
      const canvas = renderer.domElement;
      canvas.setAttribute("aria-hidden", "true");
      canvas.dataset.renderer = "three";
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      element.prepend(canvas);
      release = () => { renderer.dispose(); renderer.forceContextLoss(); canvas.remove(); };
      const scene = new THREE.Scene();
      const model = createArmModel(); scene.add(model.root);
      scene.add(new THREE.AmbientLight(0xffffff, 1.3));
      const light = new THREE.DirectionalLight(0xffffff, 2.2); light.position.set(-3, 6, 4); light.castShadow = true;
      light.shadow.mapSize.set(1024, 1024); light.shadow.camera.left = -4; light.shadow.camera.right = 4; light.shadow.camera.top = 4; light.shadow.camera.bottom = -4;
      light.shadow.normalBias = .025; scene.add(light);
      const fill = new THREE.DirectionalLight(0xffffff, .5); fill.position.set(3, 2, -5); scene.add(fill);
      const camera = new THREE.OrthographicCamera(-3, 3, 2.4, -2.4, .01, 100);
      const controls = new OrbitControls(camera, canvas);
      controls.enablePan = false; controls.enableZoom = false; controls.enableDamping = true; controls.dampingFactor = .12;
      controls.minPolarAngle = .04; controls.maxPolarAngle = Math.PI * .72;
      controls.target.set(.3, 1.05, 0);
      const pathGeometry = new THREE.BufferGeometry();
      const pathMaterial = new THREE.LineDashedMaterial({ color: 0x777777, dashSize: .035, gapSize: .035, transparent: true, opacity: .65 });
      const path = new THREE.Line(pathGeometry, pathMaterial); scene.add(path);
      let lastBase = "", lastView = "", lastZoom = 0, dirty = true, visible = true, lost = false, frame = 0, lastStamp = "";
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      const forced = window.matchMedia("(forced-colors: active)");
      const theme = () => {
        const color = new THREE.Color(getComputedStyle(element).color);
        const dark = color.r + color.g + color.b > 1.5;
        model.mats.edge.color.setHex(0x343434);
        model.mats.fine.color.setHex(0x777777);
        model.mats.selectedMaterial.color.setHex(dark ? 0xf1f1f1 : 0x242424);
        model.mats.ghostMaterial.color.setHex(dark ? 0xdddddd : 0x696969);
        pathMaterial.color.setHex(dark ? 0xb0b0b0 : 0x777777);
        model.mats.scanMaterial.color.setHex(dark ? 0xdddddd : 0x595959);
        canvas.dataset.theme = dark ? "dark" : "light";
        canvas.hidden = forced.matches;
        dirty = true;
      };
      const resize = () => {
        const { width, height } = element.getBoundingClientRect();
        if (width < 1 || height < 1) return;
        const aspect = width / height;
        // Keep the full plate and the raised arm inside the frame at any container width.
        const heightSpan = Math.max(3.9, 5.1 / aspect);
        camera.left = -heightSpan * aspect / 2; camera.right = heightSpan * aspect / 2; camera.top = heightSpan / 2; camera.bottom = -heightSpan / 2;
        camera.updateProjectionMatrix(); renderer.setSize(width, height, false); dirty = true;
      };
      const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(element);
      const intersection = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? true; dirty = true; }); intersection.observe(element);
      const observer = new MutationObserver(mutations => { if (mutations.some(mutation => mutation.target instanceof Element && mutation.target.contains(element))) theme(); }); observer.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ["class", "data-theme"] });
      const mediaChange = () => { controls.enableDamping = !reduced.matches; theme(); };
      reduced.addEventListener("change", mediaChange); forced.addEventListener("change", mediaChange);
      const change = () => { dirty = true; }; controls.addEventListener("change", change);
      const contextLost = (event: Event) => { event.preventDefault(); lost = true; setStatus("fallback"); };
      canvas.addEventListener("webglcontextlost", contextLost);
      resize(); theme(); mediaChange();
      const render = () => {
        if (disposed || lost) return;
        frame = requestAnimationFrame(render);
        if (!visible || document.hidden || forced.matches) return;
        const { clock, selected, draft, aperture, cameraAvailable, pathVisible, view, zoom } = live.current;
        const state = clock.current;
        const angles = sampleArm(state.base, state.time);
        const stamp = `${state.running}|${state.speed}|${state.time}|${JSON.stringify(state.base)}|${selected}|${JSON.stringify(draft)}|${aperture}|${cameraAvailable}|${pathVisible}`;
        if (lastView !== view) {
          controls.target.set(.30, 1.05, 0);
          camera.up.set(0, 1, 0);
          if (view === "front") camera.position.set(.3, 1.05, 8);
          else if (view === "top") { camera.position.set(.3, 9, .01); camera.up.set(0, 0, -1); }
          else camera.position.set(3.6, 3.3, 7.8);
          camera.lookAt(controls.target); controls.update(); lastView = view; dirty = true;
        }
        if (lastZoom !== zoom) { camera.zoom = zoom; camera.updateProjectionMatrix(); lastZoom = zoom; dirty = true; }
        controls.update();
        if (!dirty && stamp === lastStamp) return;
        model.apply(angles, selected, aperture, cameraAvailable, draft);
        const baseKey = JSON.stringify(state.base);
        if (lastBase !== baseKey) {
          const points = Array.from({ length: 97 }, (_, index) => { const pose = armPose(sampleArm(state.base, index / 4)); return new THREE.Vector3(pose.x, pose.y, pose.z); });
          pathGeometry.setFromPoints(points); path.computeLineDistances(); lastBase = baseKey;
        }
        path.visible = pathVisible;
        try { renderer.render(scene, camera); } catch { lost = true; cancelAnimationFrame(frame); setStatus("fallback"); return; }
        // Inspectable rendered state, taken from the actual pivot transforms and tool matrix.
        canvas.dataset.shoulder = (-model.pivots.shoulder.rotation.z * 180 / Math.PI).toFixed(3);
        canvas.dataset.elbow = (-model.pivots.elbow.rotation.z * 180 / Math.PI - 90).toFixed(3);
        canvas.dataset.wrist = (-model.pivots.wrist.rotation.z * 180 / Math.PI).toFixed(3);
        const tip = new THREE.Vector3(0, armDimensions.tool, 0); model.pivots.wrist.localToWorld(tip);
        canvas.dataset.tip = `${tip.x.toFixed(4)},${tip.y.toFixed(4)},${tip.z.toFixed(4)}`;
        canvas.dataset.draft = String(draft != null); canvas.dataset.camera = String(cameraAvailable); canvas.dataset.aperture = String(aperture);
        canvas.dataset.path = String(pathVisible); canvas.dataset.view = view; canvas.dataset.zoom = String(zoom); canvas.dataset.running = String(state.running);
        dirty = false; lastStamp = stamp;
      };
      release = () => {
        cancelAnimationFrame(frame); resizeObserver.disconnect(); intersection.disconnect(); observer.disconnect();
        reduced.removeEventListener("change", mediaChange); forced.removeEventListener("change", mediaChange);
        canvas.removeEventListener("webglcontextlost", contextLost); controls.removeEventListener("change", change); controls.dispose();
        model.dispose(); pathGeometry.dispose(); pathMaterial.dispose(); light.shadow.dispose(); renderer.dispose(); renderer.forceContextLoss(); canvas.remove();
      };
      render(); if (!lost) setStatus("ready");
    }).catch(() => { release(); if (!disposed) setStatus("fallback"); });
    return () => { disposed = true; release(); };
  }, [restart]);
  const angles = sampleArm(props.clock.current.base, props.clock.current.time);
  const s = angles.shoulder * Math.PI / 180, e = (angles.shoulder + 90 + angles.elbow) * Math.PI / 180;
  const { baseX, shoulderHeight, upper, forearm } = armDimensions;
  const points = [[baseX, shoulderHeight], [baseX + upper * Math.sin(s), shoulderHeight + upper * Math.cos(s)], [baseX + upper * Math.sin(s) + forearm * Math.sin(e), shoulderHeight + upper * Math.cos(s) + forearm * Math.cos(e)]];
  const tip = armPose(angles);
  return <div className="rb-scene" ref={host} data-status={status} role="group" aria-label="Articulated inspection arm, measured joint positions">
    <svg className="rb-scene-fallback" data-visible={status !== "ready"} viewBox="0 0 520 360" aria-hidden="true"><path d="M44 300H480M95 323H442" /><path d="M130 300V257H180V300Z" />
      <polyline points={[...points, [tip.x, tip.y]].map(([x, y]) => `${220 + x! * 83},${298 - y! * 83}`).join(" ")} />
      {points.map(([x, y], index) => <circle key={index} cx={220 + x! * 83} cy={298 - y! * 83} r={index === 0 ? 18 : 14} />)}
    </svg>
    {status === "loading" && <span className="rb-scene-state">Loading arm geometry</span>}
    {status === "fallback" && <div className="rb-scene-state"><span>3D view unavailable. Joint projection remains live.</span><Button variant="ghost" size="sm" onClick={() => setRestart(value => value + 1)}><Icon name="refresh" size={16} />Retry 3D view</Button></div>}
  </div>;
}
