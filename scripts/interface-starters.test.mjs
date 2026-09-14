import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { test } from "node:test";
import { interfaceStarters } from "../apps/www/app/starters/catalog.ts";
import { projectFiles, starterAssetSource, starterPackageVersion } from "./build-interface-starters.mjs";
import { packageName, transformStarterSource } from "./interface-starter-source.mjs";

test("AST includes static, lazy, type-only, re-exported and worker imports without matching comments", () => {
  const imports = [];
  const source = `import { thing } from '@/lib/thing';
import type { Scene } from 'three';
export { model } from './model';
type Lazy = import('./types').Lazy;
const view = import('./view').then(module => module.View);
const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
// import './not-an-import';
const text = "import './also-not-an-import'";`;
  const output = transformStarterSource({ filename: "fixture.ts", source, onImport: (name, info) => { imports.push([name, info.typeOnly]); return name === "@/lib/thing" ? "../../lib/thing.ts" : name; }, onAsset: value => value });
  assert.deepEqual(imports, [["@/lib/thing", false], ["three", true], ["./model", false], ["./types", true], ["./view", false], ["./worker.ts", false]]);
  assert(output.includes('from "../../lib/thing.ts"'));
  assert(output.includes("// import './not-an-import'"));
});

test("JSX, data, model, directory and document URLs respect a nested Vite base", () => {
  const assets = [];
  const source = `const data = { geometry: '/interfaces/model.glb', index: '/interfaces/lines.json', docs: '/docs/guide.md', root: '/interfaces/concepts/' };
const photo = <img src="/interfaces/photo.webp" />;
const mask = "url(/interfaces/mask.svg)";`;
  const output = transformStarterSource({ filename: "fixture.tsx", source, onImport: name => name, onAsset: value => { assets.push(value); return value; } });
  assert.deepEqual(assets, ["/interfaces/model.glb", "/interfaces/lines.json", "/docs/guide.md", "/interfaces/concepts/", "/interfaces/photo.webp", "/interfaces/mask.svg"]);
  assert(output.includes('src={import.meta.env.BASE_URL + "interfaces/photo.webp"}'));
  assert(output.includes('geometry: (import.meta.env.BASE_URL + "interfaces/model.glb")'));
  assert(output.includes('"url(" + import.meta.env.BASE_URL + "interfaces/mask.svg)"'));
});

test("CSS resources become local Vite imports; platform font downloads are removed", () => {
  const imports = [], assets = [];
  const output = transformStarterSource({ filename: "fixture.css", source: `@font-face { font-family: Roboto; src: url('/fonts/roboto.ttf'); }
@import './child.css';
.scene { background: url('/interfaces/photo.webp'); mask: url(./mask.svg); }`, onImport: value => { imports.push(value); return value; }, onAsset: value => { assets.push(value); return value.startsWith("/") ? `../../../public${value}` : value; } });
  assert.deepEqual(imports, ["./child.css"]);
  assert.deepEqual(assets, ["/interfaces/photo.webp", "./mask.svg"]);
  assert(!output.includes("@font-face"));
  assert(output.includes('url("../../../public/interfaces/photo.webp")'));
});

test("unknown module expressions, public asset expressions and Next env fail closed", () => {
  const transform = source => transformStarterSource({ filename: "fixture.ts", source, onImport: value => value, onAsset: value => value });
  assert.throws(() => transform("const lazy = import(path)"), /must be literal/);
  assert.throws(() => transform("const asset = `/interfaces/" + "${name}.glb`"), /portable adapter/);
  assert.throws(() => transform("const key = process.env.NEXT_PUBLIC_SECRET"), /adapted for Vite/);
  assert.throws(() => transform("const key = import.meta.env.VITE_UNDECLARED"), /Undeclared starter environment/);
  assert.equal(packageName("three/addons/controls/OrbitControls.js"), "three");
  assert.equal(packageName("@noorddev/vlak-react/components/icon"), "@noorddev/vlak-react");
});

test("virtual desktop filesystem paths are not website assets", () => {
  const source = 'const path = "/Documents/Welcome.txt"; const application = "/Applications/Calculator.app";';
  const output = transformStarterSource({ filename: "fixture.ts", source, onImport: value => value, onAsset: () => assert.fail("Virtual path must remain a data string") });
  assert.equal(output, source);
});

test("all interface starter definitions export coherent, portable projects", () => {
  const source = new URL("../apps/www/app/interfaces/", import.meta.url);
  const studies = readdirSync(source, { withFileTypes: true }).filter(entry => entry.isDirectory() && entry.name !== "mobile-os" && existsSync(new URL(`${entry.name}/page.tsx`, source))).map(entry => entry.name).sort();
  assert.deepEqual(interfaceStarters.map(starter => starter.slug).sort(), studies, "Every actual interface page has exactly one starter");
  assert.equal(interfaceStarters.length, 30, "Every current interface has a runnable starter");
  assert.equal(new Set(interfaceStarters.map(starter => starter.slug)).size, 30);
  for (const starter of interfaceStarters) {
    const files = projectFiles(starter), manifest = JSON.parse(files.get("package.json"));
    for (const name of ["@noorddev/vlak", "@noorddev/vlak-react"]) assert.equal(manifest.dependencies[name], starterPackageVersion, `${starter.slug}: exact release pin`);
    assert.equal(manifest.dependencies.next, undefined);
    assert(files.has(starter.edit), `${starter.slug}: first file to edit exists`);
    assert(files.has(".env.example"));
    assert(files.has("CREDITS.md"));
    assert(files.get(".gitignore").toString().includes("!.env.example"));
    assert(![...files.keys()].some(path => path.startsWith("vendor/") || path.includes("node_modules/")));
    for (const path of starter.credits ?? []) {
      assert(files.has(`public/${path}`), `${starter.slug}: missing credit ${path}`);
      assert(files.get("src/main.tsx").toString().includes(`href={import.meta.env.BASE_URL + ${JSON.stringify(path)}}`), `${starter.slug}: visible, base-aware credit link`);
    }
    for (const note of starter.networkNotes ?? []) assert(files.get("README.md").toString().includes(note));
    for (const variable of starter.env ?? []) {
      assert(files.get(".env.example").toString().includes(`${variable.name}=\n`));
      if (variable.prop) assert(files.get("src/main.tsx").toString().includes(`${variable.prop}={import.meta.env.${variable.name}}`));
    }
    for (const [path, content] of files) {
      if (path === "src/lib/site-analytics.ts") assert(!content.toString().includes("fetch("), "No telemetry in standalone exports");
      if (path.endsWith(".css")) assert(!content.toString().includes("@font-face"), "Native fonts do not require website font downloads");
    }
    assert(files.get("src/starter.css").toString().includes("height: 100svh"));
    assert(files.get("src/starter.css").toString().includes("container-type: inline-size"));
  }
});

test("bundled docs come from canonical release sources, not an ignored public copy", () => {
  const desktop = interfaceStarters.find(starter => starter.slug === "desktop-os");
  assert(desktop);
  const files = projectFiles(desktop);
  for (const path of ["docs/guide.md", "docs/tokens.md", "design.md"]) {
    const canonical = starterAssetSource(path);
    assert(!canonical.includes("/public/"));
    assert.deepEqual(files.get(`public/${path}`), readFileSync(canonical));
  }
  assert.throws(() => starterAssetSource("../package.json"), /relative and bounded/);
  assert.throws(() => starterAssetSource("interfaces/not-present.glb"), /ENOENT/);
});

test("undeclared packages and missing assets prevent exporting rather than silently breaking", () => {
  const base = interfaceStarters.find(starter => starter.slug === "line");
  assert.throws(() => projectFiles({ ...base, entry: "app/interfaces/concepts/drive-car.ts", styles: [], dependencies: {}, devDependencies: {} }), /Undeclared package import three/);
  assert.throws(() => projectFiles({ ...base, assets: ["interfaces/missing-model.glb"] }), /ENOENT/);
});
