"use client";

import { useRef, useState, type ComponentType } from "react";
import { Agent, Artifact, Button, CodeBlock, Commit, EnvironmentVariables, PackageInfo, SchemaDisplay, Snippet, TestResults, type TestResultSuite } from "@noorddev/vlak-react";

export function AgentPreview() {
  return <Agent name="Code reviewer" model="Workspace model" instructions="Review the supplied diff. Explain material issues and cite the relevant file."
    tools={[{ name: "read_file", description: "Read a file from the selected workspace.", inputSchema: { type: "object", properties: { path: { type: "string" } }, required: ["path"] } }, { name: "list_files", description: "List files in a directory.", inputSchema: { type: "object", properties: { directory: { type: "string" } } } }]}
    outputSchema={'type Review = {\n  summary: string;\n  findings: { file: string; line: number }[];\n}'} />;
}

export function ArtifactPreview({ title = "Review notes" }: { title?: string } = {}) {
  const [open, setOpen] = useState(true);
  const [version, setVersion] = useState(1);
  const reopen = useRef<HTMLButtonElement>(null);
  return <div style={{ display: "grid", gap: "1rem", minWidth: 0 }}><Button ref={reopen} variant="subtle" disabled={open} onClick={() => setOpen(true)}>Open review</Button>{open && <Artifact title={title} description={`Draft ${version}`} maxHeight="16rem" onClose={() => { setOpen(false); queueMicrotask(() => reopen.current?.focus()); }} actions={<Button variant="subtle" onClick={() => setVersion(current => current + 1)}>Revise draft</Button>} footer="Local draft · Changes stay in this example"><p>The request handler now retains the original draft when a send fails.</p><p>Add a test for a rejected request and confirm that the retry uses the same content.</p></Artifact>}</div>;
}

export function CommitPreview() {
  const [file, setFile] = useState("");
  return <div style={{ display: "grid", gap: "1rem", minWidth: 0 }}><Commit hash="a1b2c3d4e5f60718293a4b5c6d7e8f901234abcd" message="Keep drafts after a failed request" author="Mina" timestamp="2026-09-09T10:20:00Z" defaultOpen onFileSelect={selected => setFile(selected.path)} files={[{ path: "src/composer.tsx", status: "modified", additions: 18, deletions: 4 }, { path: "test/composer.test.tsx", status: "added", additions: 32, deletions: 0 }]} />{file && <CodeBlock language={file.endsWith("test.tsx") ? "Test preview" : "Source preview"} code={file.endsWith("test.tsx") ? 'it("keeps the draft when sending fails", async () => {\n  await expect(send(draft)).rejects.toThrow();\n  expect(composer.value).toBe(draft);\n});' : 'try {\n  await send(draft);\n  clearDraft();\n} catch {\n  setError("Could not send. Try again.");\n}'} />}</div>;
}

export function EnvironmentVariablesPreview({ title = "Environment variables" }: { title?: string } = {}) {
  return <EnvironmentVariables title={title} variables={[{ name: "MODEL_NAME", value: "workspace-model", description: "Model selected by this workspace", required: true }, { name: "EXAMPLE_TOKEN", value: "example-only-not-a-real-token", description: "Example value for reveal and copy", required: true }]} />;
}

export function PackageInfoPreview() {
  const [showPeers, setShowPeers] = useState(false);
  return <PackageInfo name="@example/review-ui" currentVersion="1.2.0" newVersion="1.3.0" changeType="minor" description="Adds compact response controls and draft recovery." dependencies={showPeers ? [{ name: "react", version: "^19.0.0", kind: "peer" }] : [{ name: "@example/parser", version: "^2.0.0", kind: "runtime" }, { name: "react", version: "^19.0.0", kind: "peer" }]} actions={<Button variant="subtle" aria-pressed={showPeers} onClick={() => setShowPeers(current => !current)}>{showPeers ? "Show all dependencies" : "Show peer dependencies"}</Button>} />;
}

export function SchemaDisplayPreview() {
  return <SchemaDisplay method="POST" path="/projects/{projectId}/reviews" description="Create a review for a supplied diff."
    parameters={[{ name: "projectId", type: "string", required: true, location: "path", description: "Project to review." }]}
    requestBody={[{ name: "diff", type: "string", required: true }, { name: "options", type: "object", properties: [{ name: "includeTests", type: "boolean", description: "Include test files in the review." }] }]}
    responseBody={[{ name: "id", type: "string", required: true }, { name: "findings", type: "array", items: { name: "finding", type: "object", properties: [{ name: "file", type: "string", required: true }, { name: "line", type: "number" }, { name: "summary", type: "string" }] } }]} />;
}

export function SnippetPreview() {
  return <Snippet prefix="$" code="pnpm add @noorddev/vlak-react" label="Install Vlak" />;
}

const initialSuites: TestResultSuite[] = [{ id: "composer", name: "Composer", duration: 428, tests: [{ id: "send", name: "Sends a complete prompt", status: "passed", duration: 82 }, { id: "retry", name: "Retains the draft after failure", status: "failed", duration: 146, error: 'Expected "Review the diff", received "".', stack: "at assertDraft (composer.test.tsx:42:5)\nat retryTest (composer.test.tsx:38:3)" }, { id: "paste", name: "Pastes an attachment", status: "skipped" }] }];

export function TestResultsPreview({ title = "Test results" }: { title?: string } = {}) {
  const [suites, setSuites] = useState(initialSuites);
  return <div style={{ display: "grid", gap: "1rem", minWidth: 0 }}><TestResults title={title} suites={suites} duration={428} onRetry={test => { setSuites(current => current.map(suite => ({ ...suite, tests: suite.tests.map(item => item.id === test.id ? { ...item, status: "passed", error: undefined, stack: undefined, duration: 93 } : item) }))); }} /><Button variant="subtle" onClick={() => setSuites(initialSuites)}>Reset example results</Button></div>;
}

export const aiCodePreviews: Record<string, ComponentType> = {
  agent: AgentPreview,
  artifact: ArtifactPreview,
  commit: CommitPreview,
  "environment-variables": EnvironmentVariablesPreview,
  "package-info": PackageInfoPreview,
  "schema-display": SchemaDisplayPreview,
  snippet: SnippetPreview,
  "test-results": TestResultsPreview,
};
