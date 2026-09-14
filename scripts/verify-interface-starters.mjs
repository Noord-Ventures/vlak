import assert from "node:assert/strict";
import { execFile, execFileSync } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { interfaceStarters } from "../apps/www/app/starters/catalog.ts";
import { buildInterfaceStarters, starterPackageVersion } from "./build-interface-starters.mjs";
import { checkRelease, releasePackages } from "./check-release.mjs";
import { builtFiles, compareManifest, comparePayload, tarFiles } from "./check-published-release.mjs";

const smoke = process.argv.slice(2).includes("--smoke");
const args = process.argv.slice(2).filter(argument => argument !== "--smoke");
if (args.length && !(args.length === 1 && ["--candidate", "--registry"].includes(args[0])) && !(args.length === 2 && args[0] === "--candidate-dir" && isAbsolute(args[1]))) throw new Error("Usage: verify-interface-starters.mjs [--registry | --candidate | --candidate-dir /absolute/tarball/directory] [--smoke]");
const candidate = args[0] !== "--registry";
const root = fileURLToPath(new URL("../", import.meta.url));
checkRelease({ root, generated: true });
const work = mkdtempSync(join(tmpdir(), "vlak-interface-starters-"));
const archives = join(work, "archives"), output = join(work, "projects");
buildInterfaceStarters(archives);
mkdirSync(output);
const packages = ["@noorddev/vlak", "@noorddev/vlak-react"];
let tarballs;
let candidateFiles;
function verifyCandidatePayloads() {
  for (let index = 0; index < packages.length; index++) {
    const definition = releasePackages.find(item => item.name === packages[index]);
    const local = JSON.parse(readFileSync(join(root, "packages", definition.directory, "package.json"), "utf8"));
    const packed = JSON.parse(candidateFiles[index].get("package.json").toString());
    compareManifest(local, packed, starterPackageVersion);
    if (definition.directory === "core") assert.equal(JSON.parse(candidateFiles[index].get("props/props.json").toString()).version, starterPackageVersion, "Candidate core props are stale; rebuild before packing");
    comparePayload(builtFiles(join(root, "packages", definition.directory), definition.payload), candidateFiles[index], definition.payload, `${definition.name} candidate`);
  }
}
if (candidate) {
  const directory = args[0] === "--candidate-dir" ? args[1] : join(work, "packages");
  if (args[0] !== "--candidate-dir") {
    mkdirSync(directory);
    for (const name of ["core", "react"]) execFileSync("pnpm", ["--dir", join(root, "packages", name), "pack", "--pack-destination", directory], { encoding: "utf8", stdio: "pipe" });
  }
  tarballs = packages.map(name => join(directory, `${name.slice(1).replace("/", "-")}-${starterPackageVersion}.tgz`));
  candidateFiles = [];
  for (let index = 0; index < tarballs.length; index++) {
    assert.ok(existsSync(tarballs[index]), `Missing release candidate tarball ${tarballs[index]}`);
    const files = tarFiles(readFileSync(tarballs[index]));
    candidateFiles.push(files);
    const packed = JSON.parse(files.get("package.json").toString());
    assert.equal(packed.name, packages[index]);
    assert.equal(packed.version, starterPackageVersion);
    assert.ok(!JSON.stringify(packed.dependencies ?? {}).includes("workspace:"), "Candidate tarballs must be packed with workspace dependencies resolved");
  }
  verifyCandidatePayloads();
  console.log(`Candidate verification for ${starterPackageVersion}. Download manifests remain pinned to npm; tarball overrides exist only in ${output}`);
} else {
  for (const name of packages) {
    const published = JSON.parse(execFileSync("npm", ["view", `${name}@${starterPackageVersion}`, "version", "--json"], { encoding: "utf8" }));
    assert.equal(published, starterPackageVersion);
  }
  console.log(`Registry verification for published Vlak ${starterPackageVersion}`);
}
console.log(`Standalone verification: ${output}`);
const runFile = promisify(execFile);
async function verifyStarter({ slug }) {
  execFileSync("unzip", ["-q", join(archives, `${slug}.zip`), "-d", output]);
  const cwd = join(output, `vlak-${slug}`), path = join(cwd, "package.json");
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  for (const name of packages) assert.equal(manifest.dependencies[name], starterPackageVersion);
  assert.ok(!existsSync(join(cwd, "vendor")), "Distributed starters must not contain vendored packages");
  if (candidate) {
    for (let index = 0; index < packages.length; index++) manifest.dependencies[packages[index]] = `file:${tarballs[index]}`;
    writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
  }
  for (const args of [["install", "--no-audit", "--no-fund", "--prefer-offline"], ["run", "typecheck"], ["run", "build"]]) {
    try {
      const { stdout: result } = await runFile("npm", args, { cwd, encoding: "utf8", maxBuffer: 16 * 1024 * 1024, timeout: 300_000 });
      console.log(`${slug}: npm ${args.join(" ")} passed`);
      if (args[1] === "build") console.log(result.split("\n").filter(line => line.startsWith("dist/")).join("\n"));
    } catch (error) {
      console.error(error.stdout?.toString(), error.stderr?.toString());
      throw error;
    }
  }
}
// Keep memory and package-registry pressure bounded while checking the whole
// catalogue. Collect failures so one study cannot hide problems in the rest.
const pending = [...interfaceStarters];
const failures = [];
await Promise.all(Array.from({ length: 2 }, async () => {
  while (pending.length) {
    const starter = pending.shift();
    try { await verifyStarter(starter); }
    catch (error) { failures.push(`${starter.slug}: ${error.message}`); }
  }
}));
assert.deepEqual(failures, [], `Starter verification failed. Projects kept at ${output}`);
if (candidate) {
  checkRelease({ root, generated: true });
  verifyCandidatePayloads();
  console.log("Candidate core/React manifests, props and runtime payloads still match the completed checkout build");
}
console.log(`All ${interfaceStarters.length} starters build in ${candidate ? "candidate" : "registry"} mode. Outputs kept at ${output}`);
if (smoke) {
  const { stdout } = await runFile(process.execPath, ["--experimental-strip-types", join(root, "scripts/smoke-interface-starters.mjs"), output, "/examples/vlak/"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024, timeout: 1_200_000 });
  console.log(stdout);
}
