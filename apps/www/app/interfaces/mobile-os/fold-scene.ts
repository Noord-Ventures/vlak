import type { DeviceProfile } from "./device-profiles";

export type FoldCapture = { screen: HTMLElement; context: DOMStringMap; scrollTop: number };
export type FoldScene = { move: (target: number) => void; seek: (progress: number) => void; resize: () => void; destroy: () => void; readonly progress: number };
const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const radians = (degrees: number) => degrees * Math.PI / 180;

/** Two articulated solid bodies. Only their screen planes clip or diffuse.
 * The live DOM remains mounted; the disposable textures have no interaction. */
export function createFoldScene({ viewport, frame, device, rotated, inner, outer, initial, onRest }: {
  viewport: HTMLElement; frame: HTMLElement; device: DeviceProfile; rotated: boolean;
  inner: FoldCapture; outer: FoldCapture; initial: number; onRest: () => void;
}): FoldScene {
  const display = device.expanded!;
  const screenWidth = rotated ? display.height : display.width;
  const screenHeight = rotated ? display.width : display.height;
  const width = screenWidth + display.bezel * 2;
  const height = screenHeight + display.bezel * 2;
  const closedWidth = (rotated ? device.display.height : device.display.width) + device.display.bezel * 2;
  const closedHeight = (rotated ? device.display.width : device.display.height) + device.display.bezel * 2;
  let room = viewport.clientWidth;
  let closedScale = Math.min(1, room / closedWidth);
  let openScale = Math.min(1, room / width);
  const depth = 9;
  const perspective = 2200;
  const wrapper = document.createElement("div");
  wrapper.className = "mo-fold-presentation";
  wrapper.ariaHidden = "true"; wrapper.inert = true;
  const stage = document.createElement("div");
  stage.className = "mo-fold-stage"; stage.dataset.axis = rotated ? "horizontal" : "vertical";
  Object.assign(stage.style, { width: `${width}px`, height: `${height}px` });
  stage.style.setProperty("--mo-fold-depth", `${depth}px`);
  stage.style.setProperty("--mo-fold-bezel", `${display.bezel}px`);
  stage.style.setProperty("--mo-fold-cover-radius", `${device.display.radius}px`);
  wrapper.append(stage);
  const shadow = document.createElement("div"); shadow.className = "mo-fold-shadow";
  wrapper.prepend(shadow);
  const copies: { copy: HTMLElement; scrollTop: number }[] = [];
  const texture = (source: FoldCapture, w: number, h: number, side?: string) => {
    const context = document.createElement("div");
    context.className = "mo-device mo-fold-context";
    Object.assign(context.dataset, source.context, { posture: side ? "expanded" : "compact" });
    context.style.setProperty("--mo-safe-top", `${rotated ? 44 : display.safeTop}px`);
    context.style.setProperty("--mo-device-radius", "0px");
    const copy = source.screen.cloneNode(true) as HTMLElement;
    copy.classList.add("mo-fold-texture");
    if (!side) { delete copy.dataset.split; copy.querySelector(".mo-ios-master-list")?.remove(); }
    copy.dataset.duoDisplay = side ? "inner" : "outer";
    copy.dataset.duoLayout = side && rotated ? "horizontal" : "vertical";
    copy.dataset.duoOrientation = side ? rotated ? "portrait" : "landscape" : rotated ? "landscape" : "portrait";
    Object.assign(copy.style, { width: `${w}px`, height: `${h}px`, borderRadius: "0", padding: "0", left: !rotated && side === "right" ? `${-w / 2}px` : "0px", top: rotated && side === "right" ? `${-h / 2}px` : "0px" });
    for (const node of [copy, ...copy.querySelectorAll<HTMLElement>("*")]) {
      node.removeAttribute("id"); node.removeAttribute("name"); node.removeAttribute("autofocus");
      // Native popovers in a visual texture must not participate in top-layer UI.
      node.removeAttribute("popover");
    }
    context.append(copy); copies.push({ copy, scrollTop: source.scrollTop });
    return { context, copy };
  };
  const panels = ["left", "right"].map(side => {
    const panel = document.createElement("div"); panel.className = `mo-fold-panel mo-fold-panel-${side}`;
    // Stacked rounded perimeter sections give curved corners real depth without
    // putting overflow/filter/opacity on the preserve-3d body.
    for (let i = 0; i < 7; i++) {
      const rim = document.createElement("i"); rim.className = "mo-fold-rim";
      rim.style.transform = `translateZ(${-depth / 2 + i * depth / 6}px)`;
      panel.append(rim);
    }
    const front = document.createElement("div"); front.className = "mo-fold-front";
    const glass = document.createElement("div"); glass.className = "mo-fold-glass";
    const screenTexture = texture(inner, screenWidth, screenHeight, side);
    const reflection = document.createElement("div"); reflection.className = "mo-fold-reflection";
    glass.append(screenTexture.context, reflection); front.append(glass);
    const back = document.createElement("div"); back.className = "mo-fold-back";
    if (side === "left") {
      const cover = document.createElement("div"); cover.className = "mo-fold-cover";
      const outerW = rotated ? device.display.height : device.display.width;
      const outerH = rotated ? device.display.width : device.display.height;
      const coverTexture = texture(outer, outerW, outerH);
      coverTexture.copy.classList.add("mo-fold-cover-texture");
      cover.append(coverTexture.context); back.append(cover);
    } else {
      const cameras = document.createElement("div"); cameras.className = "mo-fold-camera-module";
      cameras.innerHTML = "<i></i><i></i><b></b>"; back.append(cameras);
    }
    for (const edge of ["top", "bottom", "outside", "hinge"]) {
      const plane = document.createElement("i"); plane.className = `mo-fold-edge mo-fold-edge-${edge}`; panel.append(plane);
    }
    panel.append(front, back); stage.append(panel);
    return { panel, front, back, copy: screenTexture.copy, reflection };
  });
  const hinge = document.createElement("div"); hinge.className = "mo-fold-spine";
  for (let i = 0; i < 9; i++) {
    const facet = document.createElement("i"); facet.style.transform = `rotateY(${i * 20}deg) translateZ(5px)`; hinge.append(facet);
  }
  stage.append(hinge);
  viewport.append(wrapper);
  copies.forEach(({ copy, scrollTop }) => { const scroll = copy.querySelector(".mo-scroll"); if (scroll) scroll.scrollTop = scrollTop; });
  frame.classList.add("mo-folding");
  frame.inert = true;
  let p = clamp(initial), velocity = 0, target = p, raf = 0, last = 0, disposed = false;
  const render = () => {
    const turn = Math.sin(Math.PI * p);
    const fold = 180 * (1 - p);
    stage.style.setProperty("--mo-fold-shell-radius", `${mix(device.display.radius + device.display.bezel, display.radius + display.bezel, p)}px`);
    stage.style.setProperty("--mo-fold-inner-corner", `${(device.display.radius + device.display.bezel) * (1 - clamp(p * 2))}px`);
    stage.style.setProperty("--mo-fold-inner-glass-corner", `${device.display.radius * (1 - clamp(p * 2))}px`);
    const yaw = -18 * turn, pitch = 11 * turn, roll = -3 * turn;
    // Project the actual articulated corner positions. Framing follows the
    // object, not a fake shrinking rectangle, in either device orientation.
    const points: { x: number; y: number }[] = [];
    for (let side = 0; side < 2; side++) for (const u of [0, 1]) for (const v of [0, 1]) for (const z0 of [-depth / 2, depth / 2]) {
      let x = (rotated ? u : (side + u) / 2) * width - width / 2;
      let y = (rotated ? (side + v) / 2 : v) * height - height / 2;
      let z = z0;
      if (side === 0) {
        // The hinge pivots on the inner glass plane. Closed rear/front faces
        // remain separated by the chassis thickness instead of z-fighting.
        z -= depth / 2;
        const a = radians(rotated ? -fold : fold), c = Math.cos(a), s = Math.sin(a);
        if (rotated) { const nextY = y * c - z * s; z = y * s + z * c; y = nextY; }
        else { const nextX = x * c + z * s; z = -x * s + z * c; x = nextX; }
        z += depth / 2;
      }
      const rz = radians(roll), rx = radians(pitch), ry = radians(yaw);
      let a = x * Math.cos(rz) - y * Math.sin(rz); y = x * Math.sin(rz) + y * Math.cos(rz); x = a;
      a = x * Math.cos(ry) + z * Math.sin(ry); z = -x * Math.sin(ry) + z * Math.cos(ry); x = a;
      a = y * Math.cos(rx) - z * Math.sin(rx); z = y * Math.sin(rx) + z * Math.cos(rx); y = a;
      const projection = perspective / (perspective - z);
      points.push({ x: x * projection, y: y * projection });
    }
    const xs = points.map(point => point.x), ys = points.map(point => point.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const naturalScale = mix(closedScale, openScale, p);
    const fitScale = Math.min(naturalScale, (room - 12 * turn) / (maxX - minX));
    const floorHeight = mix(closedHeight * closedScale, height * openScale, p);
    const fitHeight = Math.max(floorHeight, (maxY - minY) * fitScale + 16 * turn);
    const translateX = -(minX + maxX) / 2 * fitScale;
    const translateY = fitHeight / 2 - height / 2 - (minY + maxY) / 2 * fitScale;
    wrapper.style.height = `${fitHeight}px`;
    frame.style.height = `${fitHeight}px`;
    stage.style.transform = `translateX(-50%) translate(${translateX}px, ${translateY}px) scale(${fitScale}) perspective(${perspective}px) rotateX(${pitch}deg) rotateY(${yaw}deg) rotateZ(${roll}deg)`;
    panels[0]!.panel.style.transform = rotated ? `rotateX(${-fold}deg)` : `rotateY(${fold}deg)`;
    panels[1]!.panel.style.transform = "translateZ(0px)";
    stage.dataset.hingeAngle = (p * 180).toFixed(2);
    stage.dataset.progress = p.toFixed(4);
    // No backdrop sampling of opaque app content. Diffusion belongs only to
    // the moving inner display; the cover, settled display and chassis are crisp.
    const blur = 12 * (1 - p) ** 1.7;
    panels[0]!.copy.style.filter = blur < .04 ? "none" : `blur(${blur.toFixed(2)}px)`;
    panels[0]!.reflection.style.opacity = String(.34 * turn);
    panels[0]!.reflection.style.transform = `translateX(${(p - .5) * 100}%)`;
    panels[1]!.reflection.style.opacity = String(.07 * turn);
    hinge.style.opacity = "1";
    // Mechanical hinge lives behind the display. Its facets must never draw
    // over the continuous inner glass, including at the fully open endpoint.
    hinge.style.transform = `translate(-50%, -50%) translateZ(${-depth / 2 - 5.1}px)${rotated ? " rotateZ(90deg)" : ""}`;
    shadow.style.width = `${(maxX - minX) * fitScale * .84}px`;
    shadow.style.top = `${fitHeight - 18}px`;
    shadow.style.opacity = String(.12 + turn * .14);
    shadow.style.transform = `translateX(-50%) scaleY(${1 + turn})`;
  };
  const tick = (time: number) => {
    if (disposed) return;
    const dt = Math.min((time - (last || time - 16)) / 1000, .032); last = time;
    // Critically damped spring. Retargeting keeps both position and velocity.
    const omega = 8.8, displacement = p - target, decay = Math.exp(-omega * dt);
    const b = velocity + omega * displacement;
    p = target + (displacement + b * dt) * decay;
    velocity = (velocity - omega * b * dt) * decay;
    p = clamp(p); render();
    if (Math.abs(p - target) < .0007 && Math.abs(velocity) < .007) {
      p = target; velocity = 0; raf = 0; render(); onRest();
    } else raf = requestAnimationFrame(tick);
  };
  render();
  return {
    get progress() { return p; },
    resize() { room = viewport.clientWidth; closedScale = Math.min(1, room / closedWidth); openScale = Math.min(1, room / width); render(); },
    move(next) { target = clamp(next); last = 0; if (!raf) raf = requestAnimationFrame(tick); },
    seek(next) { cancelAnimationFrame(raf); raf = 0; p = clamp(next); velocity = 0; target = p; render(); },
    destroy() { disposed = true; cancelAnimationFrame(raf); wrapper.remove(); frame.classList.remove("mo-folding"); frame.inert = false; frame.style.height = `${target === 1 ? height * openScale : closedHeight * closedScale}px`; },
  };
}
