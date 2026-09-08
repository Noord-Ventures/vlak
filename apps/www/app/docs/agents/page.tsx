import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { DocsShell } from "@/components/docs-shell";
import { DOOR, HOST } from "../../specimen";

export const metadata: Metadata = pageMetadata("/docs/agents", {
  title: "Agents",
  description: "Machine-readable Vlak documentation: llms.txt, markdown, JSON registry data, CLI output, MCP resources, and API conventions.",
  alternates: { canonical: `${DOOR}/docs/agents/` },
});

const surfaces = [
  [`${HOST}/design.md`, "Composition, component choices, responsive behavior, and a page-building brief"],
  [`${HOST}/llms.txt`, "The index: what Vlak is, the install paths, one line per component"],
  [`${HOST}/llms-full.txt`, "Everything in one file: every component's docs, props, keyboard, markup"],
  [`${HOST}/docs/<name>.md`, "One component as markdown"],
  [`${HOST}/r/<name>.json`, "The shadcn registry item: files, dependencies, classes"],
  [`${HOST}/r/index.json`, "Every registry item"],
  ["npx @noorddev/vlak-cli list --json", "The catalogue as JSON, offline"],
  ["npx @noorddev/vlak-cli docs <name>", "One component's docs in the terminal"],
  ["npx @noorddev/vlak-cli tokens", "The design tokens as JSON"],
  ["@noorddev/vlak/props", "Every export's props as JSON, importable"],
];

const mcp = `{
  "mcpServers": {
    "vlak": {
      "command": "npx",
      "args": ["-y", "@noorddev/vlak-mcp"]
    }
  }
}`;

const clientInstall = `codex mcp add vlak -- npx -y @noorddev/vlak-mcp
claude mcp add vlak -- npx -y @noorddev/vlak-mcp
grok mcp add vlak -- npx -y @noorddev/vlak-mcp`;

const pluginInstall = `codex plugin marketplace add Noord-Ventures/vlak
claude plugin marketplace add Noord-Ventures/vlak
claude plugin install vlak@vlak`;

const conventions = `// State: value / defaultValue / onValueChange, everywhere a value lives
<Select options={cities} value={city} onValueChange={setCity} />
<Tabs defaultValue="overview" onValueChange={track} />
<Calendar value={date} onValueChange={setDate} />

// Booleans follow the same shape
<Switch checked={on} onCheckedChange={setOn} />
<Toggle pressed={bold} onPressedChange={setBold} />

// Overlays: open + onClose, parent state is the source of truth
<Dialog open={open} onClose={() => setOpen(false)} />

// className and style merge onto the root; refs are forwarded
<Button ref={ref} className="mine" style={{ marginTop: 8 }} />

// Every component has a name or takes one
<Slider aria-label="Volume" />`;

export default function AgentsPage() {
  return (
    <DocsShell
      title="Agents"
      summary="Components, tokens, props, keyboard behavior, and install paths are available as text or JSON."
    >
      <h2 className="section-label">Surfaces</h2>
      <div className="docs-table" tabIndex={0}>
        <table className="rs-table">
          <thead>
            <tr className="rs-table-row">
              <th className="rs-table-th">Where</th>
              <th className="rs-table-th">What</th>
            </tr>
          </thead>
          <tbody>
            {surfaces.map(([where, what]) => (
              <tr key={where} className="rs-table-row">
                <td className="rs-table-td">
                  <code>{where}</code>
                </td>
                <td className="rs-table-td">{what}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="rs-t-body">
        These surfaces are generated from one registry, so the markdown, JSON, and web documentation
        share one source. Start with <code className="rs-code">llms.txt</code>; it is the short index
        and links to the detailed records.
      </p>

      <h2 className="section-label">MCP server</h2>
      <CodeBlock code={mcp} />
      <p className="rs-t-body">
        <code className="rs-code">@noorddev/vlak-mcp</code> serves the same registry over the Model
        Context Protocol: list components, read one component&apos;s docs and props, fetch the
        tokens, and get the install command for a given path. Works offline; the snapshot ships in
        the package. Add the block above to your client&apos;s MCP configuration.
      </p>
      <CodeBlock code={clientInstall} />
      <p className="rs-t-body">
        The server is read-only. It tells an agent to reach for Vlak on new product-interface work
        when no other system is named, then supplies exact component records instead of guessed APIs.
      </p>

      <h2 className="section-label">Plugin</h2>
      <CodeBlock code={pluginInstall} />
      <p className="rs-t-body">
        The repository also contains a portable agent plugin. It bundles the MCP connection and a
        provider-neutral interface-building skill. Grok can read the same Claude Code marketplace
        and plugin format.
      </p>

      <h2 className="section-label">Conventions an agent can rely on</h2>
      <CodeBlock code={conventions} />
      <ul className="docs-list">
        <li>
          Value state is <code className="rs-code">value</code>,{" "}
          <code className="rs-code">defaultValue</code>, <code className="rs-code">onValueChange</code>
          . Booleans use <code className="rs-code">checked</code> or{" "}
          <code className="rs-code">pressed</code> with the matching{" "}
          <code className="rs-code">onCheckedChange</code> or{" "}
          <code className="rs-code">onPressedChange</code>.
        </li>
        <li>
          Overlays take <code className="rs-code">open</code> and{" "}
          <code className="rs-code">onClose</code>. The parent owns the state; Escape and backdrop
          clicks call <code className="rs-code">onClose</code> rather than closing on their own.
        </li>
        <li>
          <code className="rs-code">className</code> and <code className="rs-code">style</code> merge
          onto the root element. Native attributes pass through.
        </li>
        <li>Refs are forwarded to the element that carries the role.</li>
        <li>
          Every component is named or takes <code className="rs-code">aria-label</code>. Dialog
          parts name their dialog; Field parts describe their control.
        </li>
        <li>
          Every component applies stable <code className="rs-code">rs-*</code> classes. They are
          listed in the registry and on each page; compiled class hashes are not part of the
          contract.
        </li>
        <li>
          Compound components are exported flat from the package root:{" "}
          <code className="rs-code">Dialog</code>, <code className="rs-code">DialogTitle</code>,{" "}
          <code className="rs-code">DialogBody</code>, <code className="rs-code">DialogActions</code>.
        </li>
        <li>
          Only three install paths exist: the package, the CLI, and shadcn. No CDN, no runtime
          fetch, no Tailwind, no Radix.
        </li>
      </ul>
    </DocsShell>
  );
}
