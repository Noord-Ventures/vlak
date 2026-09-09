import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const engineImport = '@import "@xyflow/react/dist/base.css" layer(vlak.engine);';

/** Flatten the engine layer before CSS loaders can reinterpret import-layer syntax as a media query. */
export function workflowStylesheet() {
  const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../src/workflow.css"), "utf8");
  if (!source.includes(engineImport)) throw new Error("workflow.css must declare the React Flow engine layer.");
  const packageDir = dirname(require.resolve("@xyflow/react/package.json"));
  const { version } = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8"));
  let engine = readFileSync(require.resolve("@xyflow/react/dist/base.css"), "utf8");
  if (/^\s*@(?:import|charset)\b/m.test(engine)) throw new Error("React Flow base styles contain an import or charset that cannot be nested in a layer.");
  // The engine has no attribution text token. Expose one so palette ownership stays in the StyleX leaf.
  const attributionColor = /(\.react-flow__attribution a\s*\{[^}]*\bcolor:\s*)#999(;)/g;
  if ([...engine.matchAll(attributionColor)].length !== 1) throw new Error("React Flow attribution styles changed; review the palette compatibility rule.");
  engine = engine.replace(attributionColor, "$1var(--xy-attribution-color, #999)$2");
  const license = readFileSync(join(packageDir, "LICENSE"), "utf8").trim();
  const attribution = `/*! @xyflow/react ${version} — https://reactflow.dev\n${license}\n*/`;
  return source.replace(engineImport, () => `${attribution}\n@layer vlak.engine {\n${engine}\n}`);
}
