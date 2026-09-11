"use client";

import * as React from "react";
import { Button, Icon, Input, NativeSelect, Slider, Textarea } from "@noorddev/vlak-react";
import { ProjectTools } from "@/components/project-tools";
import { parseWallpaperProject, type WallpaperProject } from "./wallpaper-project";


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

function exportSlug(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 64) || "wallpaper";
}

function projectRevision(project: { title: string; prompt: string; variation: number; generation: number; selected: number; format: Format; results: Wallpaper[] }) {
  const fingerprint = JSON.stringify({ ...project, generatorVersion: 1, rendererVersion: 1 });
  // This is a readable content label for exported art, not a security digest
  // and not the random revision used by browser project storage.
  return `r${hash(fingerprint).toString(16).padStart(8, "0")}`;
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
    <svg className="wg-art" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={wallpaper.name}>
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
  const rootRef = React.useRef<HTMLElement>(null);
  const [title, setTitle] = React.useState("Field studies");
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
    requestAnimationFrame(() => rootRef.current?.querySelector<HTMLButtonElement>('[data-mobile-mode="preview"]')?.focus({ preventScroll: true }));
  }

  function exportSelected() {
    const wallpaper = results[selected];
    if (!wallpaper || exporting) return;
    // Capture the complete project payload before rendering so edits during an
    // asynchronous PNG export cannot change its revision or filename.
    const project = {
      title: title.trim() || "Untitled project",
      prompt,
      variation,
      generation,
      selected,
      format,
      results: results.map(result => ({ ...result })),
    };
    const snapshot = {
      title: project.title,
      wallpaper: { ...wallpaper },
      format: project.format,
      generation: project.generation,
      selected: project.selected,
      dimensions: { ...formats[project.format] },
      revision: projectRevision(project),
    };
    const canvas = document.createElement("canvas");
    canvas.width = snapshot.dimensions.width;
    canvas.height = snapshot.dimensions.height;
    const context = canvas.getContext("2d");
    if (!context) {
      setStatus("This browser cannot prepare the export.");
      return;
    }
    drawWallpaper(context, snapshot.wallpaper, snapshot.dimensions.width, snapshot.dimensions.height);
    setExporting(true);
    setStatus(`Preparing ${snapshot.dimensions.width} × ${snapshot.dimensions.height} PNG…`);
    canvas.toBlob((blob) => {
      setExporting(false);
      if (!blob) {
        setStatus("The export could not be prepared.");
        return;
      }
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = `${exportSlug(snapshot.title)}-${snapshot.format}-${snapshot.revision}-composition-${snapshot.selected + 1}.png`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(href), 1000);
      setStatus(`${snapshot.dimensions.width} × ${snapshot.dimensions.height} PNG exported.`);
    }, "image/png");
  }

  function restoreProject(value: WallpaperProject, title: string) {
    setTitle(title); setPrompt(value.prompt); setVariation(value.variation); setGeneration(value.generation); setFormat(value.format); setResults(value.results); setSelected(value.selected); setStatus(`Opened ${title}.`); setMobileView("preview");
  }

  const current = results[selected]!;
  return <section ref={rootRef} className="wg" data-mobile-view={mobileView} aria-label="Wallpaper studio">
      <header className="wg-header"><div className="wg-project"><Icon name="image" size={24} /><div><strong>{title.trim() || "Untitled project"}</strong><span>Collection {String(generation + 1).padStart(2, "0")}</span></div></div><div className="wg-header-actions"><ProjectTools kind="wallpaper" title={title} value={{ prompt, variation, generation, selected, format, results, generatorVersion: 1, rendererVersion: 1 }} parse={parseWallpaperProject} onRestore={restoreProject} documentVersion={1} /><Button className="wg-export" variant="ghost" size="sm" disabled={exporting} onClick={exportSelected}><Icon name="download" size={16} />{exporting ? "Exporting…" : "Export 6K"}</Button></div></header>
    <div className="wg-body">
      <aside className="wg-direction" aria-label="Composition direction">
        <div className="wg-panel-head"><div><span>Generator</span><h2>Shape the field</h2></div><Icon name="sliders" size={16} /></div>
        <div className="wg-direction-scroll">
          <Input label="Project name" maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} />
          <Textarea label="Variation seed" rows={4} maxLength={500} value={prompt} onChange={(event) => setPrompt(event.target.value)} />
          <p className="wg-hint">Your words seed the shapes and palette. Every set is drawn locally.</p>
          <div className="wg-format"><NativeSelect label="Canvas format" value={format} onChange={(event) => setFormat(event.target.value as Format)}>{(Object.keys(formats) as Format[]).map(value => <option key={value} value={value}>{formats[value].label}</option>)}</NativeSelect><span className="wg-output-size">{formats[format].width} × {formats[format].height} · PNG</span></div>
          <div className="wg-variation"><div><span>Variation</span><output>{variation}</output></div><Slider aria-label="Variation" min={0} max={100} value={variation} onValueChange={setVariation} /><p className="wg-hint">Shift the arrangement without changing your direction.</p></div>
          <div className="wg-spec"><span>Output</span><strong>Full-resolution artwork</strong><p>6,144 pixels on the long edge. Ready for your screen.</p></div>
        </div>
        <div className="wg-generate"><Button onClick={generate}><Icon name="refresh" size={16} />Generate set</Button></div>
      </aside>
      <section className="wg-preview" aria-label="Wallpaper previews">
        <div className="wg-viewbar"><div><span>{String(selected + 1).padStart(2, "0")} / 03</span><strong>{current.name}</strong></div><span>{formats[format].label}</span></div>
        <div className="wg-stage" data-format={format}><WallpaperArt wallpaper={current} format={format} /></div>
        <div className="wg-compositions" role="group" aria-label="Choose composition">{results.map((wallpaper, index) => <Button variant="ghost" key={wallpaper.id} aria-label={wallpaper.name} aria-pressed={selected === index} onClick={() => { setSelected(index); setStatus(`${wallpaper.name} selected.`); }}><div className="wg-thumb" aria-hidden="true"><WallpaperArt wallpaper={wallpaper} format={format} /></div><span><b>{String(index + 1).padStart(2, "0")}</b><span>{wallpaper.name}</span>{selected === index ? <Icon name="check" size={16} /> : null}</span></Button>)}</div>
      </section>
    </div>
    <nav className="wg-mobile-nav" aria-label="Wallpaper workspace">{([['preview', 'Preview', 'image'], ['direction', 'Direction', 'sliders']] as const).map(([value, label, icon]) => <Button key={value} variant="ghost" data-mobile-mode={value} aria-pressed={mobileView === value} onClick={() => setMobileView(value)}><Icon name={icon} size={16} />{label}</Button>)}</nav>
    <footer className="wg-footer"><span role="status">{status}</span><span>Local generator</span></footer>
  </section>;
}
