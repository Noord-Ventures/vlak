"use client";

import * as React from "react";
import { sceneColor } from "./scene-color";
import { renderAsset } from "./render-asset";
import { Button } from "@noorddev/vlak-react";

type ViewportProps = {
  rotating: boolean;
  wireframe: boolean;
  material: "clay" | "graphite";
  resetKey: number;
  onStatusChange?: (status: "loading" | "ready" | "error") => void;
};

const modelUrl = renderAsset.url;

export function ModelViewport(props: ViewportProps) {
  const mountRef = React.useRef<HTMLDivElement>(null);
  const options = React.useRef(props);
  options.current = props;
  const refresh = React.useRef(() => {});
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = React.useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: retry recreates the renderer; all live controls use options and refresh
  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let release = () => {};
    const request = new AbortController();
    const report = (next: "loading" | "ready" | "error") => {
      if (disposed) return;
      setStatus(next);
      options.current.onStatusChange?.(next);
    };
    report("loading");
    const timeout = window.setTimeout(() => { request.abort(); report("error"); }, 30000);

    Promise.all([
      import("three"),
      import("three/addons/controls/OrbitControls.js"),
      import("three/addons/loaders/GLTFLoader.js"),
      import("./object-model"),
    ]).then(async ([THREE, { OrbitControls }, { GLTFLoader }, { createObjectModel }]) => {
      if (disposed || request.signal.aborted) return;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
      const canvas = renderer.domElement;
      canvas.className = "rw-object-canvas";
      canvas.setAttribute("aria-hidden", "true");
      canvas.dataset.renderer = "three";
      canvas.dataset.modelUrl = modelUrl;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      mount.prepend(canvas);

      const scene = new THREE.Scene();
      const geometries = new Set<InstanceType<typeof THREE.BufferGeometry>>();
      const materials = new Set<InstanceType<typeof THREE.Material>>();
      const surfaceMaterials = new Set<InstanceType<typeof THREE.MeshBasicMaterial>>();
      let released = false;
      let disposeControls = () => {};
      release = () => {
        if (released) return;
        released = true;
        disposeControls();
        geometries.forEach(geometry => { geometry.dispose(); });
        materials.forEach(material => { material.dispose(); });
        renderer.dispose();
        renderer.forceContextLoss();
        canvas.remove();
      };
      const response = await fetch(modelUrl, { signal: request.signal });
      if (!response.ok) throw new Error("Object asset unavailable");
      const asset = await new GLTFLoader().parseAsync(await response.arrayBuffer(), "/interfaces/concepts/");
      const sourceModel = asset.scene;
      const sourceMaterials = new Set<InstanceType<typeof THREE.Material>>();
      let triangles = 0;
      let vertices = 0;
      let meshes = 0;
      sourceModel.traverse(object => {
        if (!(object instanceof THREE.Mesh)) return;
        geometries.add(object.geometry);
        const parts = Array.isArray(object.material) ? object.material : [object.material];
        parts.forEach(material => { materials.add(material); sourceMaterials.add(material); });
        triangles += (object.geometry.index?.count ?? object.geometry.attributes.position!.count) / 3;
        vertices += object.geometry.attributes.position!.count;
        meshes += 1;
      });
      if (disposed || request.signal.aborted) {
        // Parsing may finish after an unmount or timeout, after release already ran.
        geometries.forEach(geometry => { geometry.dispose(); });
        materials.forEach(material => { material.dispose(); });
        release();
        return;
      }
      if (!meshes) throw new Error("Object geometry missing");
      const prepared = createObjectModel(sourceModel);
      const model = prepared.root;
      geometries.clear(); materials.clear();
      model.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          geometries.add(object.geometry);
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
            materials.add(material);
            if (object.userData.objectSurface && material instanceof THREE.MeshBasicMaterial) surfaceMaterials.add(material);
          }
        }
      });
      Object.values(prepared.materials).forEach(material => { materials.add(material); });
      const bounds = new THREE.Box3().setFromObject(model);
      const size = bounds.getSize(new THREE.Vector3());
      const scale = 4.5 / Math.max(size.x, size.y, size.z);
      model.scale.multiplyScalar(scale);
      bounds.setFromObject(model);
      const center = bounds.getCenter(new THREE.Vector3());
      model.position.add(new THREE.Vector3(-center.x, -bounds.min.y, -center.z));
      bounds.setFromObject(model);
      bounds.getSize(size);
      scene.add(model);

      const grid = new THREE.GridHelper(12, 24, 0x888888, 0x888888);
      grid.position.y = -.02; grid.material.transparent = true; grid.material.opacity = .09;
      scene.add(grid); geometries.add(grid.geometry); materials.add(grid.material);
      const camera = new THREE.PerspectiveCamera(36, 1, .01, 100);
      const controls = new OrbitControls(camera, canvas);
      controls.enablePan = false;
      controls.enableDamping = false;
      controls.minPolarAngle = .15;
      controls.maxPolarAngle = Math.PI / 2 - .025;
      controls.zoomSpeed = .7;
      const target = new THREE.Vector3(0, size.y * .46, 0);
      const direction = new THREE.Vector3(.45, .16, 1).normalize();
      // Collapse the actual vertices into a rotation-safe radial profile once.
      // This avoids the empty corners of a global box making the object too small.
      const profile: number[] = [];
      const vertex = new THREE.Vector3();
      model.updateMatrixWorld(true);
      model.traverse(object => {
        if (!(object instanceof THREE.Mesh) || !object.userData.objectSurface) return;
        const positions = object.geometry.attributes.position!;
        for (let index = 0; index < positions.count; index++) {
          vertex.fromBufferAttribute(positions, index).applyMatrix4(object.matrixWorld).sub(target);
          profile.push(Math.hypot(vertex.x, vertex.z), vertex.y);
        }
      });
      let home = new THREE.Vector3();
      let dirty = true;
      let hovering = false;
      let visible = true;
      let hasArea = true;
      let lost = false;
      let frame = 0;
      let lastFrame = 0;
      let paletteState = { theme: "light", paper: "", lineInk: "" };
      let previousMaterial = "";
      let previousWireframe: boolean | undefined;
      let previousReset = options.current.resetKey;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      const forced = window.matchMedia("(forced-colors: active)");
      const fail = () => { if (lost || disposed) return; lost = true; cancelAnimationFrame(frame); report("error"); };
      const palette = () => {
        const tokens = getComputedStyle(mount);
        const color = sceneColor(tokens.getPropertyValue("--text"));
        const dark = color.r + color.g + color.b > 1.5;
        const paper = sceneColor(tokens.getPropertyValue("--table-alt"), tokens.getPropertyValue("--bg"));
        const ink = options.current.material === "graphite" ? (dark ? 0xe0e0e0 : 0x252525) : (dark ? 0xa2a2a2 : 0x525252);
        prepared.materials.surface.color.copy(paper);
        prepared.materials.silhouette.color.setHex(ink);
        prepared.materials.edges.color.setHex(ink);
        prepared.materials.edges.opacity = options.current.material === "graphite" ? 1 : .88;
        surfaceMaterials.forEach(material => {
          material.wireframe = options.current.wireframe;
          if (options.current.wireframe) { material.color.setHex(ink); material.transparent = true; material.opacity = .23; }
          else { material.transparent = false; material.opacity = 1; }
        });
        model.traverse(object => { if (object.userData.objectContour) object.visible = !options.current.wireframe; });
        grid.material.color.setHex(dark ? 0xbbbbbb : 0x555555);
        paletteState = { theme: dark ? "dark" : "light", paper: paper.getHexString(), lineInk: prepared.materials.silhouette.color.getHexString() };
        dirty = true;
      };
      const theme = () => palette();
      const reset = () => {
        controls.target.copy(target); camera.position.copy(home); controls.update(); dirty = true;
      };
      const resize = () => {
        const { width, height } = mount.getBoundingClientRect();
        hasArea = width > 0 && height > 0;
        if (!hasArea) return;
        camera.aspect = width / height;
        // Each profile point stays inside all four frustum planes through a full orbit.
        const sphere = bounds.getBoundingSphere(new THREE.Sphere());
        const halfVertical = THREE.MathUtils.degToRad(camera.fov / 2);
        const halfHorizontal = Math.atan(Math.tan(halfVertical) * camera.aspect);
        const sin = direction.y, cos = Math.sqrt(1 - sin * sin);
        const vertical = 1 / Math.tan(halfVertical), horizontal = 1 / Math.tan(halfHorizontal);
        const horizontalFactor = Math.hypot(cos, horizontal);
        let distance = 0;
        for (let index = 0; index < profile.length; index += 2) {
          const radius = profile[index]!, y = profile[index + 1]!;
          distance = Math.max(distance,
            radius * horizontalFactor + y * sin,
            radius * Math.abs(cos - sin * vertical) + y * (sin + cos * vertical),
            radius * Math.abs(cos + sin * vertical) + y * (sin - cos * vertical));
        }
        distance *= 1.06;
        home = target.clone().addScaledVector(direction, distance);
        canvas.dataset.home = home.toArray().map(value => value.toFixed(6)).join(",");
        controls.minDistance = sphere.radius * 1.05;
        controls.maxDistance = distance * 2.5;
        camera.updateProjectionMatrix(); renderer.setSize(width, height, false); prepared.materials.edges.resolution.set(width, height); reset();
        camera.updateMatrixWorld(true);
        const fit = [Infinity, Infinity, -Infinity, -Infinity];
        model.traverse(object => {
          if (!(object instanceof THREE.Mesh) || !object.userData.objectSurface) return;
          const positions = object.geometry.attributes.position!;
          for (let index = 0; index < positions.count; index++) {
            vertex.fromBufferAttribute(positions, index).applyMatrix4(object.matrixWorld).project(camera);
            fit[0] = Math.min(fit[0]!, vertex.x); fit[1] = Math.min(fit[1]!, vertex.y);
            fit[2] = Math.max(fit[2]!, vertex.x); fit[3] = Math.max(fit[3]!, vertex.y);
          }
        });
        canvas.dataset.homeFit = fit.map(value => value.toFixed(6)).join(",");
        canvas.dataset.viewportWidth = String(width); canvas.dataset.viewportHeight = String(height);
      };
      const applyOptions = () => {
        const current = options.current;
        if (previousMaterial !== current.material || previousWireframe !== current.wireframe) {
          palette(); previousMaterial = current.material; previousWireframe = current.wireframe;
        }
        if (previousReset !== current.resetKey) { previousReset = current.resetKey; reset(); }
      };
      refresh.current = () => { applyOptions(); dirty = true; };
      const rotate = (angle: number) => {
        camera.position.sub(controls.target).applyAxisAngle(THREE.Object3D.DEFAULT_UP, angle).add(controls.target);
        controls.update(); dirty = true;
      };
      const keydown = (event: KeyboardEvent) => {
        if (event.target !== mount || !["ArrowLeft", "ArrowRight", "+", "-", "Home"].includes(event.key)) return;
        event.preventDefault();
        if (event.key === "Home") reset();
        else if (event.key === "ArrowLeft" || event.key === "ArrowRight") rotate(event.key === "ArrowLeft" ? -.18 : .18);
        else {
          const offset = camera.position.clone().sub(controls.target);
          offset.setLength(THREE.MathUtils.clamp(offset.length() * (event.key === "+" ? .9 : 1.1), controls.minDistance, controls.maxDistance));
          camera.position.copy(controls.target).add(offset); controls.update(); dirty = true;
        }
      };
      const enter = () => { hovering = true; };
      const leave = () => { hovering = false; };
      const change = () => { dirty = true; };
      const contextLost = (event: Event) => { event.preventDefault(); fail(); };
      const observer = new ResizeObserver(resize); observer.observe(mount);
      const intersection = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? true; dirty = true; }); intersection.observe(mount);
      const mutations = new MutationObserver(changes => { if (changes.some(change => change.target instanceof Element && change.target.contains(mount))) theme(); });
      mutations.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ["class", "data-theme"] });
      controls.addEventListener("change", change);
      mount.addEventListener("keydown", keydown);
      canvas.addEventListener("pointerenter", enter); canvas.addEventListener("pointerleave", leave);
      canvas.addEventListener("webglcontextlost", contextLost);
      reduced.addEventListener("change", change); forced.addEventListener("change", theme);
      canvas.dataset.triangles = String(triangles); canvas.dataset.vertices = String(vertices);
      canvas.dataset.materials = String(sourceMaterials.size); canvas.dataset.meshes = String(meshes);
      const render = (time: number) => {
        if (disposed || lost) return;
        frame = requestAnimationFrame(render);
        const delta = Math.min((time - lastFrame) / 1000, .05); lastFrame = time;
        if (!visible || !hasArea || document.hidden) return;
        applyOptions();
        if (options.current.rotating && !reduced.matches && !hovering && !mount.contains(document.activeElement)) rotate(delta * .16);
        if (!dirty) return;
        try { renderer.render(scene, camera); } catch { fail(); return; }
        // Commit one completed-frame snapshot; a palette change alone is not a rendered frame.
        Object.assign(canvas.dataset, paletteState);
        canvas.dataset.surfaceColor = [...surfaceMaterials][0]?.color.getHexString();
        canvas.dataset.wireframeMaterials = String([...surfaceMaterials].filter(material => material.wireframe).length);
        canvas.dataset.camera = camera.position.toArray().map(value => value.toFixed(6)).join(",");
        canvas.dataset.target = controls.target.toArray().map(value => value.toFixed(6)).join(",");
        canvas.dataset.renderedTriangles = String(renderer.info.render.triangles);
        canvas.dataset.renderedLines = String(renderer.info.render.lines);
        canvas.dataset.frames = String(renderer.info.render.frame);
        dirty = false;
      };
      disposeControls = () => {
        cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect(); mutations.disconnect();
        refresh.current = () => {};
        controls.removeEventListener("change", change); controls.dispose();
        mount.removeEventListener("keydown", keydown);
        canvas.removeEventListener("pointerenter", enter); canvas.removeEventListener("pointerleave", leave);
        canvas.removeEventListener("webglcontextlost", contextLost);
        reduced.removeEventListener("change", change); forced.removeEventListener("change", theme);
      };
      theme(); resize(); applyOptions();
      render(performance.now());
      window.clearTimeout(timeout);
      if (!lost) report("ready");
    }).catch(() => { release(); window.clearTimeout(timeout); report("error"); });
    return () => { disposed = true; request.abort(); window.clearTimeout(timeout); release(); };
  }, [attempt]);

  React.useEffect(() => { refresh.current(); });

  return <div className="rw-live-model rw-object-viewport" ref={mountRef} tabIndex={0} role="region" aria-label="Interactive Braun T3 radio model. Drag or use left and right arrow keys to orbit. Use plus and minus to zoom, and Home to reset." data-viewer-status={status}>
    {status !== "ready" && <div className="rw-object-status" role="status">
      <b>{status === "loading" ? "Loading Braun T3 model" : "The 3D model could not load"}</b>
      <p>{status === "loading" ? "Preparing the detailed model and its materials." : "Check your connection and WebGL availability, then retry the local model."}</p>
      {status === "error" && <Button variant="ghost" onClick={() => setAttempt(value => value + 1)}>Retry viewer</Button>}
    </div>}
  </div>;
}
