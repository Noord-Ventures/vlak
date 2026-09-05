import type { Metadata } from "next";
import { Callout } from "@noorddev/vlak-react";
import { CodeBlock } from "@/components/code-block";
import { DocsShell } from "@/components/docs-shell";
import { COMMAND, DOOR, HOST, INSTALL, LAW } from "../specimen";

export const metadata: Metadata = {
  title: "Getting started",
  description: LAW,
  alternates: { canonical: `${DOOR}/docs/` },
};

const packageUsage = `// app/layout.tsx, main.tsx, or wherever your app starts
import "@noorddev/vlak-react/css";

// anywhere
import { Button, Field, FieldLabel, Input } from "@noorddev/vlak-react";

export function Invoice() {
  return (
    <form>
      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input plain id="name" />
      </Field>
      <Button type="submit">Send</Button>
    </form>
  );
}`;

const cssUsage = `<link rel="stylesheet" href="node_modules/@noorddev/vlak/css/vlak.css" />

<button class="rs-btn-primary">Primary action</button>
<button class="rs-btn-ghost">Secondary</button>`;

export default function DocsPage() {
  return (
    <DocsShell
      title="Getting started"
      summary="Install precompiled React components, vendor the StyleX source, or use the CSS classes directly. All three are generated from the same leaves."
    >
      <h2 className="section-label">1. Install the React package</h2>
      <CodeBlock code={INSTALL} />
      <CodeBlock code={packageUsage} />
      <p className="rs-t-body">
        Import the stylesheet once, then import components where you use them. The stylesheet is 42 KB
        (12 KB gzipped) and carries the tokens, the page base, the type scale, and every component.
        Inter (SIL OFL 1.1) loads from the package; there is no Google Fonts request and no compiler
        to configure.
      </p>
      <p className="rs-t-body">
        Every component also has a direct export, so you can import only the module you need: <code className="rs-code">import {"{ Button }"} from
        &quot;@noorddev/vlak-react/components/button&quot;</code>. Stateful components already
        carry <code className="rs-code">&quot;use client&quot;</code>; import them from a React
        Server Components tree without a wrapper. Requirements: React 18 or 19.
      </p>

      <h2 className="section-label">2. Vendor with the CLI</h2>
      <CodeBlock code={`${COMMAND}\n${COMMAND.replace("init", "add button dialog")}`} />
      <p className="rs-t-body">
        <code className="rs-code">init</code> writes{" "}
        <code className="rs-code">styles/vlak.css</code>, Inter, a specimen{" "}
        <code className="rs-code">index.html</code>, and <code className="rs-code">vlak.json</code>.{" "}
        Then <code className="rs-code">add</code> copies a component&apos;s StyleX leaf and its
        dependencies into <code className="rs-code">components/vlak/</code> for your own compiler
        to own. Works offline; the registry ships inside the CLI.
      </p>
      <CodeBlock code={`npx shadcn add ${HOST}/r/button.json`} />
      <p className="rs-t-body">
        The same registry serves shadcn&apos;s CLI. Every component is an item at{" "}
        <code className="rs-code">{HOST}/r/&lt;name&gt;.json</code>. Vendored leaves need a StyleX
        compile; see{" "}
        <a className="rs-link" href="/docs/stylex">
          StyleX
        </a>
        .
      </p>

      <h2 className="section-label">3. Use CSS only</h2>
      <CodeBlock code="npm install @noorddev/vlak" />
      <CodeBlock code={cssUsage} />
      <p className="rs-t-body">
        No React. <code className="rs-code">vlak.css</code> is 84 KB (14 KB gzipped) and paints
        every component through <code className="rs-code">rs-*</code> classes on plain markup. It is
        generated from the same StyleX leaves as the React package, so the two never drift. Each
        component page shows its markup and classes. Individual files are exported too:{" "}
        <code className="rs-code">@noorddev/vlak/css/tokens.css</code>,{" "}
        <code className="rs-code">@noorddev/vlak/css/components/button.css</code>.
      </p>

      <Callout>
        <p className="rs-t-label">One source of paint</p>
        <p className="rs-t-body">
          Every component is a StyleX leaf. The React package ships it compiled with one stylesheet;
          vlak.css is projected from the same leaf onto rs-* classes; vendoring gives you the leaf
          itself. Import the package, link the CSS, or keep the source in your repository.
        </p>
      </Callout>

      <h2 className="section-label">Dark scheme</h2>
      <CodeBlock code={`<html data-theme="dark">`} />
      <p className="rs-t-body">
        Set <code className="rs-code">data-theme=&quot;dark&quot;</code> on the root element.
        Without it the system preference applies; <code className="rs-code">data-theme=&quot;light&quot;</code>{" "}
        pins light. <code className="rs-code">color-scheme</code> follows, so native controls and
        scrollbars match. Details in{" "}
        <a className="rs-link" href="/docs/theming">
          Theming
        </a>
        .
      </p>

      <h2 className="section-label">What the stylesheet contains</h2>
      <p className="rs-t-body">
        Six cascade layers, in order: <code className="rs-code">vlak.tokens</code>,{" "}
        <code className="rs-code">vlak.base</code>, <code className="rs-code">vlak.type</code>,{" "}
        <code className="rs-code">vlak.components</code>, <code className="rs-code">vlak.touch</code>,{" "}
        <code className="rs-code">vlak.motion</code>. Your own CSS is unlayered, so it wins without{" "}
        <code className="rs-code">!important</code>. See{" "}
        <a className="rs-link" href="/docs/layers">
          Layers
        </a>
        .
      </p>

      <h2 className="section-label">The typeface</h2>
      <p className="rs-t-body">
        Inter, SIL OFL 1.1. The variable face, latin and latin-ext, ships in both packages. System
        sans is fallback only. Weights: 500 body, 600 headings and labels.
      </p>

      <h2 className="section-label">Next</h2>
      <ul className="docs-list">
        <li>
          <a className="rs-link" href="/docs/frameworks">
            Frameworks
          </a>
          : Next.js, Vite, Remix and React Router, Astro, plain HTML.
        </li>
        <li>
          <a className="rs-link" href="/docs/theming">
            Theming
          </a>{" "}
          and{" "}
          <a className="rs-link" href="/docs/tokens">
            Tokens
          </a>
          : custom properties, the module grid, the text scale.
        </li>
        <li>
          <a className="rs-link" href="/docs/stylex">
            StyleX
          </a>
          : write your own leaves against Vlak tokens.
        </li>
        <li>
          <a className="rs-link" href="/docs/accessibility">
            Accessibility
          </a>
          : what every component commits to, and how to name things.
        </li>
        <li>
          <a className="rs-link" href="/docs/agents">
            Agents
          </a>
          : llms.txt, markdown docs, the registry, and the MCP server.
        </li>
        <li>
          <a className="rs-link" href="/components">
            Components
          </a>
          : every component, with props, keyboard, and markup.
        </li>
      </ul>
    </DocsShell>
  );
}
