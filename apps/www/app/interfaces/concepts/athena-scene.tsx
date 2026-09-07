"use client";

import * as React from "react";

/** Decorative line portrait with a bounded slow turn and a still reduced-motion view. */
export function AthenaScene() {
  const host = React.useRef<HTMLDivElement>(null);
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false, release = () => {};
    const request = new AbortController();
    Promise.all([import("three"), import("./athena-model")]).then(async ([THREE, { createAthenaModel, athenaAsset }]) => {
      const response = await fetch(athenaAsset.geometry, { signal: request.signal });
      if (!response.ok) throw new Error("Portrait unavailable");
      const data = await response.json();
      if (disposed) return;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setClearColor(0x000000, 0);
      const canvas = renderer.domElement; canvas.setAttribute("aria-hidden", "true"); canvas.dataset.renderer = "three"; element.prepend(canvas);
      release = () => { renderer.dispose(); renderer.forceContextLoss(); canvas.remove(); };
      const scene = new THREE.Scene(), model = createAthenaModel(data); scene.add(model.root);
      const camera = new THREE.OrthographicCamera(-1.5, 1.5, 1.6, -1.6, .01, 20); camera.position.set(0, .04, 5); camera.lookAt(0, .04, 0);
      let visible = true, dirty = true, frame = 0, time = 0, previous = performance.now(), last = 0, lost = false;
      const reduced = matchMedia("(prefers-reduced-motion: reduce)");
      const forced = matchMedia("(forced-colors: active)");
      const media = () => { dirty = true; };
      const resize = () => {
        const { width, height } = element.getBoundingClientRect(); if (!width || !height) return;
        const aspect = width / height, span = 2.28;
        canvas.dataset.viewHeight = String(span);
        camera.left = -span * aspect / 2; camera.right = span * aspect / 2; camera.top = span / 2; camera.bottom = -span / 2; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); dirty = true;
      };
      const theme = () => { model.setInk(getComputedStyle(element).color); dirty = true; };
      const observer = new MutationObserver(mutations => { if (mutations.some(mutation => mutation.target instanceof Element && mutation.target.contains(element))) theme(); });
      observer.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ["class", "data-theme"] });
      const sizes = new ResizeObserver(resize); sizes.observe(element);
      const intersection = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? true; dirty = true; }); intersection.observe(element);
      const contextLost = (event: Event) => { event.preventDefault(); lost = true; cancelAnimationFrame(frame); setReady(false); setFailed(true); };
      canvas.addEventListener("webglcontextlost", contextLost); reduced.addEventListener("change", media); forced.addEventListener("change", media);
      media(); resize(); theme();
      const direction = new THREE.Vector3(0, 0, 1);
      const render = (now: number) => {
        if (disposed || lost) return;
        frame = requestAnimationFrame(render);
        const elapsed = Math.min((now - previous) / 1000, .05); previous = now;
        if (!visible || document.hidden || forced.matches) return;
        if (!reduced.matches) { time += elapsed; dirty = true; }
        if (canvas.dataset.playing !== String(!reduced.matches)) dirty = true;
        if (!dirty || now - last < 30) return;
        last = now;
        model.root.rotation.y = -.23 + Math.sin(time / 9) * .17;
        model.root.position.x = Math.sin(time / 13) * .035;
        model.root.position.y = Math.sin(time / 17) * .012;
        model.updateSilhouette(direction);
        try { renderer.render(scene, camera); } catch { contextLost(new Event("webglcontextlost")); return; }
        canvas.dataset.angle = model.root.rotation.y.toFixed(4); canvas.dataset.playing = String(!reduced.matches);
        dirty = false;
      };
      release = () => { cancelAnimationFrame(frame); sizes.disconnect(); intersection.disconnect(); observer.disconnect(); reduced.removeEventListener("change", media); forced.removeEventListener("change", media); canvas.removeEventListener("webglcontextlost", contextLost); model.dispose(); renderer.dispose(); renderer.forceContextLoss(); canvas.remove(); };
      render(performance.now()); if (!lost) setReady(true);
    }).catch(() => { release(); if (!disposed) { setReady(false); setFailed(true); } });
    return () => { disposed = true; request.abort(); release(); };
  }, []);
  return <div className="athena-portrait" data-ready={ready} data-failed={failed} aria-hidden="true">
    <div className="athena-canvas" ref={host} aria-hidden="true"><span className="athena-fallback" /></div>

  </div>;
}
