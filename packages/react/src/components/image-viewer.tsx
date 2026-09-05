"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";
import { Icon } from "./icon";
import { CanvasControls } from "./canvas-controls";
import { Dialog, DialogTitle } from "./dialog";

export interface ViewerImage { src: string; alt: string; caption?: string }
export interface ImageViewerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  images: readonly ViewerImage[];
  value?: number;
  defaultValue?: number;
  onValueChange?: (index: number) => void;
  label?: string;
}
const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: "1rem", width: "100%", minWidth: 0, color: vlak.ink },
  canvas: { overflow: "auto", height: "22rem", backgroundColor: vlak.controlFill, borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, ":focus-visible": { outlineWidth: 2, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: 2 } },
  plane: { display: "grid", placeItems: "center", width: "max-content", height: "max-content", minWidth: "100%", minHeight: "100%" },
  image: { display: "block", maxWidth: "none", maxHeight: "none", objectFit: "contain" },
  controls: { display: "flex", justifyContent: "space-between", flexWrap: "wrap", alignItems: "center", gap: "0.75rem" },
  navigation: { display: "flex", gap: "0.5rem", alignItems: "center" },
  action: { width: "auto", minWidth: vlak.hit, paddingInline: "0.75rem" },
  caption: { margin: 0, color: vlak.gray, fontSize: "0.875rem", lineHeight: 1.45, overflowWrap: "anywhere" },
  modal: { width: "min(64rem, calc(100vw - 2rem))", maxWidth: "calc(100vw - 2rem)" },
});

/** Inspect a labelled image collection inline or in a native lightbox. */
export const ImageViewer = React.forwardRef<HTMLDivElement, ImageViewerProps>(function ImageViewer({ images, value, defaultValue = 0, onValueChange, label = "Image viewer", className, style, ...props }, ref) {
  const [inner, setInner] = React.useState(defaultValue);
  const requested = value ?? inner;
  const index = Math.max(0, Math.min(images.length - 1, Number.isFinite(requested) ? Math.floor(requested) : 0));
  const selected = images[index];
  const [zoom, setZoom] = React.useState(1);
  const [expanded, setExpanded] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [intrinsic, setIntrinsic] = React.useState({ src: "", width: 0, height: 0 });
  const [viewports, setViewports] = React.useState([{ width: 0, height: 352 }, { width: 0, height: 352 }]);
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const modalCanvasRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => { setZoom(1); setFailed(false); }, [selected?.src]);
  React.useLayoutEffect(() => {
    const measure = () => setViewports((previous) => {
      const next = [canvasRef.current, modalCanvasRef.current].map((element, i) => element?.clientWidth ? { width: element.clientWidth, height: element.clientHeight } : previous[i]!);
      return next.every((size, i) => size.width === previous[i]!.width && size.height === previous[i]!.height) ? previous : next;
    });
    measure();
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
    if (canvasRef.current) observer?.observe(canvasRef.current);
    if (modalCanvasRef.current) observer?.observe(modalCanvasRef.current);
    window.addEventListener("resize", measure);
    return () => { observer?.disconnect(); window.removeEventListener("resize", measure); };
  }, [expanded]);
  const choose = (next: number) => { if (next < 0 || next >= images.length) return; if (value === undefined) setInner(next); onValueChange?.(next); };
  const root = rs(["rs-image-viewer", className], styles.root);
  const canvas = rs(["rs-image-viewer-canvas"], styles.canvas);
  const plane = rs(["rs-image-viewer-plane"], styles.plane);
  const image = rs(["rs-image-viewer-image"], styles.image);
  const controls = rs(["rs-image-viewer-controls"], styles.controls);
  const navigation = rs(["rs-image-viewer-navigation"], styles.navigation);
  const action = rs(["rs-image-viewer-action"], styles.action);
  const caption = rs(["rs-image-viewer-caption"], styles.caption);
  const modal = rs(["rs-image-viewer-modal"], styles.modal);
  const frame = (inModal: boolean) => {
    const viewport = viewports[inModal ? 1 : 0]!;
    const known = intrinsic.src === selected?.src && intrinsic.width > 0 && intrinsic.height > 0;
    const fit = known ? Math.min(1, (viewport.width || intrinsic.width) / intrinsic.width, viewport.height / intrinsic.height) : 1;
    return <div {...canvas} ref={inModal ? modalCanvasRef : canvasRef} tabIndex={0} role="group" aria-label={`${label} canvas. Use arrow keys to change images.`} onKeyDown={event => { if (event.key === "ArrowLeft") { event.preventDefault(); choose(index - 1); } if (event.key === "ArrowRight") { event.preventDefault(); choose(index + 1); } }}>
      <div {...plane}>{selected && !failed ? <img {...image} src={selected.src} alt={selected.alt} draggable={false} style={{ ...image.style, width: known ? intrinsic.width * fit * zoom : "auto", height: known ? intrinsic.height * fit * zoom : viewport.height }} onLoad={event => { const img = event.currentTarget; setIntrinsic({ src: selected.src, width: img.naturalWidth, height: img.naturalHeight }); }} onError={() => setFailed(true)} /> : <p {...caption} role="status">{selected ? "The image could not load." : "No images to show."}</p>}</div>
    </div>;
  };
  const toolbar = <div {...controls}>
    <CanvasControls zoom={zoom} onZoomChange={setZoom} minZoom={0.5} maxZoom={4} disabled={!selected || failed} onFit={() => setZoom(1)} onReset={() => { canvasRef.current?.scrollTo({ left: 0, top: 0 }); modalCanvasRef.current?.scrollTo({ left: 0, top: 0 }); }} />
    <div {...navigation} role="group" aria-label="Image navigation"><Button {...action} variant="ghost" aria-label="Previous image" disabled={index <= 0} onClick={() => choose(index - 1)}><Icon name="chevron-left" /></Button><span {...caption} aria-live="polite">{images.length ? index + 1 : 0} / {images.length}</span><Button {...action} variant="ghost" aria-label="Next image" disabled={index >= images.length - 1} onClick={() => choose(index + 1)}><Icon name="chevron-right" /></Button></div>
  </div>;
  return <div ref={ref} role="region" aria-label={label} {...props} className={root.className} style={{ ...root.style, ...style }}>
    {frame(false)}{toolbar}
    <div {...controls}><p {...caption}>{selected?.caption ?? selected?.alt}</p><Button {...action} variant="ghost" disabled={!selected} onClick={() => setExpanded(true)}><Icon name="expand" />Open lightbox</Button></div>
    <Dialog {...modal} open={expanded} onClose={() => setExpanded(false)} closeLabel="Close image viewer"><DialogTitle>{selected?.caption ?? label}</DialogTitle>{frame(true)}{toolbar}</Dialog>
  </div>;
});
