/** A bounded acquisition plan, never an instrument command or acquisition record. */
export const PLAN_SCHEMA = "vlak.microscopy-plan";
export const PLAN_LIMITS = { bytes: 262144, positions: 128, channels: 16, steps: 16, axis: 64, frames: 16384, magnitude: 1e9 } as const;

export interface PlanPosition { id: string; name: string; x: number | null; y: number | null; z: number | null; enabled: boolean }
export interface PlanChannel { id: string; label: string }
export interface PlanStep { id: string; label: string; exposure: number | null; time: number | null; depth: number | null; channel: string | null }
export interface PlanAxis { start: number | null; step: number | null; count: number | null }
export interface MicroscopyPlan {
  schema: typeof PLAN_SCHEMA;
  version: 1;
  title: string;
  stage: { id: string; label: string };
  coordinateFrame: { id: string; label: string } | null;
  units: { x: "µm" | null; y: "µm" | null; z: "µm" | null };
  positions: PlanPosition[];
  channels: PlanChannel[];
  steps: PlanStep[];
  z: PlanAxis;
  t: PlanAxis;
}
export type PlanScreen = "positions" | "sequence" | "stack" | "review";
export interface PlanIssue { path: string; message: string; screen: PlanScreen; positionId?: string }

export function initialPlan(): MicroscopyPlan {
  return {
    schema: PLAN_SCHEMA, version: 1, title: "Slide 07 · spatial survey",
    stage: { id: "example-stage", label: "Example stage" },
    coordinateFrame: { id: "slide-local", label: "Slide-local frame" },
    units: { x: "µm", y: "µm", z: "µm" },
    positions: [
      { id: "site-01", name: "Upper field", x: -240, y: 180, z: 0, enabled: true },
      { id: "site-02", name: "Center field", x: 0, y: 0, z: 2, enabled: true },
      { id: "site-03", name: "Lower field", x: 220, y: -160, z: -1, enabled: true },
    ],
    channels: [{ id: "transmitted", label: "Transmitted light" }, { id: "channel-a", label: "Channel A" }],
    steps: [
      { id: "capture-01", label: "Reference", exposure: 20, time: 0, depth: 0, channel: "transmitted" },
      { id: "capture-02", label: "Signal", exposure: 45, time: 0, depth: 0, channel: "channel-a" },
    ],
    z: { start: -2, step: 1, count: 5 }, t: { start: 0, step: 30, count: 4 },
  };
}

function object(value: unknown, keys: readonly string[], path: string): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${path}: expected an object.`);
  const record = value as Record<string, unknown>;
  const extra = Object.keys(record).find(key => !keys.includes(key));
  if (extra) throw new Error(`${path}.${extra}: unsupported field.`);
  for (const key of keys) if (!Object.hasOwn(record, key)) throw new Error(`${path}.${key}: field is required; use null for an unknown value.`);
  return record;
}
function text(value: unknown, path: string, id = false): string {
  if (typeof value !== "string" || value.length > (id ? 64 : 96) || (id && (!value.trim() || value !== value.trim()))) throw new Error(`${path}: expected ${id ? "a nonblank identifier of at most 64" : "text of at most 96"} characters.`);
  return value;
}
function number(value: unknown, path: string, minimum = -PLAN_LIMITS.magnitude): number | null {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value) || value < minimum || value > PLAN_LIMITS.magnitude) throw new Error(`${path}: expected null or a finite number between ${minimum} and ${PLAN_LIMITS.magnitude}.`);
  return value;
}
function list<T>(value: unknown, max: number, path: string, parse: (value: unknown, path: string) => T): T[] {
  if (!Array.isArray(value) || value.length > max) throw new Error(`${path}: expected a list with at most ${max} records.`);
  return value.map((entry, index) => parse(entry, `${path}[${index}]`));
}
function identity(value: unknown, path: string) {
  const entry = object(value, ["id", "label"], path);
  return { id: text(entry.id, `${path}.id`, true), label: text(entry.label, `${path}.label`) };
}
function axis(value: unknown, path: string, time = false): PlanAxis {
  const entry = object(value, ["start", "step", "count"], path);
  const count = number(entry.count, `${path}.count`, 1);
  if (count !== null && (!Number.isInteger(count) || count > PLAN_LIMITS.axis)) throw new Error(`${path}.count: expected null or an integer from 1 to ${PLAN_LIMITS.axis}.`);
  return { start: number(entry.start, `${path}.start`, time ? 0 : undefined), step: number(entry.step, `${path}.step`, time ? 0 : undefined), count };
}
function unique(entries: readonly { id: string }[], path: string) {
  if (new Set(entries.map(entry => entry.id)).size !== entries.length) throw new Error(`${path}: identifiers must be unique.`);
}

/** Validate and reconstruct allowlisted primitives; imported runtime state is rejected. */
export function parsePlan(source: string): MicroscopyPlan {
  if (new TextEncoder().encode(source).length > PLAN_LIMITS.bytes) throw new Error("File exceeds the 256 KiB limit.");
  let decoded: unknown;
  try { decoded = JSON.parse(source); } catch { throw new Error("File is not valid JSON. The working plan has not changed."); }
  const entry = object(decoded, ["schema", "version", "title", "stage", "coordinateFrame", "units", "positions", "channels", "steps", "z", "t"], "plan");
  if (entry.schema !== PLAN_SCHEMA || entry.version !== 1) throw new Error(`Expected schema ${PLAN_SCHEMA}, version 1.`);
  const rawUnits = object(entry.units, ["x", "y", "z"], "units");
  const unit = (value: unknown, path: string): "µm" | null => {
    if (value !== null && value !== "µm") throw new Error(`${path}: expected µm or null. This format does not convert units.`);
    return value;
  };
  const plan: MicroscopyPlan = {
    schema: PLAN_SCHEMA, version: 1, title: text(entry.title, "title"), stage: identity(entry.stage, "stage"),
    coordinateFrame: entry.coordinateFrame === null ? null : identity(entry.coordinateFrame, "coordinateFrame"),
    units: { x: unit(rawUnits.x, "units.x"), y: unit(rawUnits.y, "units.y"), z: unit(rawUnits.z, "units.z") },
    positions: list(entry.positions, PLAN_LIMITS.positions, "positions", (value, path) => {
      const row = object(value, ["id", "name", "x", "y", "z", "enabled"], path);
      if (typeof row.enabled !== "boolean") throw new Error(`${path}.enabled: expected true or false.`);
      return { id: text(row.id, `${path}.id`, true), name: text(row.name, `${path}.name`), x: number(row.x, `${path}.x`), y: number(row.y, `${path}.y`), z: number(row.z, `${path}.z`), enabled: row.enabled };
    }),
    channels: list(entry.channels, PLAN_LIMITS.channels, "channels", identity),
    steps: list(entry.steps, PLAN_LIMITS.steps, "steps", (value, path) => {
      const row = object(value, ["id", "label", "exposure", "time", "depth", "channel"], path);
      return { id: text(row.id, `${path}.id`, true), label: text(row.label, `${path}.label`), exposure: number(row.exposure, `${path}.exposure`, 0), time: number(row.time, `${path}.time`, 0), depth: number(row.depth, `${path}.depth`), channel: row.channel === null ? null : text(row.channel, `${path}.channel`, true) };
    }),
    z: axis(entry.z, "z"), t: axis(entry.t, "t", true),
  };
  unique(plan.positions, "positions"); unique(plan.channels, "channels"); unique(plan.steps, "steps");
  for (const step of plan.steps) if (step.channel !== null && !plan.channels.some(channel => channel.id === step.channel)) throw new Error(`steps.${step.id}.channel: channel does not exist in this plan.`);
  const count = frameCount(plan);
  if (count !== null && count > PLAN_LIMITS.frames) throw new Error(`Plan projects ${count} frames; the local limit is ${PLAN_LIMITS.frames}.`);
  return plan;
}

export function serializePlan(plan: MicroscopyPlan): string {
  const source = JSON.stringify(plan, (_key, value) => {
    if (typeof value === "number" && !Number.isFinite(value)) throw new Error("Nonfinite numbers cannot be exported; use null for unknown values.");
    return value;
  });
  return `${JSON.stringify(parsePlan(source), null, 2)}\n`;
}
export function axisValue(axis: PlanAxis, index: number | null): number | null {
  if (index === null || axis.start === null || axis.step === null || axis.count === null || !Number.isInteger(index) || index < 0 || index >= axis.count) return null;
  const value = axis.start + axis.step * index;
  return Number.isFinite(value) ? value : null;
}
export function frameCount(plan: MicroscopyPlan): number | null {
  if ([plan.z.count, plan.t.count].some(count => count === null || !Number.isInteger(count) || count < 1 || count > PLAN_LIMITS.axis)) return null;
  const count = plan.positions.filter(position => position.enabled).length * plan.steps.length * plan.z.count! * plan.t.count!;
  return Number.isSafeInteger(count) ? count : null;
}
export function reviewPlan(plan: MicroscopyPlan): { issues: PlanIssue[]; frames: number | null; exposureMs: number | null } {
  const issues: PlanIssue[] = [];
  const add = (path: string, message: string, screen: PlanScreen, positionId?: string) => { if (!issues.some(issue => issue.path === path)) issues.push({ path, message, screen, positionId }); };
  if (!plan.title.trim()) add("title", "Name the plan.", "review");
  if (!plan.coordinateFrame) add("coordinateFrame", "Supply a named coordinate frame.", "positions");
  else if (!plan.coordinateFrame.label.trim()) add("coordinateFrame.label", "Name the coordinate frame.", "positions");
  if (!plan.stage.label.trim()) add("stage", "Supply a stage label.", "positions");
  for (const key of ["x", "y", "z"] as const) if (!plan.units[key]) add(`units.${key}`, `Supply the ${key.toUpperCase()} coordinate unit.`, "positions");
  const enabled = plan.positions.filter(position => position.enabled);
  if (!enabled.length) add("positions", "Include at least one stage position.", "positions");
  for (const position of enabled) {
    if (!position.name.trim()) add(`positions.${position.id}.name`, `Name position ${position.id}.`, "positions", position.id);
    for (const key of ["x", "y", "z"] as const) if (position[key] === null || !Number.isFinite(position[key]) || Math.abs(position[key]!) > PLAN_LIMITS.magnitude) add(`positions.${position.id}.${key}`, `${position.name || position.id}: supply the ${key.toUpperCase()} coordinate within the file format limit.`, "positions", position.id);
  }
  if (!plan.steps.length) add("steps", "Add at least one capture step.", "sequence");
  for (const step of plan.steps) {
    if (!step.label.trim()) add(`steps.${step.id}.label`, `Name capture step ${step.id}.`, "sequence");
    const channel = plan.channels.find(channel => channel.id === step.channel);
    if (!channel) add(`steps.${step.id}.channel`, `${step.label || step.id}: choose a named channel.`, "sequence");
    else if (!channel.label.trim()) add(`channels.${channel.id}.label`, `Name channel ${channel.id}.`, "sequence");
    for (const key of ["exposure", "time", "depth"] as const) if (step[key] === null || !Number.isFinite(step[key]) || Math.abs(step[key]!) > PLAN_LIMITS.magnitude || (key !== "depth" && step[key]! < 0)) add(`steps.${step.id}.${key}`, `${step.label || step.id}: supply ${key === "time" ? "a nonnegative time offset" : key === "exposure" ? "a nonnegative exposure" : "a depth offset"} within the file format limit.`, "sequence");
  }
  for (const key of ["z", "t"] as const) {
    const value = plan[key];
    const name = key === "z" ? "Depth" : "Time";
    if (value.count === null || !Number.isInteger(value.count) || value.count < 1 || value.count > PLAN_LIMITS.axis) add(`${key}.count`, `${name}: supply an integer count from 1 to ${PLAN_LIMITS.axis}.`, "stack");
    for (const part of ["start", "step"] as const) if (value[part] === null || !Number.isFinite(value[part]) || Math.abs(value[part]!) > PLAN_LIMITS.magnitude || (key === "t" && value[part]! < 0)) add(`${key}.${part}`, `${name}: supply ${part === "start" ? "a start offset" : "an interval"}${key === "t" ? " of zero or more" : ""} within the file format limit.`, "stack");
  }
  const frames = frameCount(plan);
  if (frames !== null && frames > PLAN_LIMITS.frames) add("frames", `Reduce the plan below ${PLAN_LIMITS.frames.toLocaleString("en-US")} frames.`, "stack");
  const exposures = plan.steps.every(step => step.exposure !== null && Number.isFinite(step.exposure) && step.exposure >= 0);
  const sum = exposures ? plan.steps.reduce((total, step) => total + step.exposure!, 0) : null;
  const exposureMs = sum !== null && frames !== null ? sum * enabled.length * plan.z.count! * plan.t.count! : null;
  return { issues, frames, exposureMs: exposureMs !== null && Number.isFinite(exposureMs) ? exposureMs : null };
}

export function previewFrame(plan: MicroscopyPlan, selection: { position: number | null; z: number | null; t: number | null; step: number | null }) {
  const position = selection.position === null ? undefined : plan.positions.filter(item => item.enabled)[selection.position];
  const step = selection.step === null ? undefined : plan.steps[selection.step];
  const z = axisValue(plan.z, selection.z);
  const t = axisValue(plan.t, selection.t);
  return {
    position, step,
    x: position?.x ?? null, y: position?.y ?? null,
    z: plan.units.z === "µm" && position?.z != null && z !== null && step?.depth != null ? position.z + z + step.depth : null,
    time: t !== null && step?.time != null ? t + step.time : null,
    channel: plan.channels.find(channel => channel.id === step?.channel)?.label ?? null,
    status: "Not acquired" as const,
  };
}

export function formatNumber(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "Not supplied";
  return Number.isInteger(value) ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value) : String(value);
}
