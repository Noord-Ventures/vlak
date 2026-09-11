import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createExportServer } from "./serve-export.mjs";

const root = fileURLToPath(new URL("../out", import.meta.url));
const server = createExportServer({ root });
await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
const base = `http://127.0.0.1:${server.address().port}`;
try {
  for (const script of ["record-review-ui-e2e.mjs", "project-tools-e2e.mjs", "reconciliation-e2e.mjs", "creative-export-e2e.mjs"]) {
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [fileURLToPath(new URL(script, import.meta.url))], { stdio: "inherit", env: { ...process.env, BASE_URL: base } });
      child.on("error", reject);
      child.on("exit", code => code === 0 ? resolve() : reject(new Error(`${script} failed with ${code}`)));
    });
  }
} finally { await new Promise(resolve => server.close(resolve)); }
