"use client";

import * as React from "react";
import { Button, Icon, Textarea, ToggleGroup } from "@noorddev/vlak-react";
import { MobileStudyNav, focusMobileMode } from "./mobile-navigation";

type Format = "widescreen" | "desktop" | "phone";

type Wallpaper = {
  id: string;
  name: string;
  background: string;
  ink: string;
  signal: string;
  quiet: string;
  grid: number;
  horizon: number;
  blockX: number;
  blockY: number;
  blockW: number;
  blockH: number;
  discX: number;
  discY: number;
  discR: number;
  stripeX: number;
  stripeGap: number;
  diagonal: number;
};

const formats: Record<Format, { label: string; width: number; height: number }> = {
  widescreen: { label: "Widescreen", width: 6144, height: 3456 },
  desktop: { label: "Desktop", width: 6144, height: 3840 },
  phone: { label: "Phone", width: 3456, height: 6144 },
};

const palettes = [
  ["#ede8dc", "#121212", "#2142c7", "#b9b3a5"],
  ["#dcd9cf", "#171714", "#d44825", "#aaa69c"],
  ["#111310", "#eeeae0", "#d6d16a", "#51544c"],
  ["#e7e5dd", "#14251d", "#2a7364", "#aaa99f"],
] as const;

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function random(seed: number) {
  let value = seed;
  return () => {
    value += 0x6d2b79f5;
    let number = value;
    number = Math.imul(number ^ (number >>> 15), number | 1);
    number ^= number + Math.imul(number ^ (number >>> 7), number | 61);
    return ((number ^ (number >>> 14)) >>> 0) / 4294967296;
  };
}

function makeWallpapers(prompt: string, variation: number, generation: number) {
  return Array.from({ length: 3 }, (_, index): Wallpaper => {
    const seed = hash(`${prompt}:${variation}:${generation}:${index}`);
    const next = random(seed);
    const palette = palettes[Math.floor(next() * palettes.length)]!;
    return {
      id: `${seed}-${generation}-${index}`,
      name: ["Primary field", "Open structure", "Signal study"][index]!,
      background: palette[0],
      ink: palette[1],
      signal: palette[2],
      quiet: palette[3],
      grid: 4 + Math.floor(next() * 6),
      horizon: 0.34 + next() * 0.34,
      blockX: 0.08 + next() * 0.35,
      blockY: 0.08 + next() * 0.34,
      blockW: 0.2 + next() * 0.28,
      blockH: 0.18 + next() * 0.3,
      discX: 0.56 + next() * 0.3,
      discY: 0.16 + next() * 0.56,
      discR: 0.055 + next() * 0.09,
      stripeX: 0.12 + next() * 0.7,
      stripeGap: 0.012 + next() * 0.012,
      diagonal: 0.18 + next() * 0.46,
    };
  });
}

function WallpaperArt({ wallpaper, format }: { wallpaper: Wallpaper; format: Format }) {
  const ratio = formats[format].height / formats[format].width;
  const width = 1000;
  const height = width * ratio;
  const gridLines = Array.from({ length: wallpaper.grid - 1 }, (_, index) => (index + 1) / wallpaper.grid);
  const stripes = Array.from({ length: 7 }, (_, index) => index);
  return (
    <svg className="cx-wallpaper-art" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={wallpaper.name}>
      <rect width={width} height={height} fill={wallpaper.background} />
      <g stroke={wallpaper.quiet} strokeWidth="1" opacity="0.48">
        {gridLines.map((line) => <line key={`v-${line}`} x1={line * width} x2={line * width} y2={height} />)}
        {gridLines.map((line) => <line key={`h-${line}`} y1={line * height} y2={line * height} x2={width} />)}
      </g>
      <path d={`M0 ${height} L${width} ${height * wallpaper.diagonal} L${width} ${height} Z`} fill={wallpaper.ink} />
      <rect x={wallpaper.blockX * width} y={wallpaper.blockY * height} width={wallpaper.blockW * width} height={wallpaper.blockH * height} fill={wallpaper.signal} />
      <rect x="0" y={wallpaper.horizon * height} width={width} height={Math.max(8, height * 0.025)} fill={wallpaper.ink} />
      <circle cx={wallpaper.discX * width} cy={wallpaper.discY * height} r={wallpaper.discR * Math.min(width, height)} fill={wallpaper.signal} />
      <g fill={wallpaper.ink}>
        {stripes.map((stripe) => <rect key={stripe} x={(wallpaper.stripeX + stripe * wallpaper.stripeGap) * width} y={height * 0.07} width={Math.max(2, width * 0.004)} height={height * 0.22} />)}
      </g>
    </svg>
  );
}

function drawWallpaper(context: CanvasRenderingContext2D, wallpaper: Wallpaper, width: number, height: number) {
  context.fillStyle = wallpaper.background;
  context.fillRect(0, 0, width, height);
  context.strokeStyle = wallpaper.quiet;
  context.globalAlpha = 0.48;
  context.lineWidth = Math.max(1, width / 3072);
  for (let index = 1; index < wallpaper.grid; index += 1) {
    const point = index / wallpaper.grid;
    context.beginPath();
    context.moveTo(point * width, 0);
    context.lineTo(point * width, height);
    context.stroke();
    context.beginPath();
    context.moveTo(0, point * height);
    context.lineTo(width, point * height);
    context.stroke();
  }
  context.globalAlpha = 1;
  context.fillStyle = wallpaper.ink;
  context.beginPath();
  context.moveTo(0, height);
  context.lineTo(width, height * wallpaper.diagonal);
  context.lineTo(width, height);
  context.closePath();
  context.fill();
  context.fillStyle = wallpaper.signal;
  context.fillRect(wallpaper.blockX * width, wallpaper.blockY * height, wallpaper.blockW * width, wallpaper.blockH * height);
  context.fillStyle = wallpaper.ink;
  context.fillRect(0, wallpaper.horizon * height, width, Math.max(8, height * 0.025));
  context.fillStyle = wallpaper.signal;
  context.beginPath();
  context.arc(wallpaper.discX * width, wallpaper.discY * height, wallpaper.discR * Math.min(width, height), 0, Math.PI * 2);
  context.fill();
  context.fillStyle = wallpaper.ink;
  for (let stripe = 0; stripe < 7; stripe += 1) {
    context.fillRect((wallpaper.stripeX + stripe * wallpaper.stripeGap) * width, height * 0.07, Math.max(2, width * 0.004), height * 0.22);
  }
}

export function WallpaperGenerator() {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [mobileView, setMobileView] = React.useState("preview");
  const [selected, setSelected] = React.useState(0);
  const [prompt, setPrompt] = React.useState("A quiet geometric field for focused work, with one cobalt signal.");
  const [format, setFormat] = React.useState<Format>("widescreen");
  const [variation, setVariation] = React.useState(42);
  const [generation, setGeneration] = React.useState(0);
  const [status, setStatus] = React.useState("Choose a composition or generate another set.");
  const [exporting, setExporting] = React.useState(false);
  const [results, setResults] = React.useState(() => makeWallpapers(prompt, variation, generation));

  React.useEffect(() => {
    if (rootRef.current && rootRef.current.clientWidth <= 640) setFormat("phone");
  }, []);

  function generate() {
    const next = generation + 1;
    setGeneration(next);
    setResults(makeWallpapers(prompt, variation, next));
    setSelected(0);
    setStatus("Three new wallpapers ready.");
    setMobileView("preview");
    focusMobileMode(rootRef.current, "preview");
  }

  function exportSelected() {
    const wallpaper = results[selected];
    if (!wallpaper || exporting) return;
    const dimensions = formats[format];
    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const context = canvas.getContext("2d");
    if (!context) {
      setStatus("This browser cannot prepare the export.");
      return;
    }
    drawWallpaper(context, wallpaper, dimensions.width, dimensions.height);
    setExporting(true);
    setStatus(`Preparing ${dimensions.width} × ${dimensions.height} PNG…`);
    canvas.toBlob((blob) => {
      setExporting(false);
      if (!blob) {
        setStatus("The export could not be prepared.");
        return;
      }
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = `vlak-wallpaper-${format}-${selected + 1}-6k.png`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(href), 1000);
      setStatus(`${dimensions.width} × ${dimensions.height} PNG exported.`);
    }, "image/png");
  }

  return <div ref={rootRef} className="cx cx-graphics" data-mobile-view={mobileView}>
    <header><span>Three compositions, one starting point</span><Button className="cx-export-action" variant="ghost" size="sm" style={{ borderRadius: "var(--radius-sm)" }} disabled={exporting} onClick={exportSelected}>{exporting ? "Exporting…" : "Export 6K"}</Button></header>
    <aside aria-label="Composition direction">
      <p className="cx-label">Direction</p>
      <div className="cx-direction"><Textarea label="Variation seed" style={{ borderRadius: "var(--radius-sm)", minHeight: 0 }} value={prompt} onChange={(event) => setPrompt(event.target.value)} /></div>
      <div className="cx-format-field">
        <p className="cx-label">Canvas</p>
        <ToggleGroup className="cx-segments" aria-label="Canvas format" style={{ borderRadius: "var(--radius-sm)", height: "auto" }} value={format} onValueChange={(value) => setFormat(value as Format)} options={(Object.keys(formats) as Format[]).map(value => ({ value, label: <span className="cx-format-label">{value === "widescreen" ? <><span className="cx-desktop-only">Widescreen</span><span className="cx-mobile-only">Wide</span></> : formats[value].label}</span> }))} />
        <small className="cx-output-size">{formats[format].width} × {formats[format].height} · PNG</small>
      </div>
      <label className="cx-variation">Variation<input type="range" min="0" max="100" value={variation} onChange={(event) => setVariation(Number(event.target.value))} /></label>
      <Button style={{ borderRadius: "var(--radius-sm)" }} onClick={generate}><Icon name="image" size={16}/>Generate</Button>
      <p className="cx-generation-status" aria-live="polite">{status}</p>
    </aside>
    <div className="cx-workspace" role="region" aria-label="Wallpaper previews"><div className="cx-results">{results.map((wallpaper, index) => <button type="button" key={wallpaper.id} className={selected === index ? "on" : ""} aria-pressed={selected === index} onClick={() => setSelected(index)}><WallpaperArt wallpaper={wallpaper} format={format}/><span>{String(index + 1).padStart(2, "0")} · {wallpaper.name}</span></button>)}</div><div className="cx-mobile-compositions"><span>Composition</span><ToggleGroup aria-label="Choose composition" value={String(selected)} onValueChange={(value) => setSelected(Number(value))} options={results.map((wallpaper, index) => ({ value: String(index), label: String(index + 1), "aria-label": wallpaper.name }))}/></div></div>
    <MobileStudyNav label="Wallpaper workspace" value={mobileView} onValueChange={setMobileView} options={[{ value: "preview", label: "Preview", icon: "image" }, { value: "direction", label: "Direction", icon: "settings" }]}/>
  </div>;
}
