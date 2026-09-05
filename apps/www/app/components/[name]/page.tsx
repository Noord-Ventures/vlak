import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalogComponents, type VlakComponent, type VlakExport, type VlakPropsJson } from "@noorddev/vlak";
import propsJson from "@noorddev/vlak/props";
import { chrome } from "@/app/site.stylex";
import { CodeBlock } from "@/components/code-block";
import { DocsNav } from "@/components/docs-nav";
import { InAction } from "@/components/examples/scene";
import { Preview } from "@/components/preview";
import { reactUsage } from "@/lib/react-usage";
import { sx } from "@/lib/sx";
import { COMMAND, HOST, INSTALL } from "../../specimen";

const props = propsJson as VlakPropsJson;

export function generateStaticParams() {
  return catalogComponents.map((c) => ({ name: c.name }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const component = catalogComponents.find((c) => c.name === name);
  return { title: component?.title ?? "Components", description: component?.description };
}

function pascal(name: string) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/** The named imports a consumer needs: from the example's import line, else the props exports, else the title. */
function importedNames(component: VlakComponent, example: string | undefined, exports: VlakExport[]) {
  const match = example?.match(/import\s*\{([^}]*)\}\s*from\s*"@noorddev\/vlak-react"/);
  if (match?.[1]) {
    return match[1]
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
  }
  const fromProps = exports.filter((e) => e.kind === "component" || e.kind === "function").map((e) => e.name);
  if (fromProps.length > 0) return fromProps;
  return [pascal(component.name)];
}

function PropsTable({ entry }: { entry: VlakExport }) {
  return (
    <>
      <h3 className="docs-sub">
        {entry.name}
        {entry.kind !== "component" ? ` (${entry.kind})` : null}
      </h3>
      {entry.description ? <p className="rs-t-body">{entry.description}</p> : null}
      {entry.props.length > 0 ? (
        <div className="docs-table" tabIndex={0}>
          <table className="rs-table">
            <thead>
              <tr className="rs-table-row">
                <th className="rs-table-th">Prop</th>
                <th className="rs-table-th">Type</th>
                <th className="rs-table-th">Default</th>
                <th className="rs-table-th">Description</th>
              </tr>
            </thead>
            <tbody>
              {entry.props.map((prop) => (
                <tr key={prop.name} className="rs-table-row">
                  <td className="rs-table-td">
                    <code>{prop.name}</code>
                    {prop.required ? <span className="docs-required">required</span> : null}
                  </td>
                  <td className="rs-table-td">
                    <code>{prop.type}</code>
                  </td>
                  <td className="rs-table-td">{prop.default ? <code>{prop.default}</code> : null}</td>
                  <td className="rs-table-td">{prop.description ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {entry.extends ? (
        <p className="docs-extends">
          Also accepts <code className="rs-code">{entry.extends}</code>.
        </p>
      ) : null}
    </>
  );
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const component = catalogComponents.find((c) => c.name === name);
  if (!component) notFound();

  const example = component.example ?? reactUsage[component.name];
  const exports = props.components[component.name]?.exports ?? [];
  const names = importedNames(component, example, exports);
  const usage = component.usage;
  const keyboard = component.keyboard ?? [];
  const a11y = component.a11y ?? [];
  const deps = component.registryDependencies ?? [];

  const packageInstall = `${INSTALL}\n\n// once, next to your app's root\nimport "@noorddev/vlak-react/css";\n\nimport { ${names.join(", ")} } from "@noorddev/vlak-react";`;
  const cliInstall = `${COMMAND.replace("init", `add ${component.name}`)}`;
  const shadcnInstall = `npx shadcn add ${HOST}/r/${component.name}.json`;
  const cssInstall = `<link rel="stylesheet" href="node_modules/@noorddev/vlak/css/vlak.css" />`;

  return (
    <div className="site-layout">
      <DocsNav />
      <main id="main" {...sx("site-content", component.name === "icons" ? chrome.iconContent : chrome.content)}>
        <header {...sx("cover", chrome.cover)}>
          <h1 className="rs-t-display component-head">{component.title}</h1>
          <p className="rs-t-sub component-desc">{component.description}</p>
        </header>

        <h2 className="section-label">Preview</h2>
        <div className="preview-box">
          <Preview name={component.name} snippet={component.snippet} />
        </div>

        <h2 className="section-label">In action</h2>
        <InAction name={component.name} />

        {usage && (usage.use.length > 0 || usage.avoid.length > 0) ? (
          <>
            <h2 className="section-label">When to use</h2>
            <div className="docs-cols">
              {usage.use.length > 0 ? (
                <div>
                  <h3 className="docs-sub">Use it for</h3>
                  <ul className="docs-list">
                    {usage.use.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {usage.avoid.length > 0 ? (
                <div>
                  <h3 className="docs-sub">Not for</h3>
                  <ul className="docs-list">
                    {usage.avoid.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        <h2 className="section-label">Install</h2>
        <p className="rs-t-body">
          Three ways in. They share one source, so the pixels match whichever you pick.
        </p>
        <h3 className="docs-sub">1. Import the package</h3>
        <CodeBlock code={packageInstall} />
        <p className="rs-t-body">
          Precompiled React and one stylesheet. No compiler to configure. Per-component imports work
          too: <code className="rs-code">@noorddev/vlak-react/{component.react?.replace(/\.tsx?$/, "") ?? `components/${component.name}`}</code>.
        </p>
        <h3 className="docs-sub">2. Vendor the source</h3>
        <CodeBlock code={cliInstall} />
        <p className="rs-t-body">
          The StyleX leaf lands in <code className="rs-code">components/vlak/</code>
          {deps.length > 0 ? " with its dependencies" : ""}, for your own compiler to own. See{" "}
          <a className="rs-link" href="/docs/stylex">
            StyleX
          </a>
          .
        </p>
        <h3 className="docs-sub">3. Through shadcn</h3>
        <CodeBlock code={shadcnInstall} />
        <p className="rs-t-body">The same registry item, installed by shadcn&apos;s CLI.</p>
        <h3 className="docs-sub">CSS only</h3>
        <CodeBlock code={cssInstall} />
        <p className="rs-t-body">
          No React. Link <code className="rs-code">vlak.css</code> and use the markup and classes
          below.
        </p>

        {example ? (
          <>
            <h2 className="section-label">React</h2>
            <CodeBlock code={example} />
          </>
        ) : null}

        {exports.length > 0 ? (
          <>
            <h2 className="section-label">Props</h2>
            {exports.map((entry) => (
              <PropsTable key={entry.name} entry={entry} />
            ))}
          </>
        ) : null}

        {keyboard.length > 0 ? (
          <>
            <h2 className="section-label">Keyboard</h2>
            <div className="docs-table" tabIndex={0}>
              <table className="rs-table">
                <thead>
                  <tr className="rs-table-row">
                    <th className="rs-table-th">Keys</th>
                    <th className="rs-table-th">Does</th>
                  </tr>
                </thead>
                <tbody>
                  {keyboard.map((row) => (
                    <tr key={row.keys} className="rs-table-row">
                      <td className="rs-table-td">
                        <kbd className="rs-kbd">{row.keys}</kbd>
                      </td>
                      <td className="rs-table-td">{row.does}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}

        {a11y.length > 0 ? (
          <>
            <h2 className="section-label">Accessibility</h2>
            <ul className="docs-list">
              {a11y.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </>
        ) : null}

        <h2 className="section-label">Markup</h2>
        <CodeBlock code={component.snippet} />

        <h2 className="section-label">Classes</h2>
        <div className="class-list">
          {component.classes.map((cls) => (
            <span key={cls} className="rs-chip">
              .{cls}
            </span>
          ))}
        </div>

        {deps.length > 0 && (
          <>
            <h2 className="section-label">Depends on</h2>
            <div className="class-list">
              {deps.map((dep) => (
                <a key={dep} href={`/components/${dep}`} className="rs-chip">
                  /{dep}
                </a>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
