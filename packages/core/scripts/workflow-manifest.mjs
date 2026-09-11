/** Workspace installs use source; exported kits use the coordinated npm release. */
export function workflowManifestForRelease(manifest, version) {
  const result = structuredClone(manifest);
  for (const field of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
    for (const [name, range] of Object.entries(result[field] ?? {})) {
      if (!range.startsWith("workspace:")) continue;
      if (!["@noorddev/vlak", "@noorddev/vlak-react", "@noorddev/vlak-cli", "@noorddev/vlak-mcp"].includes(name)) {
        throw new Error(`Workflow export has an unknown workspace dependency: ${name}`);
      }
      result[field][name] = version;
    }
  }
  return result;
}
