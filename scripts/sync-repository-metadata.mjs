// Preview by default. GitHub writes require the explicit --apply flag.
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const metadata = JSON.parse(readFileSync(new URL("../.github/repository.json", import.meta.url), "utf8"));
const mode = process.argv[2];
if (process.argv.length > 3 || (mode && !["--check", "--apply"].includes(mode))) {
  throw new Error("Usage: node scripts/sync-repository-metadata.mjs [--check|--apply]");
}
if (mode === "--apply") {
  execFileSync("gh", ["repo", "edit", metadata.repository, "--description", metadata.description, "--homepage", metadata.homepage], { stdio: "inherit" });
  console.log(`Updated ${metadata.repository}`);
} else if (mode === "--check") {
  const live = JSON.parse(execFileSync("gh", ["api", `repos/${metadata.repository}`], { encoding: "utf8" }));
  const matches = live.description === metadata.description && live.homepage === metadata.homepage;
  console.log(matches ? "GitHub metadata matches." : "GitHub metadata differs from the staged description. Run with --apply when ready to publish it.");
  process.exitCode = matches ? 0 : 1;
} else {
  console.log(JSON.stringify(metadata, null, 2));
}
