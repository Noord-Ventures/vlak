// Copies the generated registry into public/r so the exported site
// serves it at /r/<name>.json — the URL the CLI docs and shadcn
// interop point at — and the generated docs into public/docs plus
// llms.txt and llms-full.txt at the root, for agents.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const src = fileURLToPath(new URL("../../../registry", import.meta.url));
const dest = fileURLToPath(new URL("../public/r", import.meta.url));

if (!existsSync(src)) {
  console.error("registry/ not found — run: pnpm --filter @noorddev/vlak build:registry");
  process.exit(1);
}
rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true, filter: (p) => !p.includes("/registry/docs") });
console.log("copied registry → public/r");

const docsSrc = fileURLToPath(new URL("../../../registry/docs", import.meta.url));
const docsDest = fileURLToPath(new URL("../public/docs", import.meta.url));
const publicDir = fileURLToPath(new URL("../public", import.meta.url));
const designSrc = fileURLToPath(new URL("../../../design.md", import.meta.url));
cpSync(designSrc, `${publicDir}/design.md`);
if (!existsSync(docsSrc)) {
  console.error("registry/docs not found — run: pnpm --filter @noorddev/vlak build:registry");
  process.exit(1);
}
rmSync(docsDest, { recursive: true, force: true });
mkdirSync(docsDest, { recursive: true });
for (const file of readdirSync(docsSrc)) {
  const text = readFileSync(`${docsSrc}/${file}`);
  if (file === "llms.txt" || file === "llms-full.txt") writeFileSync(`${publicDir}/${file}`, text);
  else writeFileSync(`${docsDest}/${file}`, text);
}
const propsSrc = fileURLToPath(new URL("../../../packages/core/props/props.json", import.meta.url));
if (!existsSync(propsSrc)) {
  console.error("props.json not found — run: pnpm --filter @noorddev/vlak build:props");
  process.exit(1);
}
writeFileSync(`${docsDest}/props.json`, readFileSync(propsSrc));
console.log("copied docs → public/docs, llms.txt, llms-full.txt");

const fontSrc = fileURLToPath(new URL("../../../packages/core/css/fonts/inter", import.meta.url));
const fontDest = fileURLToPath(new URL("../public/fonts/inter", import.meta.url));
if (!existsSync(fontSrc)) {
  console.error("Inter fonts not found — expected packages/core/css/fonts/inter");
  process.exit(1);
}
mkdirSync(fontDest, { recursive: true });
cpSync(fontSrc, fontDest, { recursive: true });
console.log("copied Inter fonts → public/fonts/inter");

const cssSrc = fileURLToPath(new URL("../../../packages/core/css/vlak.css", import.meta.url));
const cssDest = fileURLToPath(new URL("../public/vlak.css", import.meta.url));
if (!existsSync(cssSrc)) {
  console.error("vlak.css not found — run the core CSS build");
  process.exit(1);
}
writeFileSync(cssDest, readFileSync(cssSrc));
console.log("copied vlak.css → public/vlak.css");

// Sandboxed frames on protected previews cannot authenticate asset requests.
// Inline the canonical token sheet so the native example needs no subresources.
const calendarSrc = fileURLToPath(new URL("../components/widgets/calendar-demo.html", import.meta.url));
const tokenCssSrc = fileURLToPath(new URL("../../../packages/core/css/tokens.css", import.meta.url));
const widgetDest = fileURLToPath(new URL("../public/widgets", import.meta.url));
const calendarTokens = readFileSync(tokenCssSrc, "utf8")
  .replace('[data-theme="dark"]', ':root:has(#theme-dark:target)')
  .replace(':root:not([data-theme="light"])', ':root:not(:has(#theme-light:target))');
mkdirSync(widgetDest, { recursive: true });
writeFileSync(`${widgetDest}/calendar-demo.html`, "<!-- Generated from components/widgets/calendar-demo.html and Vlak tokens. Do not edit. -->\n"
  + readFileSync(calendarSrc, "utf8").replace("/* VLAK_TOKENS */", calendarTokens));
console.log("wrote self-contained calendar example → public/widgets/calendar-demo.html");

const starterSrc = fileURLToPath(new URL("../../../packages/cli/src/starter.html", import.meta.url));
const starterDest = fileURLToPath(new URL("../public/starter/index.html", import.meta.url));
if (!existsSync(starterSrc)) {
  console.error("CLI starter.html not found");
  process.exit(1);
}
mkdirSync(fileURLToPath(new URL("../public/starter", import.meta.url)), { recursive: true });
writeFileSync(starterDest, readFileSync(starterSrc, "utf8")
  .replaceAll("{{CSS_HREF}}", "/vlak.css")
  .replace("</head>", '<meta name="robots" content="noindex,follow">\n</head>'));
console.log("wrote starter specimen → public/starter/index.html");

// Authored service handoff templates are downloadable alongside the local brief.
const serviceSrc = fileURLToPath(new URL("../../../docs/services", import.meta.url));
const serviceDest = `${docsDest}/services`;
mkdirSync(serviceDest, { recursive: true });
cpSync(serviceSrc, serviceDest, { recursive: true });
