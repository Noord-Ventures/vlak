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
  // The 215-component catalog adds 39 AI entries: native chat, code and voice
  // controls plus four isolated optional-engine adapters. Engine code remains
  // external and is not imported by the root entry (verified by tarball smoke).
  // Measured: 34.7 KiB core CSS, 18.5 KiB atomic CSS, 275.8 KiB aggregate
  // component JS, and 138.5 KiB CLI metadata. Keep existing leaf caps intact.
  // Graph variables provide monochrome light/dark and forced-color engine paint.
  ["@noorddev/vlak css/vlak.css", "packages/core/css/vlak.css", 35 * 1024],
  ["@noorddev/vlak-react dist/vlak-react.css", "packages/react/dist/vlak-react.css", 18 * 1024 + 768],
  // Optional graph structure, including the upstream MIT license, is a separate import.
  ["@noorddev/vlak-react dist/workflow.css", "packages/react/dist/workflow.css", 3 * 1024 + 512],
  ["@noorddev/vlak-react dist/**/*.js (every component, bundled)", ["packages/react/dist", /\.js$/], 277 * 1024],
  ...["response-branch", "context-usage", "model-selector", "inline-citation", "sources", "open-in-chat", "mic-selector", "voice-selector", "transcription", "persona", "agent", "artifact", "commit", "environment-variables", "package-info", "schema-display", "snippet", "test-results", "terminal", "stack-trace", "sandbox", "web-preview", "jsx-preview", "shimmer", "plan", "task", "thought-steps", "checkpoint", "suggestions", "work-queue", "generated-image", "conversation-export", "response-editor"].map(name =>
    [`@noorddev/vlak-react components/${name}.js`, `packages/react/dist/components/${name}.js`, 3 * 1024]),
  // Native audio hydration samples metadata that can load before React attaches listeners: 3,117 bytes gz.
  ["@noorddev/vlak-react components/audio-player.js", "packages/react/dist/components/audio-player.js", 3 * 1024 + 128],
  ...["attachments", "speech-input", "highlighted-code", "workflow-canvas"].map(name =>
    [`@noorddev/vlak-react components/${name}.js`, `packages/react/dist/components/${name}.js`, 4 * 1024]),
  ["@noorddev/vlak-react components/response-markdown.js", "packages/react/dist/components/response-markdown.js", 6 * 1024],
  ...["chat", "conversation", "response", "reasoning", "tool-call", "confirmation", "widget"].map(name =>
    [`@noorddev/vlak-react components/${name}.js`, `packages/react/dist/components/${name}.js`, 3 * 1024]),
  // Response actions include clipboard feedback, browser speech, sharing, and async ratings.
  ["@noorddev/vlak-react components/response-actions.js", "packages/react/dist/components/response-actions.js", 5 * 1024],
  ["@noorddev/vlak-react components/calendar-popover.js", "packages/react/dist/components/calendar-popover.js", 5 * 1024 + 256],
  ["@noorddev/vlak-react components/button.js", "packages/react/dist/components/button.js", 4 * 1024],
  ["@noorddev/vlak-react components/number-field.js", "packages/react/dist/components/number-field.js", 3 * 1024],
  ["@noorddev/vlak-react components/playback-controls.js", "packages/react/dist/components/playback-controls.js", 2 * 1024],
  ["@noorddev/vlak-react components/virtual-list.js", "packages/react/dist/components/virtual-list.js", 3 * 1024],
  ["@noorddev/vlak-react components/query-builder.js", "packages/react/dist/components/query-builder.js", 4 * 1024],
  ["@noorddev/vlak-react components/media-player.js", "packages/react/dist/components/media-player.js", 5 * 1024],
  ["@noorddev/vlak-react components/scheduler.js", "packages/react/dist/components/scheduler.js", 6 * 1024],
  ["@noorddev/vlak-react components/file-upload.js", "packages/react/dist/components/file-upload.js", 5 * 1024],
  ...["health-metric", "reference-range", "lab-results", "symptom-diary", "check-in", "habit-tracker", "sleep-timeline", "activity-goal", "patient-banner", "medication-schedule", "appointment-card", "care-plan"].map(name =>
    [`@noorddev/vlak-react components/${name}.js`, `packages/react/dist/components/${name}.js`, 3 * 1024]),
  // Rings include first-view animation and visibility-aware encouragement controls.
  ["@noorddev/vlak-react components/activity-rings.js", "packages/react/dist/components/activity-rings.js", 5 * 1024],
  ...["identity-document", "tax-summary", "benefit-program", "application-status", "evidence-checklist", "measurement-value", "quantity-field", "experiment-run", "audio-meter", "channel-strip", "parameter-knob", "timecode-field", "clip-timeline", "render-queue", "layer-stack", "color-inspector", "spacing-control"].map(name =>
    [`@noorddev/vlak-react components/${name}.js`, `packages/react/dist/components/${name}.js`, 3 * 1024]),
  ...["well-plate", "spectrum-plot"].map(name =>
    [`@noorddev/vlak-react components/${name}.js`, `packages/react/dist/components/${name}.js`, 4 * 1024]),
  ...["assembly-variant-matrix", "coordinate-reference-field", "datum-transform-picker", "stack-navigator", "acquisition-sequencer", "coverage-inspector", "genomic-region-field", "alarm-panel", "work-offset-panel"].map(name =>
    [`@noorddev/vlak-react components/${name}.js`, `packages/react/dist/components/${name}.js`, 3 * 1024]),
  ...["raster-band-mixer", "patchbay", "kerning-pair-editor", "sequence-alignment", "design-rule-results"].map(name =>
    [`@noorddev/vlak-react components/${name}.js`, `packages/react/dist/components/${name}.js`, 4 * 1024]),
  // Native selection, inclusion, accepted-order focus recovery and coordinate validation.
  ["@noorddev/vlak-react components/stage-position-list.js", "packages/react/dist/components/stage-position-list.js", 4 * 1024],
  ...["joint-panel", "robot-pose", "robot-mission-queue", "pad-inspector", "colony-plate", "culture-log"].map(name =>
    [`@noorddev/vlak-react components/${name}.js`, `packages/react/dist/components/${name}.js`, 3 * 1024]),
  ["@noorddev/vlak-cli dist/index.js (bundles the typed registry for list/search)", "packages/cli/dist/index.js", 139 * 1024],
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
