/** Shared browser-file validation for file upload and message composition. */
export interface FileSelectionRejection {
  file: File;
  code: "accept" | "max_files" | "max_file_size";
  reason: string;
}
export const fileSelectionKey = (file: File) => `${file.name}:${file.size}:${file.lastModified}`;
export function acceptsFile(file: File, accept?: string) {
  if (!accept?.trim()) return true;
  return accept.split(",").some((entry) => {
    const rule = entry.trim().toLowerCase();
    if (!rule) return false;
    if (rule.startsWith(".")) return file.name.toLowerCase().endsWith(rule);
    if (rule.endsWith("/*")) return file.type.toLowerCase().startsWith(rule.slice(0, -1));
    return file.type.toLowerCase() === rule;
  });
}
export function selectFiles(incoming: readonly File[], { files, accept, multiple = true, maxFiles, maxSize }: {
  files: readonly File[]; accept?: string; multiple?: boolean; maxFiles?: number; maxSize?: number;
}) {
  const accepted = multiple ? [...files] : [];
  const added: File[] = [];
  const rejected: FileSelectionRejection[] = [];
  const limit = multiple ? maxFiles : 1;
  for (const file of incoming) {
    if (accepted.some((entry) => fileSelectionKey(entry) === fileSelectionKey(file))) continue;
    const code = !acceptsFile(file, accept) ? "accept" : maxSize != null && file.size > maxSize ? "max_file_size" : limit != null && accepted.length >= limit ? "max_files" : undefined;
    if (code) rejected.push({ file, code, reason: code === "accept" ? "File type is not accepted" : code === "max_file_size" ? `File exceeds ${maxSize} bytes` : `Choose at most ${limit} ${limit === 1 ? "file" : "files"}` });
    else { accepted.push(file); added.push(file); }
  }
  return { accepted, added, rejected };
}
