// Builds everything the site needs from workspace sources, without
// shelling out to a package manager: deploy environments only need Node
// and an installed node_modules. Runs the core build (components → css →
// props → docs → registry → dist), the react build, then copies the
// registry, the docs, and fonts into public/.
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repo = (p) => fileURLToPath(new URL(`../../../${p}`, import.meta.url));
const run = (cmd, cwd) => {
  console.log(`[build-deps] ${cmd}  (${cwd})`);
  execSync(cmd, { cwd: repo(cwd), stdio: "inherit" });
};

run("node --experimental-strip-types scripts/build-components.mjs", "packages/core");
run("node --experimental-strip-types scripts/build.mjs", "packages/core");
run("node --experimental-strip-types scripts/build-props.mjs", "packages/core");
run("node --experimental-strip-types scripts/build-docs.mjs", "packages/core");
run("node --experimental-strip-types scripts/build-registry.mjs", "packages/core");
run("./node_modules/.bin/tsup", "packages/core");
run("node scripts/build.mjs", "packages/react");
// Production must never advertise APIs that users cannot install from npm.
// Local previews and CI can still verify an unpublished release candidate.
if (process.env.VERCEL_ENV === "production") {
  run("./node_modules/.bin/tsup", "packages/cli");
  run("node scripts/copy-fonts.mjs", "packages/cli");
  run("./node_modules/.bin/tsup", "packages/mcp");
  run("node scripts/copy-data.mjs", "packages/mcp");
  run("node scripts/check-release.mjs --generated", ".");
  run("node scripts/check-published-release.mjs", ".");
}
run("node scripts/copy-registry.mjs", "apps/www");
run("node --experimental-strip-types scripts/build-interface-starters.mjs", ".");
