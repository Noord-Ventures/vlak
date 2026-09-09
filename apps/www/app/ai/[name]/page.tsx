import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalogComponents, type VlakComponent, type VlakExport, type VlakPropsJson } from "@noorddev/vlak";
import propsJson from "@noorddev/vlak/props";
import { AiShell } from "@/components/ai-shell";
import { CodeBlock } from "@/components/code-block";
import { InAction } from "@/components/examples/scene";
import { Preview } from "@/components/preview";
import { StructuredData, breadcrumbData } from "@/components/structured-data";
import { aiComponents as components, aiPages } from "@/lib/ai-catalog";
import { pageMetadata } from "@/lib/page-metadata";
import { reactUsage } from "@/lib/react-usage";
import { COMMAND, HOST, INSTALL } from "@/app/specimen";

const props = propsJson as VlakPropsJson;

export const dynamicParams = false;

export function generateStaticParams() {
  return components.map((component) => ({ name: component.name }));
}

function getComponent(name: string) {
  const component = components.find((entry) => entry.name === name);
  if (!component) notFound();
  return component;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const component = getComponent(name);
  return pageMetadata(`/ai/${name}`, {
    title: component.title,
    description: component.description,
  });
}

function importedNames(component: VlakComponent, example: string | undefined, exports: VlakExport[]) {
  const entryPoint = component.reactImport ?? "@noorddev/vlak-react";
  const match = [...(example?.matchAll(/import\s*\{([^}]*)\}\s*from\s*"([^"]+)"/g) ?? [])].find(match => match[2] === entryPoint);
  if (match?.[1]) return match[1].split(",").map((name) => name.trim()).filter(Boolean);
  const names = exports.filter((entry) => entry.kind === "component" || entry.kind === "function").map((entry) => entry.name);
  return names.length > 0 ? names : [component.name.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("")];
}

function componentHref(name: string) {
  return `${components.some((component) => component.name === name) ? "/ai" : "/components"}/${name}/`;
}

function PropsTable({ entry }: { entry: VlakExport }) {
  const heading = `props-${entry.name}`;
  return (
    <>
      <h3 id={heading} className="docs-sub">
        {entry.name}{entry.kind !== "component" ? ` (${entry.kind})` : null}
      </h3>
      {entry.description ? <p className="rs-t-body">{entry.description}</p> : null}
      {entry.props.length > 0 ? (
        <div className="docs-table" role="region" aria-labelledby={heading} tabIndex={0}>
          <table className="rs-table" aria-labelledby={heading}>
            <thead>
              <tr className="rs-table-row">
                <th className="rs-table-th" scope="col">Prop</th>
                <th className="rs-table-th" scope="col">Type</th>
                <th className="rs-table-th" scope="col">Default</th>
                <th className="rs-table-th" scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              {entry.props.map((prop) => (
                <tr key={prop.name} className="rs-table-row">
                  <td className="rs-table-td">
                    <code>{prop.name}</code>
                    {prop.required ? <span className="docs-required">required</span> : null}
                  </td>
                  <td className="rs-table-td"><code>{prop.type}</code></td>
                  <td className="rs-table-td">{prop.default ? <code>{prop.default}</code> : null}</td>
                  <td className="rs-table-td">{prop.description ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {entry.extends ? (
        <p className="docs-extends">Also accepts <code className="rs-code">{entry.extends}</code>.</p>
      ) : null}
      {entry.ref ? (
        <p className="docs-extends">The ref reaches <code className="rs-code">{entry.ref}</code>.</p>
      ) : null}
    </>
  );
}

export default async function AiComponentPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const component = getComponent(name);
  const example = component.example ?? reactUsage[name];
  const exports = props.components[name]?.exports ?? [];
  const names = importedNames(component, example, exports);
  const usage = component.usage;
  const keyboard = component.keyboard ?? [];
  const a11y = component.a11y ?? [];
  const dependencies = component.registryDependencies ?? [];
  const related = aiPages.filter((entry) => entry.href !== "/ai" && entry.href !== `/ai/${name}`);
  const packageSetup = [`import "@noorddev/vlak-react/css";`, ...(component.styles ?? []).map(style => `import "${style}";`), `import { ${names.join(", ")} } from "${component.reactImport ?? "@noorddev/vlak-react"}";`].join("\n");

  return (
    <AiShell wide title={component.title} summary={component.description}>
      <StructuredData value={[
        breadcrumbData([
          { name: "Vlak", url: `${HOST}/` },
          { name: "AI", url: `${HOST}/ai/` },
          { name: component.title, url: `${HOST}/ai/${name}/` },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: `${component.title} React component`,
          description: component.description,
          url: `${HOST}/ai/${name}/`,
          isPartOf: { "@id": `${HOST}/#website` },
          about: ["React", "accessibility", "AI interfaces"],
        },
      ]} />

      <section aria-labelledby="preview">
        <h2 id="preview" className="section-label">Preview</h2>
        <div className={`preview-box ai-component-preview${name === "chat" ? " ai-component-own-frame" : ""}`}>
          <Preview name={name} snippet={component.snippet} />
        </div>
      </section>

      <section aria-labelledby="in-action">
        <h2 id="in-action" className="section-label">In action</h2>
        <div className={`ai-component-example${name === "chat" ? " ai-component-own-frame" : ""}`}><InAction name={name} /></div>
      </section>

      {usage && (usage.use.length > 0 || usage.avoid.length > 0) ? (
        <section aria-labelledby="when-to-use">
          <h2 id="when-to-use" className="section-label">When to use</h2>
          <div className="docs-cols">
            {usage.use.length > 0 ? (
              <div>
                <h3 className="docs-sub">Use it for</h3>
                <ul className="docs-list">{usage.use.map((line) => <li key={line}>{line}</li>)}</ul>
              </div>
            ) : null}
            {usage.avoid.length > 0 ? (
              <div>
                <h3 className="docs-sub">Avoid</h3>
                <ul className="docs-list">{usage.avoid.map((line) => <li key={line}>{line}</li>)}</ul>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="install">
        <h2 id="install" className="section-label">Install</h2>
        <h3 className="docs-sub">React package</h3>
        <CodeBlock code={`${INSTALL}${component.dependencies?.length ? ` ${component.dependencies.join(" ")}` : ""}`} />
        <p className="rs-t-body">Load the stylesheet once at your app root, then import the components you use.</p>
        <CodeBlock code={packageSetup} />
        <p className="rs-t-body">
          Per-component imports are available at <code className="rs-code">@noorddev/vlak-react/{component.react?.replace(/\.tsx?$/, "") ?? `components/${name}`}</code>.
        </p>
        <h3 className="docs-sub">Copy the source</h3>
        <CodeBlock code={COMMAND.replace("init", `add ${name}`)} />
        <p className="rs-t-body">
          Adds the component{dependencies.length > 0 ? " and its dependencies" : ""} to <code className="rs-code">components/vlak/</code>.
          {" "}Follow the <a className="rs-link" href="/docs/stylex/">StyleX setup</a> to compile the source in your application.
        </p>
        <h3 className="docs-sub">shadcn registry</h3>
        <CodeBlock code={`npx shadcn add ${HOST}/r/${name}.json`} />
        <p className="rs-t-body">Installs the same source through the shadcn CLI.</p>
      </section>

      {example ? (
        <section aria-labelledby="react">
          <h2 id="react" className="section-label">React</h2>
          <CodeBlock code={example} />
          <p className="rs-t-body">
            See the <a className="rs-link" href="/ai/#integration">integration example</a> to compose these components with your application&apos;s model and data.
          </p>
        </section>
      ) : null}

      {exports.length > 0 ? (
        <section aria-labelledby="props">
          <h2 id="props" className="section-label">Props</h2>
          {exports.map((entry) => <PropsTable key={entry.name} entry={entry} />)}
        </section>
      ) : null}

      {keyboard.length > 0 ? (
        <section aria-labelledby="keyboard">
          <h2 id="keyboard" className="section-label">Keyboard</h2>
          <div className="docs-table" role="region" aria-label={`${component.title} keyboard controls`} tabIndex={0}>
            <table className="rs-table" aria-labelledby="keyboard">
              <thead>
                <tr className="rs-table-row">
                  <th className="rs-table-th" scope="col">Keys</th>
                  <th className="rs-table-th" scope="col">Does</th>
                </tr>
              </thead>
              <tbody>
                {keyboard.map((row) => (
                  <tr key={`${row.keys}:${row.does}`} className="rs-table-row">
                    <td className="rs-table-td"><kbd className="rs-kbd">{row.keys}</kbd></td>
                    <td className="rs-table-td">{row.does}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {a11y.length > 0 ? (
        <section aria-labelledby="accessibility">
          <h2 id="accessibility" className="section-label">Accessibility</h2>
          <ul className="docs-list">{a11y.map((line) => <li key={line}>{line}</li>)}</ul>
        </section>
      ) : null}

      <section aria-labelledby="markup">
        <h2 id="markup" className="section-label">Markup</h2>
        <p className="rs-t-body">
          The same styles are available as CSS. Native HTML provides the static presentation; React or application code supplies state updates and actions.
        </p>
        <CodeBlock code="npm install @noorddev/vlak" />
        <CodeBlock code={'import "@noorddev/vlak/css";'} />
        <CodeBlock code={component.snippet} />
        <h3 className="docs-sub">Classes</h3>
        <div className="class-list">
          {component.classes.map((className) => <span key={className} className="rs-chip">.{className}</span>)}
        </div>
      </section>

      {dependencies.length > 0 ? (
        <section aria-labelledby="dependencies">
          <h2 id="dependencies" className="section-label">Depends on</h2>
          <div className="class-list">
            {dependencies.map((dependency) => (
              <a key={dependency} className="rs-chip" href={componentHref(dependency)}>
                {catalogComponents.find((entry) => entry.name === dependency)?.title ?? dependency}
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="resources">
        <h2 id="resources" className="section-label">Use elsewhere</h2>
        <div className="class-list">
          <a className="rs-chip" href={`/docs/${name}.md`}>Markdown</a>
          <a className="rs-chip" href={`/r/${name}.json`}>Registry item</a>
          <a className="rs-chip" href={`https://github.com/Noord-Ventures/vlak/tree/main/packages/react/src/${component.react ?? `components/${name}.tsx`}`}>Source</a>
        </div>
      </section>

      <section aria-labelledby="related">
        <h2 id="related" className="section-label">More in AI</h2>
        <div className="class-list">
          {related.map((entry) => <a key={entry.href} className="rs-chip" href={`${entry.href}/`}>{entry.title}</a>)}
        </div>
      </section>
    </AiShell>
  );
}
