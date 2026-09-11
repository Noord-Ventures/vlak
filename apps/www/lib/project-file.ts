/** Portable user documents. Domain validators own the payload and its migrations. */
export interface Project<T> {
  schema: "vlak.project";
  envelopeVersion: 1;
  kind: string;
  documentVersion: number;
  projectId: string;
  title: string;
  revision: string;
  parentRevision?: string;
  createdAt: string;
  updatedAt: string;
  appVersion: string;
  payload: T;
}

export const PROJECT_LIMIT = 8 * 1024 * 1024;
const fields = new Set(["schema", "envelopeVersion", "kind", "documentVersion", "projectId", "title", "revision", "parentRevision", "createdAt", "updatedAt", "appVersion", "payload"]);
export function projectObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected a project object.");
  return value as Record<string, unknown>;
}
export function projectText(value: unknown, name: string, max = 120): string {
  const control = typeof value === "string" && [...value].some(character => { const code = character.codePointAt(0) ?? 0; return code <= 31 || code === 127; });
  if (typeof value !== "string" || !value.trim() || value.length > max || control) throw new Error(`${name} must contain 1–${max} printable characters.`);
  return value;
}
function identifier(value: unknown, name: string): string {
  const text = projectText(value, name, 80);
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(text)) throw new Error(`Invalid ${name.toLocaleLowerCase()}.`);
  return text;
}
function stamp(value: unknown): string {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) throw new Error("Invalid project timestamp.");
  return value;
}
export function projectHeader(value: unknown): Project<unknown> {
  const item = projectObject(value);
  if (Object.keys(item).some(key => !fields.has(key))) throw new Error("This project contains unsupported fields.");
  if (item.schema !== "vlak.project" || item.envelopeVersion !== 1) throw new Error("This project format is not supported.");
  const kind = projectText(item.kind, "Project kind", 48);
  if (!/^[a-z][a-z0-9-]*$/.test(kind)) throw new Error("Invalid project kind.");
  if (!Number.isSafeInteger(item.documentVersion) || Number(item.documentVersion) < 1) throw new Error("Invalid document version.");
  if (!Object.hasOwn(item, "payload")) throw new Error("Project data is missing.");
  return {
    schema: "vlak.project", envelopeVersion: 1, kind, documentVersion: Number(item.documentVersion),
    projectId: identifier(item.projectId, "Project ID"), title: projectText(item.title, "Project title"),
    revision: identifier(item.revision, "Revision"),
    ...(item.parentRevision === undefined ? {} : { parentRevision: identifier(item.parentRevision, "Previous revision") }),
    createdAt: stamp(item.createdAt), updatedAt: stamp(item.updatedAt), appVersion: projectText(item.appVersion, "App version", 40), payload: item.payload,
  };
}
export function createProject<T>(kind: string, title: string, payload: T, documentVersion = 1): Project<T> {
  const now = new Date().toISOString();
  const normalizedTitle = title.trim() || "Untitled project";
  const project = { schema: "vlak.project" as const, envelopeVersion: 1 as const, kind, documentVersion, projectId: crypto.randomUUID(), title: normalizedTitle, revision: crypto.randomUUID(), createdAt: now, updatedAt: now, appVersion: "0.4.0", payload };
  projectHeader(project);
  return project;
}
export function serializeProject<T>(project: Project<T>): string {
  projectHeader(project);
  const text = JSON.stringify(project, (_key, value) => {
    if (typeof value === "number" && !Number.isFinite(value)) throw new Error("Project contains an invalid number.");
    if (value === undefined || typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") throw new Error("Project contains unsupported data that would be lost.");
    return value;
  }, 2);
  if (new TextEncoder().encode(text).length > PROJECT_LIMIT) throw new Error("Project files must be 8 MiB or smaller.");
  return text;
}
export function readProject<T>(source: string, kind: string, parse: (value: unknown) => T, title = "Imported project", documentVersion = 1): Project<T> {
  if (new TextEncoder().encode(source).length > PROJECT_LIMIT) throw new Error("Project files must be 8 MiB or smaller.");
  let decoded: unknown;
  try { decoded = JSON.parse(source); } catch { throw new Error("This file is not valid JSON. Your current work is unchanged."); }
  const object = projectObject(decoded);
  if (object.schema !== "vlak.project") {
    // A legacy domain validator must recognize the exact old document shape.
    return createProject(kind, title, parse(decoded), documentVersion);
  }
  const project = projectHeader(decoded);
  if (project.kind !== kind) throw new Error(`Open a ${kind} project in this workspace.`);
  if (project.documentVersion !== documentVersion) throw new Error("This document version is not supported. Your current work is unchanged.");
  return { ...project, payload: parse(project.payload) };
}
export function projectFilename(title: string, suffix: string): string {
  const stem = title.normalize("NFKC").replace(/[^\p{L}\p{N}._-]+/gu, "-").replace(/^[-.]+|[-.]+$/g, "").slice(0, 80) || "project";
  const extension = suffix.normalize("NFKC").replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^[-.]+|[-.]+$/g, "").slice(0, 48) || "json";
  return `${stem}.${extension}`;
}

export const RECOVERY_LIMIT = PROJECT_LIMIT * 20 + 1024 * 1024;
/** Recover valid entries individually; unsupported entries remain in the original download. */
export function readRecovery<T>(source: string, kind: string, parse: (value: unknown) => T, documentVersion = 1) {
  if (new TextEncoder().encode(source).length > RECOVERY_LIMIT) throw new Error("Recovery data exceeds the 20-project limit.");
  let decoded: unknown;
  try { decoded = JSON.parse(source); } catch { throw new Error("This recovery file is not valid JSON. Your current work is unchanged."); }
  const data = projectObject(decoded);
  if (data.schema !== "vlak.project-recovery" || data.version !== 1 || Object.keys(data).some(key => !["schema", "version", "projects"].includes(key)) || !Array.isArray(data.projects) || data.projects.length > 20) throw new Error("Unsupported recovery collection.");
  const projects: Project<T>[] = [], issues: string[] = [];
  for (const [index, item] of data.projects.entries()) {
    try { projects.push(readProject(JSON.stringify(item), kind, parse, "Recovered project", documentVersion)); }
    catch (error) { issues.push(`Entry ${index + 1}: ${error instanceof Error ? error.message : "Could not read project."}`); }
  }
  return { projects, issues };
}
