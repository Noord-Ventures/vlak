// Every catalog name owns one Use file. No shared dump.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const examples = join(root, "apps/www/components/examples");
const registry = readFileSync(join(root, "packages/core/src/registry.ts"), "utf8");
const registrySources = [registry, ...[...registry.matchAll(/from "\.\/(registry-[a-z-]+\.ts)"/g)]
  .map((match) => readFileSync(join(root, "packages/core/src", match[1]), "utf8"))];
const names = registrySources.flatMap((source) => [...source.matchAll(/^\s+(?:name|"name"):\s+"([a-z0-9-]+)"/gm)].map((match) => match[1]));

if (names.length === 0) {
  console.error("No component names found in registry.ts");
  process.exit(1);
}

const missing = names.filter((name) => !existsSync(join(examples, name, "use.tsx")));
const dirs = readdirSync(examples, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);
const extras = dirs.filter((d) => !names.includes(d));

if (missing.length) {
  console.error("Missing Use file:\n" + missing.map((n) => `  ${n}`).join("\n"));
  process.exit(1);
}
if (extras.length) {
  console.error("Orphan Use folders:\n" + extras.map((n) => `  ${n}`).join("\n"));
  process.exit(1);
}

const slot = readFileSync(join(examples, "use-slot.tsx"), "utf8");
const mappings = slot + (slot.includes("additions[name]") ? readFileSync(join(examples, "additions.tsx"), "utf8") : "");
const unmapped = names.filter((name) => !mappings.includes(`"${name}"`) && !new RegExp(`(?:^|\\n)\\s+${name}:`, "m").test(mappings));
if (unmapped.length) {
  console.error("use-slot.tsx missing imports:\n" + unmapped.map((n) => `  ${n}`).join("\n"));
  process.exit(1);
}

const page = readFileSync(join(root, "apps/www/app/components/[name]/page.tsx"), "utf8");
const control = page.indexOf('<div className="preview-box">');
const scene = page.indexOf("<InAction");
if (control === -1 || scene === -1) {
  console.error("Component pages must show the control, then the in-action scene");
  process.exit(1);
}
if (scene < control) {
  console.error("The in-action scene must sit under the control, not above it");
  process.exit(1);
}

const catalog = readFileSync(join(root, "apps/www/app/components/page.tsx"), "utf8");
if (!catalog.includes("Preview") || catalog.includes("UseSlot") || catalog.includes("InAction")) {
  console.error("Catalog tiles must show the raw control, not a composed scene");
  process.exit(1);
}

const useCss = readFileSync(join(examples, "use.css"), "utf8");
const useSx = readFileSync(join(examples, "use.stylex.ts"), "utf8");
const site = readFileSync(join(root, "apps/www/app/site.css"), "utf8");
const sceneRule = useCss.slice(useCss.indexOf(".rs-scene {"), useCss.indexOf("}", useCss.indexOf(".rs-scene {")));
const useRule = useCss.slice(useCss.indexOf(".rs-use {"), useCss.indexOf("}", useCss.indexOf(".rs-use {")));
if (/border:\s*1px/.test(sceneRule) || /border:\s*1px/.test(useRule)) {
  console.error("In Action scene / Use field must not paint a second card around the control");
  process.exit(1);
}
if (/scene:\s*\{[^}]*borderWidth:\s*1/s.test(useSx) || /use:\s*\{[^}]*borderWidth:\s*1/s.test(useSx)) {
  console.error("StyleX scene / UseField must stay open (borderWidth 0)");
  process.exit(1);
}
if (site.includes(".rs-scene .rs-input-group") || site.includes(".rs-use .rs-input-group")) {
  console.error("Do not zero the leaf inside Use / In Action — the control keeps its hairline");
  process.exit(1);
}

console.log(`ok: ${names.length} isolated Use files`);
