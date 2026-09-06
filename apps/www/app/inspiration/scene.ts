import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { studies } from "./collection";
import { createStudyObject } from "./objects";
import { nearestEquivalentIndex, releaseTarget, stepInertia, stepSpring, wrapIndex, type MotionState } from "./dynamics";

export type Lighting = "daylight" | "gallery";
export type Interaction = "browse" | "turn";
export interface GalleryScene {
  select(index: number): void;
  setLighting(lighting: Lighting): void;
  setRotating(value: boolean): void;
  setReducedMotion(value: boolean): void;
  setInteraction(value: Interaction): void;
  setZoom(value: number): void;
  rotateBy(angle: number): void;
  reset(): void;
  dispose(): void;
}
interface Callbacks {
  onSelect(index: number): void;
  onStatus(index: number, status: "ready" | "error"): void;
  onError(): void;
}
interface Exhibit {
  carrier: THREE.Group;
  pivot: THREE.Group;
  angle: MotionState;
  pitch: MotionState;
  contact: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
}

const count = studies.length;
const clamp = THREE.MathUtils.clamp;

function contactTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d")!;
  const gradient = context.createRadialGradient(64, 64, 2, 64, 64, 64);
  gradient.addColorStop(0, "rgba(0,0,0,0.27)");
  gradient.addColorStop(0.4, "rgba(0,0,0,0.13)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

function disposeObject(object: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    geometries.add(child.geometry);
    for (const material of Array.isArray(child.material) ? child.material : [child.material]) {
      materials.add(material);
      for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
    }
  });
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
  for (const texture of textures) texture.dispose();
}

/** A single renderer; no React updates per frame and no remote model dependencies. */
export function createGalleryScene(root: HTMLDivElement, callbacks: Callbacks): GalleryScene {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, root.clientWidth < 640 ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  root.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const background = new THREE.Color(0xededed);
  scene.background = background;
  scene.fog = new THREE.Fog(background, 15, 34);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 70);
  const look = new THREE.Vector3(0, 1.25, 0);
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, 0.025);
  scene.environment = environment.texture;
  scene.environmentIntensity = 1.15;
  room.dispose();
  pmrem.dispose();

  const key = new THREE.DirectionalLight(0xffffff, 3.2);
  key.position.set(-3.5, 7, 4.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -11;
  key.shadow.camera.right = 11;
  key.shadow.camera.top = 7;
  key.shadow.camera.bottom = -5;
  key.shadow.camera.near = 0.1;
  key.shadow.camera.far = 22;
  key.shadow.normalBias = 0.025;
  key.shadow.bias = -0.00015;
  key.shadow.radius = 5;
  key.shadow.blurSamples = 8;
  scene.add(key);
  const fill = new THREE.HemisphereLight(0xffffff, 0x9d9d9d, 0.75);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 1.8);
  rim.position.set(5, 4, -5);
  scene.add(rim);

  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xe5e5e5, roughness: 0.89, metalness: 0 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.015;
  floor.receiveShadow = true;
  scene.add(floor);

  const shadowTexture = contactTexture();
  const exhibits: Exhibit[] = studies.map((study) => {
    const carrier = new THREE.Group();
    const pivot = new THREE.Group();
    carrier.add(pivot);
    const contact = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 3), new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, opacity: 0.8 }));
    contact.rotation.x = -Math.PI / 2;
    contact.position.y = 0.003;
    carrier.add(contact);
    scene.add(carrier);
    return { carrier, pivot, contact, angle: { position: study.angle, velocity: 0 }, pitch: { position: 0, velocity: 0 } };
  });

  let alive = true;
  let visible = true;
  let frame = 0;
  let previousTime = 0;
  let active = 0;
  let target = 0;
  let slide: MotionState = { position: 0, velocity: 0 };
  let lighting: Lighting = "daylight";
  let lightState: MotionState = { position: 0, velocity: 0 };
  let zoomTarget = 1;
  let zoomState: MotionState = { position: 1, velocity: 0 };
  let rotating = false;
  let reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let interaction: Interaction = "browse";
  let drag: { id: number; startX: number; startY: number; x: number; y: number; time: number; moved: boolean; axis: "x" | "y" | null } | null = null;
  const pendingAngles = new Map<number, number>();
  let wheelSum = 0;
  let lastWheel = 0;
  const daylight = new THREE.Color(0xededed);
  const night = new THREE.Color(0x222222);
  const floorDay = new THREE.Color(0xe0e0e0);
  const floorNight = new THREE.Color(0x0a0a0a);

  const select = (index: number, continuous?: number) => {
    active = wrapIndex(index, count);
    target = continuous ?? nearestEquivalentIndex(active, slide.position, count);
    if (reduced) slide = { position: target, velocity: 0 };
    callbacks.onSelect(active);
    pumpLoads();
    wake();
  };

  const loader = new GLTFLoader();
  const textureLoader = new THREE.TextureLoader();
  const pendingLoads = new Set(studies.map((_, index) => index));
  let loadsInFlight = 0;

  async function loadStudy(index: number) {
    const study = studies[index]!;
    const exhibit = exhibits[index]!;
    let object: THREE.Object3D;
    if (study.model) {
      object = (await loader.loadAsync(study.model)).scene;
    } else {
      const texture = await textureLoader.loadAsync(study.image);
      if (!alive) { texture.dispose(); return; }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      object = createStudyObject(study, texture);
    }
    if (!alive) { disposeObject(object); return; }
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    // Keep the approved first chair and pavilion framing unchanged. New models
    // fit their own bounds instead of inheriting a category-wide scale multiplier.
    if (study.id === "hfg-ulm") object.scale.setScalar(1.17);
    else if (study.model && study.id !== "chair-35") {
      const bounds = new THREE.Box3().setFromObject(object);
      const size = bounds.getSize(new THREE.Vector3());
      object.scale.multiplyScalar(Math.min(1, 3.3 / Math.max(size.x, size.z), 2.9 / size.y));
      bounds.setFromObject(object);
      const center = bounds.getCenter(new THREE.Vector3());
      object.position.sub(new THREE.Vector3(center.x, bounds.min.y, center.z));
    }
    exhibit.pivot.add(object);
    callbacks.onStatus(index, "ready");
    wake();
  }

  /** Three assets at most; each free slot serves the selected work and its neighbors first. */
  function pumpLoads() {
    if (!alive) return;
    while (loadsInFlight < 3 && pendingLoads.size) {
      const nearby = [...pendingLoads].sort((a, b) => {
        const distance = (index: number) => Math.abs(nearestEquivalentIndex(index, active, count) - active);
        return distance(a) - distance(b) || wrapIndex(a - active, count) - wrapIndex(b - active, count);
      });
      const index = nearby[0]!;
      pendingLoads.delete(index);
      loadsInFlight++;
      loadStudy(index)
        .catch(() => { if (alive) callbacks.onStatus(index, "error"); })
        .finally(() => { loadsInFlight--; pumpLoads(); });
    }
  }
  pumpLoads();

  function resize() {
    if (!alive) return;
    const width = root.clientWidth;
    const height = root.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = width < 640 ? 39 : 34;
    camera.updateProjectionMatrix();
    wake();
  }

  function wake() {
    if (alive && visible && !document.hidden && !frame) {
      previousTime = performance.now();
      frame = requestAnimationFrame(render);
    }
  }

  function render(time: number) {
    frame = 0;
    if (!alive || !visible || document.hidden) return;
    const dt = Math.min((time - previousTime) / 1000, 1 / 15);
    previousTime = time;
    const dark = lighting === "gallery" ? 1 : 0;
    lightState = reduced ? { position: dark, velocity: 0 } : stepSpring(lightState, dark, dt);
    zoomState = reduced ? { position: zoomTarget, velocity: 0 } : stepSpring(zoomState, zoomTarget, dt);
    if (!drag || interaction !== "browse") slide = reduced ? { position: target, velocity: 0 } : stepSpring(slide, target, dt);
    background.copy(daylight).lerp(night, lightState.position);
    (scene.fog as THREE.Fog).color.copy(background);
    floorMaterial.color.copy(floorDay).lerp(floorNight, lightState.position);
    scene.environmentIntensity = THREE.MathUtils.lerp(0.65, 0.45, lightState.position);
    key.intensity = THREE.MathUtils.lerp(1.8, 2.2, lightState.position);
    fill.intensity = THREE.MathUtils.lerp(0.35, 0.06, lightState.position);
    rim.intensity = THREE.MathUtils.lerp(0.7, 1.7, lightState.position);

    const narrow = camera.aspect < 1.1;
    camera.position.set(0, 3.35 / zoomState.position, (narrow ? 9.7 : 8) / zoomState.position);
    camera.lookAt(look);
    let moving = false;
    for (let index = 0; index < exhibits.length; index++) {
      const exhibit = exhibits[index]!;
      const offset = nearestEquivalentIndex(index, slide.position, count) - slide.position;
      const distance = Math.abs(offset);
      exhibit.carrier.visible = distance < 2.4;
      exhibit.carrier.position.set(offset * (narrow ? 4.1 : 4.25), 0, -distance * 1.3);
      exhibit.carrier.scale.setScalar(1 - Math.min(distance, 2) * 0.1);
      if (pendingAngles.has(index)) {
        const angleTarget = pendingAngles.get(index)!;
        exhibit.angle = reduced ? { position: angleTarget, velocity: 0 } : stepSpring(exhibit.angle, angleTarget, dt);
        if (Math.abs(exhibit.angle.position - angleTarget) < 0.0001 && Math.abs(exhibit.angle.velocity) < 0.001) pendingAngles.delete(index);
      } else if (!(drag && interaction === "turn" && active === index)) {
        exhibit.angle = stepInertia(exhibit.angle, dt, reduced ? 1000 : 3.4);
        if (rotating && !reduced && active === index) exhibit.angle.position += dt * 0.18;
      }
      const pitchTarget = !reduced && drag && interaction === "turn" && active === index ? clamp((drag.y - drag.startY) * 0.002, -0.22, 0.22) : 0;
      exhibit.pitch = reduced ? { position: 0, velocity: 0 } : stepSpring(exhibit.pitch, pitchTarget, dt);
      exhibit.pivot.rotation.set(exhibit.pitch.position, exhibit.angle.position + clamp(-offset * 0.09, -0.35, 0.35), reduced ? 0 : clamp(-slide.velocity * 0.018, -0.07, 0.07));
      // Procedural displays include their own feet/rests; all objects meet the floor.
      exhibit.pivot.position.y = 0;
      exhibit.contact.material.opacity = THREE.MathUtils.lerp(0.85, 0.45, lightState.position);
      if (Math.abs(exhibit.angle.velocity) > 0.001 || Math.abs(exhibit.pitch.velocity) > 0.001 || pendingAngles.has(index)) moving = true;
    }
    renderer.render(scene, camera);
    // Expose compact render diagnostics on the canvas for browser verification.
    renderer.domElement.dataset.active = String(active);
    renderer.domElement.dataset.drawCalls = String(renderer.info.render.calls);
    renderer.domElement.dataset.triangles = String(renderer.info.render.triangles);
    if (drag || (rotating && !reduced) || moving || Math.abs(slide.position - target) > 0.0001 || Math.abs(slide.velocity) > 0.001 || Math.abs(lightState.position - dark) > 0.0001 || Math.abs(zoomState.position - zoomTarget) > 0.0001) frame = requestAnimationFrame(render);
  }

  function pointerDown(event: PointerEvent) {
    if (event.button !== 0 || drag) return;
    drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, time: event.timeStamp, moved: false, axis: event.pointerType === "mouse" ? "x" : null };
    if (interaction === "turn") pendingAngles.delete(active);
    root.setPointerCapture(event.pointerId);
    wake();
  }
  function pointerMove(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.id) return;
    const distanceX = event.clientX - drag.startX;
    const distanceY = event.clientY - drag.startY;
    if (!drag.axis && Math.hypot(distanceX, distanceY) > 6) drag.axis = Math.abs(distanceX) >= Math.abs(distanceY) ? "x" : "y";
    if (drag.axis === "y") return;
    if (!drag.axis) return;
    const dx = event.clientX - drag.x;
    const elapsed = Math.max(8, event.timeStamp - drag.time) / 1000;
    drag.moved ||= Math.hypot(distanceX, distanceY) > 5;
    if (interaction === "browse") {
      const delta = -dx / Math.min(root.clientWidth * 0.62, 580);
      slide.position += delta;
      slide.velocity = reduced ? 0 : clamp(delta / elapsed, -4, 4);
    } else {
      const exhibit = exhibits[active]!;
      exhibit.angle.position += dx * 0.009;
      exhibit.angle.velocity = reduced ? 0 : clamp(dx * 0.009 / elapsed, -5, 5);
    }
    drag.x = event.clientX;
    drag.y = event.clientY;
    drag.time = event.timeStamp;
    wake();
  }
  function pointerUp(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.id) return;
    const completed = drag;
    drag = null;
    if (root.hasPointerCapture(event.pointerId)) root.releasePointerCapture(event.pointerId);
    if (interaction === "browse" && completed.moved && completed.axis === "x") {
      const velocity = event.type === "pointercancel" || event.timeStamp - completed.time > 100 ? 0 : slide.velocity;
      slide.velocity = velocity;
      const next = releaseTarget(slide.position, velocity);
      select(wrapIndex(next, count), next);
    } else if (interaction === "turn" && (event.type === "pointercancel" || event.timeStamp - completed.time > 100)) {
      exhibits[active]!.angle.velocity = 0;
    }
    wake();
  }
  function wheel(event: WheelEvent) {
    // Vertical scrolling remains page scrolling; horizontal trackpad gestures browse.
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || event.ctrlKey) return;
    event.preventDefault();
    const now = performance.now();
    if (now - lastWheel < 500) return;
    wheelSum += event.deltaX;
    if (Math.abs(wheelSum) > 35) {
      select(active + Math.sign(wheelSum));
      wheelSum = 0;
      lastWheel = now;
    }
  }
  function visibility() {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else wake();
  }
  function contextLost(event: Event) {
    event.preventDefault();
    cancelAnimationFrame(frame);
    frame = 0;
    visible = false;
    callbacks.onError();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(root);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    if (visible) wake();
    else { cancelAnimationFrame(frame); frame = 0; }
  });
  intersectionObserver.observe(root);
  root.addEventListener("pointerdown", pointerDown);
  root.addEventListener("pointermove", pointerMove);
  root.addEventListener("pointerup", pointerUp);
  root.addEventListener("pointercancel", pointerUp);
  root.addEventListener("wheel", wheel, { passive: false });
  document.addEventListener("visibilitychange", visibility);
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  resize();

  return {
    select,
    setLighting(value) { lighting = value; wake(); },
    setRotating(value) { rotating = value; wake(); },
    setReducedMotion(value) { reduced = value; if (value) rotating = false; wake(); },
    setInteraction(value) { interaction = value; },
    setZoom(value) { zoomTarget = clamp(value, 0.8, 1.35); wake(); },
    rotateBy(angle) { const exhibit = exhibits[active]!; pendingAngles.set(active, (pendingAngles.get(active) ?? exhibit.angle.position) + angle); wake(); },
    reset() { pendingAngles.set(active, studies[active]!.angle); zoomTarget = 1; wake(); },
    dispose() {
      alive = false;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      root.removeEventListener("pointerdown", pointerDown);
      root.removeEventListener("pointermove", pointerMove);
      root.removeEventListener("pointerup", pointerUp);
      root.removeEventListener("pointercancel", pointerUp);
      root.removeEventListener("wheel", wheel);
      document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      disposeObject(scene);
      environment.dispose();
      key.shadow.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
