"use client";

import { useState } from "react";
import { Button, DiffViewer, Field, FieldLabel, Input, Select } from "@noorddev/vlak-react";
import { CodeBlock } from "@/components/code-block";
import { createProject, projectObject, projectText, readProject, serializeProject } from "@/lib/project-file";
import { DocsExample } from "./frame";
import styles from "./guides.module.css";

export function AgentsExample({ description, example }: { description: string; example: string }) {
  const [city, setCity] = useState("alkmaar");
  const [surface, setSurface] = useState("mcp");
  const request = surface === "mcp" ? '{ "name": "get_component", "arguments": { "name": "select" } }'
    : surface === "cli" ? "npx @noorddev/vlak-cli docs select" : "https://vlak.dev/docs/select.md";
  return <DocsExample title="From a component record to a working control" description="The Select example below comes from Vlak’s registry. Try the same control with a keyboard or pointer.">
    <div className={styles.stack}>
      <Select aria-label="Documentation surface" fullWidth value={surface} onValueChange={setSurface} options={[{ value: "mcp", label: "MCP tool" }, { value: "cli", label: "CLI command" }, { value: "markdown", label: "Markdown URL" }]} />
      <div className={styles.route}><span>Request</span><code data-docs-request aria-live="polite">{request}</code></div>
      <div className={styles.record}><span className={styles.label}>Registry record · Select</span><p>{description}</p><a className="rs-link" href="/r/select.json">Inspect the source record</a></div>
      <div className={styles.row}><Select aria-label="Example city" value={city} onValueChange={setCity} options={[{ value: "alkmaar", label: "Alkmaar" }, { value: "amsterdam", label: "Amsterdam" }, { value: "rotterdam", label: "Rotterdam" }]} /><output className={styles.mono} aria-live="polite">value: {city}</output></div>
      <details className={styles.details}><summary>See the registry’s React example</summary><CodeBlock code={example} /></details>
    </div>
  </DocsExample>;
}

function parseSample(value: unknown) {
  const data = projectObject(value);
  return { note: projectText(data.note, "Note", 240) };
}

export function ProjectsExample() {
  const [note, setNote] = useState("Review the north quay inspection");
  const [saved, setSaved] = useState<string | null>(null);
  const [message, setMessage] = useState("Edit the note, save a copy, then change it and reopen the saved copy.");
  function save() {
    try {
      const payload = parseSample({ note });
      setSaved(serializeProject(createProject("docs-example", "Inspection note", payload)));
      setMessage("A project copy is ready in this demo. Change the note to compare it with the saved version.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save this example."); }
  }
  function reopen() {
    if (!saved) return;
    const project = readProject(saved, "docs-example", parseSample);
    setNote(project.payload.note);
    setMessage("The saved note has been reopened from the project copy.");
  }
  return <DocsExample title="Keep an editable copy" description="An in-memory example using the project-file format. It does not write browser storage or replace a workspace.">
    <div className={styles.stack}>
      <Field><FieldLabel htmlFor="docs-project-note">Working note</FieldLabel><Input plain id="docs-project-note" value={note} maxLength={240} onChange={event => setNote(event.target.value)} /></Field>
      <div className={styles.actions}><Button onClick={save}>Save a copy</Button><Button variant="ghost" disabled={!saved} onClick={reopen}>Reopen copy</Button></div>
      <div className={styles.record}><span className={styles.label}>Saved project</span><p data-docs-saved-note>{saved ? readProject(saved, "docs-example", parseSample).payload.note : "No copy yet"}</p><span className={styles.mono}>{saved ? "vlak.project · editable JSON" : "Save to create a project copy"}</span></div>
      <p className={styles.feedback} role="status">{message}</p>
      {saved && <details className={styles.details}><summary>Inspect the project file</summary><CodeBlock code={saved} /></details>}
    </div>
  </DocsExample>;
}

const updateScenarios = {
  upstream: { local: "padding: 16px;", incoming: "padding: 20px;", status: "Ready to update", action: "The local file matches its recorded baseline. The reviewed incoming version can replace it." },
  local: { local: "padding: 24px;", incoming: "padding: 16px;", status: "Keep local changes", action: "Only the local file changed. The update preserves your version." },
  both: { local: "padding: 24px;", incoming: "padding: 20px;", status: "Review required", action: "Both versions changed. Reconcile the source and create a new plan before applying it." },
};

export function UpdatesExample() {
  const [scenario, setScenario] = useState<keyof typeof updateScenarios>("upstream");
  const current = updateScenarios[scenario];
  return <DocsExample title="Three versions, one review" description="An illustrated source-file comparison. Choose which versions changed to see how a review treats them.">
    <div className={styles.stack}>
      <Select aria-label="Source changes" fullWidth value={scenario} onValueChange={value => setScenario(value as keyof typeof updateScenarios)} options={[{ value: "upstream", label: "Upstream changed" }, { value: "local", label: "Local changed" }, { value: "both", label: "Both changed" }]} />
      <dl className={styles.versions}><div><dt>Recorded baseline</dt><dd><code>padding: 16px;</code></dd></div><div><dt>Your file</dt><dd><code>{current.local}</code></dd></div><div><dt>Incoming source</dt><dd><code>{current.incoming}</code></dd></div></dl>
      <DiffViewer label="Your file compared with incoming source" before={current.local} after={current.incoming} />
      <div className={styles.record} role="status"><strong>{current.status}</strong><p>{current.action}</p></div>
    </div>
  </DocsExample>;
}

export function ChoosingExample() {
  const [view, setView] = useState("record");
  const [reviewed, setReviewed] = useState(false);
  return <DocsExample title="One set of parts, two reading orders" description="Type, spacing, and controls stay consistent. The product decides what someone needs to see first.">
    <div className={styles.stack}>
      <Select aria-label="Product layout" fullWidth value={view} onValueChange={setView} options={[{ value: "record", label: "Read one record" }, { value: "queue", label: "Review a queue" }]} />
      <div className={styles.specimen}>
        <div className={styles.specimenHeader}><span>Field records</span><span>3 supplied</span></div>
        {view === "record" ? <div className={styles.recordBody}><span className={styles.label}>FIELD-1042</span><strong>North quay inspection</strong><p>The inspection note is ready for review.</p><Button onClick={() => setReviewed(value => !value)}>{reviewed ? "Reopen review" : "Mark reviewed"}</Button><output className={styles.feedback} aria-live="polite">{reviewed ? "Reviewed" : "Needs review"}</output></div>
          : <ul className={styles.queue}>{["North quay inspection", "Warehouse door", "Loading ramp"].map((title, index) => <li key={title}><span>{title}</span><span>{index === 0 && reviewed ? "Reviewed" : "Needs review"}</span></li>)}</ul>}
      </div>
      <div className={styles.rules}><span>Paper + ink</span><span>Hairline divisions</span><span>Shared controls</span></div>
    </div>
  </DocsExample>;
}
