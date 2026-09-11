import { projectHeader, serializeProject } from "./project-file";
import type { Project } from "./project-file";

const database = "vlak-projects-v1";
export class ProjectConflict extends Error {
  constructor() { super("This project changed in another tab. Open the latest revision or save a copy."); }
}
function connect(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") { reject(new Error("Browser storage is unavailable. Save a project file to keep your work.")); return; }
    const request = indexedDB.open(database, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore("heads", { keyPath: "projectId" });
      const revisions = db.createObjectStore("revisions", { keyPath: "revision" });
      revisions.createIndex("projectId", "projectId");
    };
    let cancelled = false;
    request.onerror = () => { cancelled = true; reject(request.error); };
    request.onblocked = () => { cancelled = true; reject(new Error("Close other Vlak tabs to update project storage.")); };
    request.onsuccess = () => { if (cancelled) { request.result.close(); return; } request.result.onversionchange = () => request.result.close(); resolve(request.result); };
  });
}
export async function listProjects(kind: string): Promise<Project<unknown>[]> {
  const db = await connect();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction("heads", "readonly");
      const request = transaction.objectStore("heads").getAll();
      request.onsuccess = () => {
        try { resolve(request.result.filter(item => item?.kind === kind).map(projectHeader).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))); }
        catch { reject(new Error("Stored project data could not be read. Export a recovery copy before clearing storage.")); }
      };
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}
export async function projectHistory(projectId: string): Promise<Project<unknown>[]> {
  const db = await connect();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction("revisions", "readonly").objectStore("revisions").index("projectId").getAll(projectId);
      request.onsuccess = () => { try { resolve(request.result.map(projectHeader).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))); } catch (error) { reject(error); } };
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}
export async function saveProjectRevision(project: Project<unknown>, expected: string | null): Promise<void> {
  serializeProject(project);
  if (expected === null && project.parentRevision !== undefined || expected !== null && project.parentRevision !== expected) throw new Error("The project revision does not match its expected parent.");
  const db = await connect();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(["heads", "revisions"], "readwrite");
      let failure: Error | undefined;
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(failure ?? tx.error ?? new Error("Project could not be saved. Export a file to keep your work."));
      tx.onerror = () => { /* onabort handles failed writes */ };
      const heads = tx.objectStore("heads"), revisions = tx.objectStore("revisions");
      const current = heads.get(project.projectId);
      current.onsuccess = () => {
        if ((current.result?.revision ?? null) !== expected) { failure = new ProjectConflict(); tx.abort(); return; }
        const all = heads.getAll();
        all.onsuccess = () => {
          if (!current.result && all.result.filter(item => item.kind === project.kind).length >= 20) { failure = new Error("This workspace has 20 saved projects. Export and remove one before saving another."); tx.abort(); return; }
          heads.put(project); revisions.put(project);
          const older = revisions.index("projectId").getAll(project.projectId);
          older.onsuccess = () => {
            const history = older.result.filter(item => item.revision !== project.revision).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
            for (const item of history.slice(19)) revisions.delete(item.revision);
          };
        };
      };
    });
  } finally { db.close(); }
}
export async function removeProject(projectId: string, expected: string): Promise<void> {
  const db = await connect();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(["heads", "revisions"], "readwrite");
      let conflict = false;
      tx.oncomplete = () => resolve(); tx.onabort = () => reject(conflict ? new ProjectConflict() : tx.error);
      const request = tx.objectStore("heads").get(projectId);
      request.onsuccess = () => {
        if (request.result?.revision !== expected) { conflict = true; tx.abort(); return; }
        tx.objectStore("heads").delete(projectId);
        const revisions = tx.objectStore("revisions");
        const history = revisions.index("projectId").getAllKeys(projectId);
        history.onsuccess = () => { for (const key of history.result) revisions.delete(key); };
      };
    });
  } finally { db.close(); }
}
export async function recoveryProjects(kind: string): Promise<string> {
  const db = await connect();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction("heads", "readonly").objectStore("heads").getAll();
      request.onsuccess = () => {
        try { resolve(JSON.stringify({ schema: "vlak.project-recovery", version: 1, projects: request.result.filter(item => item?.kind === kind) }, null, 2)); }
        catch { reject(new Error("Recovery data could not be serialized. The stored data is unchanged.")); }
      };
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}
