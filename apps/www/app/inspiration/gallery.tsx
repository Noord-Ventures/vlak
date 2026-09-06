"use client";

import { Badge, Button, ButtonGroup, CardBody, CardLabel, Icon, Label, Link, Select, Slider, Toggle } from "@noorddev/vlak-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { VlakMark } from "@/components/vlak-mark";
import type { ReferenceCaption } from "../about/reference-captions";
import { ReferenceTile } from "./reference-tile";
import { studies } from "./collection";
import { wrapIndex } from "./dynamics";
import type { GalleryScene, Lighting, Interaction } from "./scene";

const iconButtonLayout = { width: "var(--hit)", minWidth: "var(--hit)", paddingInline: 0 };

export function Gallery({ embedded = false, captions = {} }: { embedded?: boolean; captions?: Record<string, ReferenceCaption> }) {
  const host = useRef<HTMLDivElement>(null);
  const engine = useRef<GalleryScene | null>(null);
  const [active, setActive] = useState(0);
  const [lighting, setLighting] = useState<Lighting>("daylight");
  const [interaction, setInteraction] = useState<Interaction>("browse");
  const [rotating, setRotating] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [statuses, setStatuses] = useState<Record<number, "ready" | "error">>({});
  const [failed, setFailed] = useState(false);
  const [slow, setSlow] = useState(false);
  const [retry, setRetry] = useState(0);
  const [zoom, setZoom] = useState(1);
  const settings = useRef({ active, lighting, rotating, interaction, reduced, zoom });
  settings.current = { active, lighting, rotating, interaction, reduced, zoom };
  const study = studies[active]!;
  const ready = statuses[active] === "ready" && !failed;
  const unavailable = statuses[active] === "error" || failed;
  const Container = embedded ? "div" : "main";

  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      const next = root.dataset.theme === "dark" ? "gallery" : "daylight";
      setLighting(next);
      engine.current?.setLighting(next);
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduced(media.matches);
      if (media.matches) setRotating(false);
      engine.current?.setReducedMotion(media.matches);
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Retry deliberately recreates and disposes the renderer.
  useEffect(() => {
    const root = host.current;
    if (!root) return;
    let disposed = false;
    let timeout: number | undefined;
    const start = () => {
      timeout = window.setTimeout(() => { if (!disposed) setSlow(true); }, 8000);
      import("./scene").then(({ createGalleryScene }) => {
      if (disposed) return;
      const api = createGalleryScene(root, {
        onSelect: setActive,
        onStatus: (index, status) => { if (!disposed) setStatuses((old) => ({ ...old, [index]: status })); },
        onError: () => { if (!disposed) setFailed(true); },
      });
      engine.current = api;
      const value = settings.current;
      api.setReducedMotion(value.reduced);
      api.setLighting(value.lighting);
      api.setRotating(value.rotating);
      api.setInteraction(value.interaction);
      api.setZoom(value.zoom);
      api.select(value.active);
      }).catch(() => { if (!disposed) setFailed(true); });
    };
    // About is a long page; prepare the studio only as its field approaches.
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      start();
    }, { rootMargin: "300px" });
    if (embedded) observer.observe(root);
    else start();
    return () => {
      disposed = true;
      clearTimeout(timeout);
      observer.disconnect();
      engine.current?.dispose();
      engine.current = null;
    };
  }, [retry, embedded]);

  const select = useCallback((index: number) => {
    const next = wrapIndex(index, studies.length);
    setActive(next);
    engine.current?.select(next);
  }, []);

  useEffect(() => {
    const selected = document.getElementById(`study-select-${active}`);
    const rail = selected?.closest<HTMLElement>(".inspiration-filmstrip");
    if (!selected || !rail) return;
    const reveal = () => {
      const start = selected.getBoundingClientRect().left - rail.getBoundingClientRect().left + rail.scrollLeft;
      const end = start + selected.offsetWidth;
      const left = start < rail.scrollLeft ? start : end > rail.scrollLeft + rail.clientWidth ? end - rail.clientWidth : rail.scrollLeft;
      // Always replace the scroll target, including rapid End → Home presses.
      rail.scrollTo({ left, behavior: reduced ? "instant" : "smooth" });
    };
    reveal();
    const observer = new ResizeObserver(reveal);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [active, reduced]);

  return (
    <Container id={embedded ? undefined : "main"} className={`inspiration-surface ${embedded ? "inspiration-embed" : "inspiration-page"}`} data-lighting={lighting}>
      {!embedded && <header className="inspiration-header">
        <Link href="/" className="inspiration-brand" aria-label="Vlak home"><VlakMark /><span>Vlak</span></Link>
        <CardBody className="inspiration-location">The reference collection / 01</CardBody>
        <Link href="/about/" className="inspiration-back">About Vlak <Icon name="arrow-right" /></Link>
      </header>}

      <section className="inspiration-gallery" aria-label="Design inspiration" aria-roledescription="carousel">
        {!embedded && <div className="inspiration-intro">
          <div><CardLabel>Furniture · Architecture · Graphic design</CardLabel><h1>Studies in form</h1></div>
          <CardBody className="inspiration-intro-copy">A few things that shaped the way we see.<br />An open collection of Vlak’s influences.</CardBody>
        </div>}

        <div className="inspiration-stage" data-ready={ready} data-interaction={interaction} data-work-id={study.id}>
          <div className="inspiration-stage-top">
            <div className="inspiration-stage-paper" role="status" aria-label={`${active + 1} of ${studies.length}: ${study.title}, ${study.artist}`}><Badge>{String(active + 1).padStart(2, "0")} / {String(studies.length).padStart(2, "0")}</Badge></div>
          </div>

          <div className="inspiration-controls" role="group" aria-label="Object controls">
            <ButtonGroup aria-label="Object view" style={{ width: "auto" }}>
              <Button variant="ghost" style={iconButtonLayout} disabled={!ready} aria-label="Rotate object left" onClick={() => engine.current?.rotateBy(-Math.PI / 8)}><Icon name="undo" /></Button>
              <Button variant="ghost" style={iconButtonLayout} disabled={!ready} aria-label="Rotate object right" onClick={() => engine.current?.rotateBy(Math.PI / 8)}><Icon name="redo" /></Button>
              <Button variant="ghost" disabled={!ready} onClick={() => { setZoom(1); engine.current?.reset(); }}>Reset</Button>
            </ButtonGroup>
            <div className="inspiration-zoom inspiration-stage-paper">
              <Label htmlFor="inspiration-scale">Scale</Label>
              <div className="inspiration-zoom-slider"><Slider id="inspiration-scale" min={0.8} max={1.35} step={0.01} value={zoom} disabled={!ready} aria-label="Object scale" onValueChange={(value) => { setZoom(value); engine.current?.setZoom(value); }} /></div>
              <output htmlFor="inspiration-scale">{Math.round(zoom * 100)}%</output>
            </div>
          </div>

          <div ref={host} className="inspiration-canvas" aria-hidden="true" />
          {!ready && <div className="inspiration-fallback">
            <img src={study.poster ?? study.image} alt={study.model ? `Spatial study after ${study.title}` : `${study.title} by ${study.artist}`} onError={(event) => { if (event.currentTarget.getAttribute("src") !== study.image) event.currentTarget.src = study.image; }} />
            <div className="inspiration-stage-paper"><CardBody role="status">{unavailable ? "Still view. The interactive scene is unavailable." : slow ? "The studio is taking a little longer. You can keep browsing." : "Preparing the studio…"}</CardBody></div>
            {unavailable && <Button variant="ghost" onClick={() => { setFailed(false); setStatuses({}); setSlow(false); setRetry((value) => value + 1); }}>Retry 3D</Button>}
          </div>}

          <div className="inspiration-stage-arrow inspiration-stage-arrow-prev inspiration-stage-paper"><Button variant="ghost" style={iconButtonLayout} aria-label="Previous work" onClick={() => select(active - 1)}><Icon name="arrow-left" /></Button></div>
          <div className="inspiration-stage-arrow inspiration-stage-arrow-next inspiration-stage-paper"><Button variant="ghost" style={iconButtonLayout} aria-label="Next work" onClick={() => select(active + 1)}><Icon name="arrow-right" /></Button></div>
          <div className="inspiration-stage-bottom">
            <div className="inspiration-stage-paper">
              <Toggle pressed={interaction === "turn"} disabled={!ready} onPressedChange={(pressed) => { const mode = pressed ? "turn" : "browse"; setInteraction(mode); engine.current?.setInteraction(mode); }}>Turn object</Toggle>
            </div>
            <div className="inspiration-gesture inspiration-stage-paper" aria-hidden="true"><CardBody>{interaction === "browse" ? "Drag to explore" : "Drag to rotate"}</CardBody></div>
            <div className="inspiration-stage-paper inspiration-rotation">
              <Toggle disabled={!ready || reduced} aria-label={reduced ? "Automatic rotation disabled by reduced motion preference" : undefined} pressed={rotating} onPressedChange={(value) => { setRotating(value); engine.current?.setRotating(value); }}>
                <Icon name={rotating ? "pause" : "play"} />{reduced ? "Reduced motion" : rotating ? "Stop rotation" : "Auto rotate"}
              </Toggle>
            </div>
          </div>
        </div>

        <div className="inspiration-collection-nav">
          <CardLabel>{studies.length} works</CardLabel>
          <Select aria-label="Jump to a work" value={study.id} options={studies.map((item) => ({ value: item.id, label: `${item.title} · ${item.artist}` }))} onValueChange={(id) => select(studies.findIndex((item) => item.id === id))} style={{ width: "min(100%, 24rem)", minWidth: 0 }} />
        </div>
        <div className="inspiration-filmstrip" role="group" aria-label="Choose a work" onKeyDown={(event) => {
          let next: number;
          if (event.key === "ArrowRight") next = wrapIndex(active + 1, studies.length);
          else if (event.key === "ArrowLeft") next = wrapIndex(active - 1, studies.length);
          else if (event.key === "Home") next = 0;
          else if (event.key === "End") next = studies.length - 1;
          else return;
          event.preventDefault();
          select(next);
          document.getElementById(`study-select-${next}`)?.focus({ preventScroll: true });
        }}>
          {studies.map((item, index) => <ReferenceTile key={item.id} study={item} caption={captions[item.image]} index={index} selected={active === index} onSelect={select} />)}
        </div>
      </section>

      <footer className="inspiration-notes">
        <CardLabel>About this work</CardLabel>
        <CardBody>{study.relation}</CardBody>
        <Link href={study.source} target="_blank" rel="noreferrer">{study.sourceLabel} <Icon name="external" /></Link>
      </footer>
    </Container>
  );
}
