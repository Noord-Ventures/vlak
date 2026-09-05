// Installs the packed tarballs into a throwaway project, the way a user
// gets them from npm, and exercises every public surface:
//
//   - @noorddev/vlak: tokens, registry, the CSS export, the props JSON
//   - @noorddev/vlak-react: server render of components with no compiler,
//     the stylesheet, per-component entries, the .stylex token file
//   - @noorddev/vlak-cli: init + add from the tarball, offline
//   - publint and are-the-types-wrong on each tarball
//
// Run after `pnpm build`. Needs network for react/react-dom.
import { execFileSync, execSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const work = mkdtempSync(join(tmpdir(), "vlak-smoke-"));
const run = (cmd, cwd = work) => execSync(cmd, { cwd, stdio: "pipe", encoding: "utf8" });
const log = (msg) => console.log(`[smoke] ${msg}`);
const expectedCatalogueSize = 114;
const additions = [
  ["number-field", "NumberField"], ["range-slider", "RangeSlider"], ["multi-select", "MultiSelect"], ["tag-input", "TagInput"], ["date-range-picker", "DateRangePicker"],
  ["time-field", "TimeField"], ["file-upload", "FileUpload"], ["transfer-list", "TransferList"], ["inline-edit", "InlineEdit"], ["rating", "Rating"],
  ["description-list", "DescriptionList"], ["metric", "Metric"], ["activity-timeline", "ActivityTimeline"], ["code-block", "CodeBlock"], ["json-viewer", "JSONViewer"],
  ["diff-viewer", "DiffViewer"], ["error-summary", "ErrorSummary"], ["notification-center", "NotificationCenter"], ["task-progress", "TaskProgress"], ["connection-status", "ConnectionStatus"],
  ["tree-view", "TreeView"], ["toolbar", "Toolbar"], ["bottom-navigation", "BottomNavigation"], ["overflow-list", "OverflowList"], ["filter-bar", "FilterBar"],
  ["query-builder", "QueryBuilder"], ["sortable-list", "SortableList"], ["virtual-list", "VirtualList"], ["master-detail", "MasterDetail"], ["property-grid", "PropertyGrid"],
  ["playback-controls", "PlaybackControls"], ["media-scrubber", "MediaScrubber"], ["media-player", "MediaPlayer"], ["waveform", "Waveform"], ["image-viewer", "ImageViewer"],
  ["canvas-controls", "CanvasControls"], ["message-composer", "MessageComposer"], ["file-browser", "FileBrowser"], ["kanban-board", "KanbanBoard"], ["scheduler", "Scheduler"],
];
// The same fixtures exercise the packed modules under both supported React majors.
const renderAdditions = `
const additions = ${JSON.stringify(additions)};
const fixtureProps = {
  NumberField: { label: "Count", defaultValue: 3 }, RangeSlider: { label: "Range" }, MultiSelect: { label: "Cities", options: [{ value: "a", label: "Alkmaar" }] }, TagInput: { label: "Tags" },
  TimeField: { label: "Time" }, TransferList: { options: [{ value: "a", label: "Alkmaar" }] },
  DescriptionList: { items: [{ id: "range", label: "Range", value: "386 km" }] }, Metric: { label: "Range", value: 386 },
  ActivityTimeline: { events: [{ id: "event", title: "Published", dateTime: "2026-09-06T09:00:00Z" }] }, CodeBlock: { code: "const count = 3;" }, JSONViewer: { data: { count: 3 } }, DiffViewer: { before: "before", after: "after" },
  ErrorSummary: { errors: [{ id: "email", message: "Enter an email" }] }, TaskProgress: { label: "Upload", state: "pending" }, ConnectionStatus: { state: "connected" },
  TreeView: { label: "Files", nodes: [{ id: "file", label: "Readme" }] }, Toolbar: { label: "Actions", actions: [] }, BottomNavigation: { items: [] }, OverflowList: { items: [] }, QueryBuilder: { fields: [] },
  VirtualList: { label: "Records", items: [] }, MasterDetail: { items: [] }, PropertyGrid: { fields: [] },
  MediaScrubber: { duration: 60 }, MediaPlayer: { src: "/recording.mp3", label: "Recording" }, Waveform: { samples: [0.2, 0.6], duration: 60 }, ImageViewer: { images: [] },
  MessageComposer: { onSend() {} }, FileBrowser: { entries: [] }, KanbanBoard: { columns: [] }, Scheduler: { events: [], defaultView: "agenda", defaultValue: new Date("2026-09-06T00:00:00Z"), timeZone: "UTC" },
};
let additionHtml = "";
for (const [name, exported] of additions) {
  if (!R[exported]) throw new Error("Missing root export: " + exported);
  const leaf = await import("@noorddev/vlak-react/components/" + name);
  if (leaf[exported] !== R[exported]) throw new Error("Mismatched leaf export: " + exported);
  const markup = renderToString(h(R[exported], fixtureProps[exported] ?? {}));
  if (!markup.includes("rs-")) throw new Error("Empty or unstyled SSR: " + exported);
  additionHtml += markup;
}
console.log("  ✓ all " + additions.length + " new root/leaf exports render, " + additionHtml.length + " chars");
`;

function sourceFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? sourceFiles(join(dir, entry.name)) : /\.(ts|tsx)$/.test(entry.name) ? [join(dir, entry.name)] : []);
}

try {
  /* 1. Pack. */
  const tarballs = {};
  for (const pkg of ["core", "react", "cli"]) {
    const out = run(`pnpm pack --pack-destination ${work}`, join(root, "packages", pkg)).trim().split("\n").pop();
    tarballs[pkg] = out;
    log(`packed ${pkg}: ${out.split("/").pop()}`);
  }

  /* 2. publint + are-the-types-wrong. */
  for (const [pkg, file] of Object.entries(tarballs)) {
    run(`npx publint ${file}`, root);
    if (pkg !== "cli") run(`npx attw ${file} --profile esm-only`, root);
    log(`${pkg}: publint and attw clean`);
  }

  /* 3. A consumer project. */
  writeFileSync(join(work, "package.json"), JSON.stringify({ name: "consumer", private: true, type: "module" }, null, 2));
  run(`npm install --no-audit --no-fund --silent react@19 react-dom@19 ${tarballs.core} ${tarballs.react} ${tarballs.cli}`);
  log("installed into a consumer project");

  writeFileSync(
    join(work, "render.mjs"),
    `
import { renderToString } from "react-dom/server";
import { createElement as h } from "react";
import { vlakTokens, catalogComponents } from "@noorddev/vlak";
import props from "@noorddev/vlak/props" with { type: "json" };
import * as vlak from "@noorddev/vlak-react";
import { Button } from "@noorddev/vlak-react/components/button";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const checks = [];
checks.push(["tokens", vlakTokens.color.light.paper === "#FAF8F2"]);
checks.push(["catalogue", catalogComponents.length === ${expectedCatalogueSize}]);
checks.push(["props json", typeof props.components === "object"]);
const R = vlak;
${renderAdditions}
checks.push(["new component props", additions.every(([name, exported]) => props.components[name]?.exports.some(entry => entry.name === exported))]);
const html = renderToString(h("div", null,
  h(Button, null, "Hi"),
  h(vlak.Dialog, { open: false, onClose() {} }, h(vlak.DialogTitle, null, "T")),
  h(vlak.Select, { options: [{ value: "a", label: "A" }], value: "a", onValueChange() {} }),
  h(vlak.Tabs, { defaultValue: "a" }, h(vlak.TabList, null, h(vlak.Tab, { value: "a" }, "A")), h(vlak.TabPanel, { value: "a" }, "P")),
  h(vlak.LineChart, { series: [{ name: "Sheets", values: [1, 2, 3] }], labels: ["Mon", "Tue", "Wed"] }),
));
checks.push(["ssr renders", html.includes("rs-btn-primary")]);
checks.push(["css export", require.resolve("@noorddev/vlak/css").endsWith("vlak.css")]);
checks.push(["react css export", require.resolve("@noorddev/vlak-react/css").endsWith("vlak-react.css")]);
checks.push(["runtime tokens are var()", String(vlak.vlak.ink).startsWith("var(--") && vlak.phone.startsWith("@media")]);
/* The .stylex file is for a consumer's StyleX compiler and must stay uncompiled; it is never imported at runtime. */
checks.push(["stylex token file is uncompiled", (await import("node:fs")).readFileSync(require.resolve("@noorddev/vlak-react/tokens.stylex"), "utf8").includes("defineVars(")]);
const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log((ok ? "  ✓ " : "  ✗ ") + name);
if (failed.length) process.exit(1);
`,
  );
  const out = run("node render.mjs");
  process.stdout.write(out);

  /* 3b. React 18: the peer range allows it, so every export must render there too,
     with no unknown-prop warnings (popoverTarget and inert are spelled per version). */
  const r18 = join(work, "r18");
  run(`mkdir -p ${r18}`);
  writeFileSync(join(r18, "package.json"), JSON.stringify({ name: "consumer-r18", private: true, type: "module" }, null, 2));
  run(`npm install --no-audit --no-fund --silent react@18 react-dom@18 ${tarballs.core} ${tarballs.react}`, r18);
  writeFileSync(
    join(r18, "render.mjs"),
    `
import { renderToString } from "react-dom/server";
import { createElement as h } from "react";
import * as R from "@noorddev/vlak-react";
const warnings = new Set();
console.error = (...a) => { let i = 1; warnings.add(String(a[0]).replace(/%s/g, () => String(a[i++])).slice(0, 120)); };
${renderAdditions}
const html = renderToString(h("div", null,
  h(R.Popover, { trigger: "More" }, h(R.PopoverBody, null, "Body")),
  h(R.CrumbBar, { trail: [{ label: "Docs", href: "#" }, { label: "Here" }] }),
  h(R.Dialog, { open: true, onClose() {} }, h(R.DialogTitle, null, "T"), h(R.DialogBody, null, "B")),
  h(R.Select, { options: [{ value: "a", label: "A" }], value: "a", "aria-label": "Pick" }),
  h(R.Tabs, { defaultValue: "a" }, h(R.TabList, null, h(R.Tab, { value: "a" }, "A")), h(R.TabPanel, { value: "a" }, "P")),
  h(R.Button, null, "Go"),
));
const bad = [...warnings].filter((w) => /does not recognize|non-boolean attribute|Invalid DOM property|Each child in a list/.test(w));
console.log("  " + (bad.length ? "✗" : "✓") + " react 18 renders " + html.length + " chars, " + bad.length + " prop warnings");
for (const w of bad) console.log("    " + w);
if (!html.includes("popovertarget=")) { console.log("    ✗ popovertarget attribute missing on React 18"); process.exit(1); }
if (bad.length) process.exit(1);
`,
  );
  process.stdout.write(run("node render.mjs", r18));
  log("react 18 render clean");

  /* 4. The CLI from its tarball, offline. */
  const app = join(work, "app");
  run(`mkdir -p ${app}`);
  run("npx vlak init", app);
  run(`npx vlak add button dialog bar-chart ${additions.map(([name]) => name).join(" ")}`, app);
  for (const f of ["styles/vlak.css", "styles/fonts/inter/OFL.txt", "index.html", "vlak.json", "components/vlak/button.tsx", "components/vlak/dialog.tsx", "components/vlak/charts/bar.tsx", "components/vlak/rs.ts", "components/vlak/use-input-value.ts", "components/vlak/use-overlay-position.ts", "components/vlak/merge-refs.ts"]) {
    if (!existsSync(join(app, f))) throw new Error(`cli: expected ${f}`);
  }
  const listed = JSON.parse(run("npx vlak list --json", app));
  if (!Array.isArray(listed) || listed.length !== expectedCatalogueSize) throw new Error(`cli: expected ${expectedCatalogueSize} public entries, got ${listed.length}`);
  const installedCss = readFileSync(join(app, "styles", "vlak.css"), "utf8");
  for (const [name, exported] of additions) {
    const file = join(app, "components", "vlak", `${name}.tsx`);
    if (!existsSync(file)) throw new Error(`cli: missing ${name} source`);
    if (!new RegExp(`export (?:const|function|class) ${exported}\\b`).test(readFileSync(file, "utf8"))) throw new Error(`cli: missing ${exported} source export`);
    if (!listed.some(item => item.name === name)) throw new Error(`cli: missing ${name} catalogue entry`);
    // CLI init ships the complete CSS-first stylesheet; add vendors source only.
    if (!installedCss.includes(`.rs-${name}`)) throw new Error(`cli: missing ${name} styles in vlak.css`);
  }
  const vendored = sourceFiles(join(app, "components", "vlak"));
  for (const file of vendored) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(/(?:from\s*|import\s*\()(["'])(\.[^"']+)\1/g)) {
      const target = resolve(dirname(file), match[2]);
      if (![target, `${target}.ts`, `${target}.tsx`, join(target, "index.ts"), join(target, "index.tsx")].some(candidate => existsSync(candidate))) throw new Error(`cli: unresolved ${match[2]} in ${file}`);
    }
    if (/from\s*["']@noorddev\/vlak-react/.test(source)) throw new Error(`cli: vendored source leaked a package dependency in ${file}`);
  }
  log(`cli: all 40 additions present, ${vendored.length} source files have complete relative import closure`);
  log(`cli: init + add wrote the tree, list --json has ${listed.length} entries`);

  log("ok");
} finally {
  rmSync(work, { recursive: true, force: true });
}
