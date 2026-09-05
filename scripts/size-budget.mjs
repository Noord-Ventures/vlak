// Size budget for the shipped artifacts. Fails when a file exceeds its
// gzipped budget so a regression shows up in the pull request, not in a
// user's bundle analyzer. Budgets are deliberate: raise them in the same
// change that explains why.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const gz = (buf) => gzipSync(buf, { level: 9 }).length;
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

/* [label, path or directory + filter, gzipped budget in bytes] */
const budgets = [
  // The 40-component expansion increases the whole-catalog artifacts. Keep
  // the existing Button and atomic CSS budgets, and add leaf-specific caps
  // so growth in the catalog cannot hide a regression in a common control.
  ["@noorddev/vlak css/vlak.css", "packages/core/css/vlak.css", 24 * 1024],
  ["@noorddev/vlak-react dist/vlak-react.css", "packages/react/dist/vlak-react.css", 16 * 1024],
  ["@noorddev/vlak-react dist/**/*.js (every component, bundled)", ["packages/react/dist", /\.js$/], 136 * 1024],
  ["@noorddev/vlak-react components/button.js", "packages/react/dist/components/button.js", 4 * 1024],
  ["@noorddev/vlak-react components/number-field.js", "packages/react/dist/components/number-field.js", 3 * 1024],
  ["@noorddev/vlak-react components/playback-controls.js", "packages/react/dist/components/playback-controls.js", 2 * 1024],
  ["@noorddev/vlak-react components/virtual-list.js", "packages/react/dist/components/virtual-list.js", 3 * 1024],
  ["@noorddev/vlak-react components/query-builder.js", "packages/react/dist/components/query-builder.js", 4 * 1024],
  ["@noorddev/vlak-react components/media-player.js", "packages/react/dist/components/media-player.js", 5 * 1024],
  ["@noorddev/vlak-react components/scheduler.js", "packages/react/dist/components/scheduler.js", 6 * 1024],
  ["@noorddev/vlak-react components/file-upload.js", "packages/react/dist/components/file-upload.js", 5 * 1024],
  ["@noorddev/vlak-cli dist/index.js (bundles the typed registry for list/search)", "packages/cli/dist/index.js", 64 * 1024],
];

let failed = false;
const rows = [];
for (const [label, target, budget] of budgets) {
  let size;
  if (Array.isArray(target)) {
    const [dir, re] = target;
    /* Concatenated then gzipped once: what a bundler would ship if every component were used. */
    size = gz(Buffer.concat(walk(join(root, dir)).filter((f) => re.test(f)).sort().map((f) => readFileSync(f))));
  } else {
    size = gz(readFileSync(join(root, target)));
  }
  const over = size > budget;
  if (over) failed = true;
  rows.push(`${over ? "✗" : "✓"} ${label.padEnd(56)} ${kb(size).padStart(9)} gz  (budget ${kb(budget)})`);
}
console.log(rows.join("\n"));
if (failed) {
  console.error("\nSize budget exceeded.");
  process.exit(1);
}
