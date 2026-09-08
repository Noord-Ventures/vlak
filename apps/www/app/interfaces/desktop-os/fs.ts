import type { DesktopEntry, FileSystem, Platform } from "./types";

export const welcomePath = "/Documents/Welcome.txt";
export function initialFileSystem(_platform?: Platform): FileSystem {
  return [
    { path: "/", kind: "folder" },
    { path: "/Documents", kind: "folder" },
    { path: "/Documents/Calendar", kind: "folder" },
    { path: "/Pictures", kind: "folder" },
    { path: "/Downloads", kind: "folder" },
    { path: "/Trash", kind: "folder" },
    { path: welcomePath, kind: "file", content: "A place to work\n\nOpen a folder, make a note, or try a command in Terminal. Files saved here stay with this desktop.\n\nThe text editor and terminal share the same files. Drawings can be saved to Pictures or exported as PNG. Each operating system keeps an independent workspace.\n\nTry: ls /Documents\nThen: cat /Documents/Welcome.txt" },
    { path: "/Documents/Notes.txt", kind: "file", content: "Notes\n\nThings to make, ideas to keep." },
    { path: "/Documents/Tasks.txt", kind: "file", content: "[ ] Sketch a new idea\n[ ] Write a short note\n[ ] Take a walk" },
  ];
}
export function normalizePath(path: string, cwd = "/") {
  const parts: string[] = [];
  for (const part of `${path.startsWith("/") ? "" : cwd}/${path}`.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop(); else parts.push(part);
  }
  return `/${parts.join("/")}`;
}
export const basename = (path: string) => path === "/" ? "Home" : path.split("/").at(-1)!;
export const parentPath = (path: string) => normalizePath(`${path}/..`);
export const childrenOf = (files: FileSystem, path: string) => files.filter(entry => entry.path !== path && parentPath(entry.path) === path).sort((a, b) => b.kind.localeCompare(a.kind) || a.path.localeCompare(b.path));
export function validateFileSystem(value: unknown): FileSystem | null {
  if (!Array.isArray(value) || value.length > 500) return null;
  const seen = new Set<string>();
  let size = 0;
  for (const entry of value) {
    if (!entry || typeof entry !== "object" || typeof entry.path !== "string" || entry.path.length > 256 || entry.path !== normalizePath(entry.path) || [...entry.path].some(character => character.charCodeAt(0) < 32) || seen.has(entry.path) || !["file", "folder"].includes(entry.kind)) return null;
    if (entry.kind === "file" && typeof entry.content !== "string") return null;
    size += entry.kind === "file" ? entry.content.length : 0;
    seen.add(entry.path);
  }
  if (size > 2_000_000 || !value.some(entry => entry.path === "/" && entry.kind === "folder")) return null;
  if (value.some(entry => entry.path !== "/" && !value.some(parent => parent.kind === "folder" && parent.path === parentPath(entry.path)))) return null;
  return value.map(({ path, kind, content }: DesktopEntry) => ({ path, kind, ...(kind === "file" ? { content } : {}) }));
}
export function writeFile(files: FileSystem, path: string, content: string): FileSystem {
  const target = normalizePath(path);
  if (content.length > 1_000_000) throw new Error("This file is too large for the desktop.");
  if (!files.some(entry => entry.path === parentPath(target) && entry.kind === "folder")) throw new Error("The destination folder does not exist.");
  const existing = files.find(entry => entry.path === target);
  if (existing?.kind === "folder") throw new Error("A folder already has that name.");
  const next = existing ? files.map(entry => entry.path === target ? { ...entry, content } : entry) : [...files, { path: target, kind: "file" as const, content }];
  if (!validateFileSystem(next)) throw new Error("The desktop storage limit has been reached.");
  return next;
}
export function makeFolder(files: FileSystem, path: string): FileSystem {
  const target = normalizePath(path);
  if (files.some(entry => entry.path === target)) throw new Error("That name is already in use.");
  if (!files.some(entry => entry.path === parentPath(target) && entry.kind === "folder")) throw new Error("The parent folder does not exist.");
  const next: FileSystem = [...files, { path: target, kind: "folder" }];
  if (!validateFileSystem(next)) throw new Error("The desktop storage limit has been reached.");
  return next;
}
export function moveEntry(files: FileSystem, from: string, to: string): FileSystem {
  from = normalizePath(from); to = normalizePath(to);
  if (from === "/" || to.startsWith(`${from}/`)) throw new Error("Choose another destination.");
  if (!files.some(entry => entry.path === from)) throw new Error("The source does not exist.");
  if (files.some(entry => entry.path === to)) throw new Error("That name is already in use.");
  if (!files.some(entry => entry.path === parentPath(to) && entry.kind === "folder")) throw new Error("The destination folder does not exist.");
  const next = files.map(entry => entry.path === from || entry.path.startsWith(`${from}/`) ? { ...entry, path: to + entry.path.slice(from.length) } : entry);
  if (!validateFileSystem(next)) throw new Error("Choose a shorter name or path.");
  return next;
}
export function removeEntry(files: FileSystem, path: string): FileSystem {
  path = normalizePath(path);
  if (path === "/") throw new Error("The home folder cannot be removed.");
  if (!files.some(entry => entry.path === path)) throw new Error("The file does not exist.");
  return files.filter(entry => entry.path !== path && !entry.path.startsWith(`${path}/`));
}

/** Local command behavior adapted from the user's BeOS filesystem and terminal. */
export function runCommand(command: string, files: FileSystem, cwd: string): { output: string; files: FileSystem; cwd: string; clear?: boolean } {
  const args = command.match(/"[^"]*"|'[^']*'|[^\s]+/g)?.map(arg => arg.replace(/^("|')(.*)\1$/, "$2")) ?? [];
  const name = args.shift()?.toLowerCase() ?? "";
  const target = (value = ".") => normalizePath(value, cwd);
  const entry = (value = ".") => files.find(file => file.path === target(value));
  const result = (output = "", next = files, directory = cwd) => ({ output, files: next, cwd: directory });
  try {
    if (!name) return result();
    if (name === "help") return result("ls / dir · cd · pwd · cat / type · mkdir · touch · rm · mv · cp\necho text > file · grep text file · find name · wc file · date · clear");
    if (name === "clear" || name === "cls") return { ...result(), clear: true };
    if (name === "pwd") return result(cwd);
    if (name === "date") return result(new Date().toLocaleString());
    if (name === "whoami") return result("guest");
    if (name === "ls" || name === "dir") {
      const path = target(args.find(arg => !arg.startsWith("-")));
      if (!files.some(file => file.path === path && file.kind === "folder")) throw new Error("Folder not found.");
      return result(childrenOf(files, path).map(file => `${file.kind === "folder" ? "▸ " : "  "}${basename(file.path)}`).join("\n") || "Folder is empty.");
    }
    if (name === "cd") {
      const path = target(args[0] ?? "/");
      if (!files.some(file => file.path === path && file.kind === "folder")) throw new Error("Folder not found.");
      return result("", files, path);
    }
    if (name === "cat" || name === "type") {
      const file = entry(args[0]);
      if (file?.kind !== "file") throw new Error("File not found.");
      return result(file.content ?? "");
    }
    if (name === "mkdir") { if (!args[0]) throw new Error("Usage: mkdir folder"); return result("", makeFolder(files, target(args[0]))); }
    if (name === "touch") { if (!args[0]) throw new Error("Usage: touch file"); return result("", writeFile(files, target(args[0]), entry(args[0])?.content ?? "")); }
    if (name === "rm" || name === "del" || name === "rmdir") {
      const path = args.find(arg => !arg.startsWith("-")); if (!path) throw new Error("Usage: rm file");
      const next = removeEntry(files, target(path));
      return result("", next, next.some(file => file.path === cwd) ? cwd : "/");
    }
    if (name === "mv" || name === "rename") { if (args.length !== 2) throw new Error("Usage: mv source destination"); const from = target(args[0]); const to = target(args[1]); return result("", moveEntry(files, from, to), cwd === from || cwd.startsWith(`${from}/`) ? to + cwd.slice(from.length) : cwd); }
    if (name === "cp" || name === "copy") {
      if (args.length !== 2 || entry(args[0])?.kind !== "file") throw new Error("Usage: cp file destination");
      return result("", writeFile(files, target(args[1]), entry(args[0])?.content ?? ""));
    }
    if (name === "echo") {
      const redirect = args.findIndex(arg => arg === ">" || arg === ">>");
      if (redirect < 0) return result(args.join(" "));
      if (!args[redirect + 1]) throw new Error("Choose a destination file.");
      const path = target(args[redirect + 1]);
      return result("", writeFile(files, path, `${args[redirect] === ">>" ? files.find(file => file.path === path)?.content ?? "" : ""}${args.slice(0, redirect).join(" ")}\n`));
    }
    if (name === "grep") {
      const file = entry(args[1]); if (!args[0] || file?.kind !== "file") throw new Error("Usage: grep text file");
      return result((file.content ?? "").split("\n").filter(line => line.toLowerCase().includes(args[0]!.toLowerCase())).join("\n") || "No matching lines.");
    }
    if (name === "find") return result(files.filter(file => file.path.toLowerCase().includes((args[0] ?? "").toLowerCase())).map(file => file.path).join("\n") || "No matches.");
    if (name === "wc") {
      const file = entry(args[0]); if (file?.kind !== "file") throw new Error("File not found.");
      const text = file.content ?? ""; return result(`${text.split("\n").length} lines · ${text.trim().split(/\s+/).filter(Boolean).length} words · ${text.length} characters`);
    }
    return result(`${name}: command not found. Type help for available commands.`);
  } catch (error) { return result(error instanceof Error ? error.message : "Command could not complete."); }
}
