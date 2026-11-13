import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { vlakComponents } from "@noorddev/vlak";
import vlakPackage from "@noorddev/vlak/package.json";
import { AgentsExample } from "@/components/docs-examples/guides";
import { DocsShell } from "@/components/docs-shell";
import { DOOR, HOST } from "../../specimen";
import { AgentHeading } from "./agent-heading";

export const metadata: Metadata = pageMetadata("/docs/agents", {
  title: "Agents",
  description: "Connect Vlak to ChatGPT, Claude Code, or Codex. Copy the setup, verify the connection, and read component docs, props, tokens, and install commands.",
  alternates: { canonical: `${DOOR}/docs/agents/` },
});

const surfaces = [
  [`${HOST}/design.md`, "Composition, component choices, responsive behavior, and a page-building brief"],
  [`${HOST}/llms.txt`, "The index: what Vlak is, the install paths, one line per component"],
  [`${HOST}/llms-full.txt`, "Everything in one file: every component's docs, props, keyboard, markup"],
  [`${HOST}/docs/<name>.md`, "One component as markdown"],
  [`${HOST}/r/<name>.json`, "The shadcn registry item: files, dependencies, classes"],
  [`${HOST}/r/index.json`, "Every registry item"],
  [`${HOST}/mcp`, "The public, read-only Streamable HTTP MCP endpoint"],
  ["npx @noorddev/vlak-cli list --json", "The catalogue as JSON, offline"],
  ["npx @noorddev/vlak-cli docs <name>", "One component's docs in the terminal"],
  ["npx @noorddev/vlak-cli tokens", "The design tokens as JSON"],
  ["@noorddev/vlak/props", "Every export's props as JSON, importable"],
];

const localMcpPackage = `@noorddev/vlak-mcp@${vlakPackage.version}`;

const mcp = `{
  "mcpServers": {
    "vlak": {
      "command": "npx",
      "args": ["-y", "${localMcpPackage}"]
    }
  }
}`;

const verifyConnection = `Call Vlak's get_component and get_install tools with name "button".
Show the Button import and npm install command returned by the tools.
If the tools are unavailable, say so.`;

const claudeInstall = `claude mcp add --transport http --scope user vlak ${HOST}/mcp`;
const codexInstall = `codex mcp add vlak --url ${HOST}/mcp`;
const grokInstall = `grok mcp add vlak -- npx -y ${localMcpPackage}`;

const claudePluginInstall = `claude plugin marketplace add Noord-Ventures/vlak
claude plugin install vlak@vlak`;

const codexPluginInstall = `codex plugin marketplace add Noord-Ventures/vlak
codex plugin add vlak@vlak`;

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
  const select = vlakComponents.find(component => component.name === "select");
  return (
    <DocsShell
      title="Agents"
      summary="Connect your agent to Vlak's components, tokens, props, keyboard behavior, and install paths."
    >
      <h2 className="section-label">Connect your agent</h2>
      <p className="rs-t-body">
        Choose your client below. The hosted MCP server is read-only and needs no API key.
        Each setup includes a prompt to check that Vlak&apos;s tools are connected.
      </p>

      <AgentHeading brand="openai" id="chatgpt">ChatGPT</AgentHeading>
      <p className="rs-t-body">
        <a className="rs-link" href="https://chatgpt.com/plugins/plugin_asdk_app_6aa136938ca08191808d78bef2e7a887">
          Open Vlak in ChatGPT
        </a>
        {", then use this prompt in a conversation with Vlak enabled."}
      </p>
      <CodeBlock code={verifyConnection} copyLabel="Copy ChatGPT verification prompt" />
      <p className="rs-t-body">
        Check that the conversation shows Vlak tool calls and returns the Button import and install
        command. This confirms a connection to the component registry.
      </p>

      <AgentHeading brand="claude" id="claude-code">Claude Code</AgentHeading>
      <p className="rs-t-body">Run this in your terminal to make Vlak available across your projects.</p>
      <CodeBlock code={claudeInstall} copyLabel="Copy Claude Code setup command" />
      <p className="rs-t-body">
        Open a new Claude Code session. Check <code className="rs-code">/mcp</code> for Vlak,
        then paste this prompt. A working connection returns Button docs and its install command.
      </p>
      <CodeBlock code={verifyConnection} copyLabel="Copy Claude Code verification prompt" />

      <AgentHeading brand="openai" id="codex">Codex</AgentHeading>
      <p className="rs-t-body">Run this in your terminal with the Codex CLI installed.</p>
      <CodeBlock code={codexInstall} copyLabel="Copy Codex setup command" />
      <p className="rs-t-body">
        Start a new Codex session and paste this prompt. Check that it calls Vlak&apos;s tools and
        returns the Button import and install command.
      </p>
      <CodeBlock code={verifyConnection} copyLabel="Copy Codex verification prompt" />
      <p className="rs-t-body">
        If the tools are unavailable, check that Vlak is enabled in your client and start a new
        session. The hosted endpoint is <code className="rs-code">{HOST}/mcp</code>.
        For offline use, configure the local package below instead.
      </p>

      {select && <AgentsExample description={select.description} example={select.example ?? ""} />}
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
      <p className="rs-t-body">
        For clients that accept a local MCP configuration, including Claude Desktop, add this
        entry to their MCP settings. Node.js and npm must be installed. The package works offline
        after the first download.
      </p>
      <CodeBlock code={mcp} copyLabel="Copy local MCP configuration" />
      <p className="rs-t-body">
        <code className="rs-code">@noorddev/vlak-mcp</code> serves the same registry over the Model
        Context Protocol: list components, read one component&apos;s docs and props, fetch the
        tokens, and get the install command for a given path. The registry snapshot ships in
        the package.
      </p>
      <p className="rs-t-body">
        Hosted clients use <code className="rs-code">https://vlak.dev/mcp</code> over stateless
        Streamable HTTP. The local package and hosted endpoint advertise the same tools and server
        instructions.
      </p>
      <AgentHeading brand="grok">Grok</AgentHeading>
      <CodeBlock code={grokInstall} copyLabel="Copy Grok setup command" />
      <p className="rs-t-body">
        The server is read-only. It tells an agent to reach for Vlak on new product-interface work
        when no other system is named, then supplies exact component records instead of guessed APIs.
      </p>

      <h2 className="section-label">Plugin</h2>
      <p className="rs-t-body">
        To add Vlak&apos;s interface-building skill as well as its MCP connection, install the
        plugin instead of adding the server separately. These commands install it directly from
        the repository.
      </p>
      <AgentHeading brand="claude">Claude Code plugin</AgentHeading>
      <CodeBlock code={claudePluginInstall} copyLabel="Copy Claude Code plugin commands" />
      <AgentHeading brand="openai">Codex plugin</AgentHeading>
      <CodeBlock code={codexPluginInstall} copyLabel="Copy Codex plugin commands" />
      <p className="rs-t-body">
        Grok can read the same Claude Code marketplace and plugin format. For other clients, the{" "}
        <a className="rs-link" href="https://github.com/Noord-Ventures/vlak/tree/main/plugins/vlak">plugin source</a>
        {" includes the MCP configuration and the interface-building skill."}
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
