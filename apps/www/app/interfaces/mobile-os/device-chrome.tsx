"use client";

import * as React from "react";

import type { DeviceProfile } from "./device-profiles";

/** Keep one mounted app while its hardware, display and safe areas resize. */
export function DeviceFrame({ device, expanded, rotated, live, prepareFold, children }: { device: DeviceProfile; expanded: boolean; rotated: boolean; live: boolean; prepareFold: React.RefObject<(() => void) | null>; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const fit = React.useRef<HTMLDivElement>(null);
  const previous = React.useRef({ expanded, rotated, device: device.id });
  const beforeFold = React.useRef<{ screen: HTMLElement; context: DOMStringMap; scrollTop: number } | null>(null);
  const [available, setAvailable] = React.useState<number | null>(null);
  const display = expanded && device.expanded ? device.expanded : device.display;
  const width = live ? available ?? 320 : (rotated ? display.height : display.width) + display.bezel * 2;
  const height = live ? 680 : (rotated ? display.width : display.height) + display.bezel * 2;
  const scale = live || available === null ? 1 : Math.min(1, available / width);
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
    const viewport = ref.current;
    const frame = fit.current;
    const screen = frame?.querySelector<HTMLElement>(".mo-phone");
    const inner = device.expanded;
    const captured = beforeFold.current;
    beforeFold.current = null;
    if (!viewport || !frame || !screen || !inner || old.device !== device.id || old.expanded === expanded || live || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Temporary, inert copies are a visual texture only. The one live app stays
    // mounted underneath; its inputs, focus and scroll state are never replaced.
    const screenWidth = rotated ? inner.height : inner.width;
    const screenHeight = rotated ? inner.width : inner.height;
    const spreadWidth = screenWidth + inner.bezel * 2;
    const spreadHeight = screenHeight + inner.bezel * 2;
    const half = spreadWidth / 2;
    const closedWidth = (rotated ? device.display.height : device.display.width) + device.display.bezel * 2;
    const room = viewport.getBoundingClientRect().width;
    const closedScale = Math.min(1, room / closedWidth);
    const openScale = Math.min(1, room / spreadWidth);
    const stage = document.createElement("div");
    stage.className = "mo-fold-stage";
    stage.dataset.axis = rotated ? "horizontal" : "vertical";
    stage.ariaHidden = "true";
    stage.inert = true;
    Object.assign(stage.style, { width: `${spreadWidth}px`, height: `${spreadHeight}px` });
    // The stage is a sibling of the fitted handset, so explicitly carry its
    // native safe area instead of inheriting an undefined custom property.
    stage.style.setProperty("--mo-safe-top", `${rotated ? 44 : inner.safeTop}px`);
    stage.style.setProperty("--mo-device-radius", "0px");
    // Closing retains the expanded arrangement until the outer display resolves.
    // Capture happens before React changes posture, so a dock or toolbar cannot
    // jump to its compact position on the first frame of the fold.
    const source = !expanded && captured ? captured.screen : screen;
    const context = document.createElement("div");
    context.className = "mo-device mo-fold-context";
    Object.assign(context.dataset, !expanded && captured ? captured.context : screen.closest<HTMLElement>(".mo-device")?.dataset);
    stage.append(context);
    const panels = ["left", "right"].map(side => {
      const panel = document.createElement("div");
      panel.className = `mo-fold-panel mo-fold-panel-${side}`;
      const glass = document.createElement("div");
      glass.className = "mo-fold-glass";
      const copy = source.cloneNode(true) as HTMLElement;
      copy.classList.add("mo-fold-texture");
      Object.assign(copy.style, { width: `${screenWidth}px`, height: `${screenHeight}px`, borderRadius: "0", padding: "0", left: !rotated && side === "right" ? `${-screenWidth / 2}px` : "0px", top: rotated && side === "right" ? `${-screenHeight / 2}px` : "0px" });
      for (const node of [copy, ...copy.querySelectorAll<HTMLElement>("*")]) {
        node.removeAttribute("id");
        node.removeAttribute("name");
        node.removeAttribute("autofocus");
      }
      const scrollTop = !expanded && captured ? captured.scrollTop : screen.querySelector(".mo-scroll")?.scrollTop ?? 0;
      const diffusion = document.createElement("div");
      diffusion.className = "mo-fold-diffusion";
      glass.append(copy, diffusion);
      panel.append(glass);
      context.append(panel);
      return { panel, copy, diffusion, scrollTop };
    });
    viewport.append(stage);
    panels.forEach(({ copy, scrollTop }) => { const scroll = copy.querySelector(".mo-scroll"); if (scroll) scroll.scrollTop = scrollTop; });
    frame.classList.add("mo-folding");
    const options = { duration: 1240, easing: "cubic-bezier(.32,0,.18,1)", fill: "both" as const };
    const closed = rotated ? `translateX(-50%) scale(${closedScale})` : `translateX(-50%) scale(${closedScale}) translateX(${-half / 2}px)`;
    const opened = `translateX(-50%) scale(${openScale}) translateX(0px)`;
    // Pull back as the display turns toward the camera, keeping its projected
    // edges inside the stage before settling into the expanded footprint.
    const turning = `translateX(-50%) translateY(${spreadHeight * openScale * .15}px) scale(${Math.min(closedScale, openScale) * .68}) translateX(0px)`;
    const direction = <T,>(values: T[]) => expanded ? values : [...values].reverse();
    const animations = [
      // Keep the surrounding stage on the hinge timeline. Its ordinary resize
      // transition finishes sooner and would crop the projected screen midway.
      frame.animate([{ height: `${frame.getBoundingClientRect().height}px` }, { height: `${height * scale}px` }], options),
      stage.animate(direction([{ transform: closed }, { transform: turning }, { transform: opened }]), options),
      panels[0]!.panel.animate(direction([{ transform: rotated ? "rotateX(-178deg)" : "rotateY(178deg)" }, { transform: rotated ? "rotateX(0deg)" : "rotateY(0deg)" }]), options),
      panels[1]!.panel.animate(direction([{ transform: rotated ? "rotateX(8deg)" : "rotateY(-8deg)" }, { transform: rotated ? "rotateX(0deg)" : "rotateY(0deg)" }]), options),
    ];
    // Observed in Apple's opening and closing film: the turning display diffuses
    // gradually while the settled half and the physical frame stay sharp.
    // All optical layers use the hinge's timeline, including the reverse fold.
    const optical = [
      { filter: "blur(24px)", opacity: .58, offset: 0 },
      { filter: "blur(18px)", opacity: .72, offset: .35 },
      { filter: "blur(7px)", opacity: .9, offset: .65 },
      { filter: "blur(0px)", opacity: 1, offset: 1 },
    ];
    const opticalFrames = expanded ? optical : optical.map(frame => ({ ...frame, offset: 1 - frame.offset })).reverse();
    animations.push(panels[0]!.copy.animate(opticalFrames, options));
    animations.push(panels[0]!.diffusion.animate(direction([{ opacity: 1 }, { opacity: 0 }]), options));
    animations.push(stage.animate([{ opacity: 1 }, { opacity: 1, offset: .78 }, { opacity: 0 }], options));
    const handset = frame.querySelector<HTMLElement>(".mo-handset");
    if (handset) animations.push(handset.animate([{ opacity: 0 }, { opacity: 0, offset: .78 }, { opacity: 1 }], options));
    animations.push(screen.animate([{ filter: "blur(9px)" }, { filter: "blur(9px)", offset: .78 }, { filter: "blur(0px)" }], options));
    let active = true;
    const restore = () => { animations.forEach(animation => { animation.cancel(); }); stage.remove(); frame.classList.remove("mo-folding"); };
    void Promise.all(animations.map(animation => animation.finished)).then(() => { if (active) restore(); }).catch(() => {});
    return () => { active = false; restore(); };
  }, [expanded, rotated, device, live]);
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

export function StatusSignals({ platform, wifi, cellular }: { platform: "ios" | "android"; wifi: boolean; cellular: boolean }) {
  return <span className="mo-status-signals" aria-hidden="true">
    {platform === "ios" ? <svg width="19" height="12" viewBox="0 0 19 12"><g fill="currentColor" opacity={cellular ? 1 : .3}><rect y="8" width="3" height="4" rx=".7" /><rect x="5" y="5.5" width="3" height="6.5" rx=".7" /><rect x="10" y="3" width="3" height="9" rx=".7" /><rect x="15" width="3" height="12" rx=".7" /></g></svg> : null}
    {wifi && <svg width="17" height="13" viewBox="0 0 17 13"><g fill="currentColor"><path d="M.2 3.5a12 12 0 0 1 16.6 0L15.2 5a9.8 9.8 0 0 0-13.4 0Z" /><path d="M3.1 6.4a7.7 7.7 0 0 1 10.8 0L12.3 8a5.5 5.5 0 0 0-7.6 0Z" /><path d="M6 9.3a3.6 3.6 0 0 1 5 0L8.5 12Z" /></g></svg>}
    {platform === "android" && <svg width="13" height="13" viewBox="0 0 13 13"><path d="M1 12 12 1v11Z" fill="currentColor" opacity={cellular ? 1 : .3} /></svg>}
    <span className="mo-battery"><span /></span>
  </span>;
}
