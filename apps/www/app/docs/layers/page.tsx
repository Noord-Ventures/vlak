import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { CascadeLayerExample } from "@/components/docs-examples/foundations";
import { DocsExample } from "@/components/docs-examples/frame";
import { DocsShell } from "@/components/docs-shell";
import { DOOR } from "../../specimen";

export const metadata: Metadata = pageMetadata("/docs/layers", {
  title: "Layers",
  description: "Six cascade layers, why your CSS wins without !important, and the rs-* class contract.",
  alternates: { canonical: `${DOOR}/docs/layers/` },
});

const layers = [
  { name: "vlak.tokens", holds: "Custom properties on :root, the dark block, color-scheme." },
  { name: "vlak.base", holds: "Reset, body, the module background, focus ring defaults, Inter." },
  { name: "vlak.type", holds: "The type scale: rs-t-display, rs-t-title, rs-t-body, rs-t-label." },
  { name: "vlak.components", holds: "Every component, projected from its StyleX leaf." },
  { name: "vlak.touch", holds: "The phone recut at or under 640px: 44pt hits, 16px control type." },
  { name: "vlak.motion", holds: "Transitions and the prefers-reduced-motion branch." },
];

const override = `/* your.css. No layer, no !important. */
.rs-btn-primary { border-radius: 8px; }
.rs-dialog { max-width: 592px; }
.rs-table-td { padding-block: 14px; }`;

const layered = `/* If you keep your own layers, declare Vlak's first and yours last. */
@layer vlak.tokens, vlak.base, vlak.type, vlak.components, vlak.touch, vlak.motion, app;

@import "@noorddev/vlak-react/css";

@layer app {
  .rs-btn-primary { border-radius: 8px; }
}`;

const contract = `<!-- Compiled StyleX classes change between builds. The rs-* names do not. -->
<button class="rs-btn-primary x1a2b3c x4d5e6f">Save</button>

/* Style, test, and measure against the contract */
.rs-btn-primary { … }
await page.click(".rs-btn-primary");`;

export default function LayersPage() {
  return (
    <DocsShell
      title="Layers"
      summary="All of Vlak's CSS sits in cascade layers. Unlayered author CSS wins by definition."
    >
      <DocsExample
        flush
        title="A real cascade"
        description="Remove and restore the later app layer. The readout comes from the browser's computed style."
      >
        <CascadeLayerExample />
      </DocsExample>

      <h2 className="section-label">The six layers</h2>
      <div className="docs-table" tabIndex={0}>
        <table className="rs-table">
          <thead>
            <tr className="rs-table-row">
              <th className="rs-table-th">Layer</th>
              <th className="rs-table-th">Holds</th>
            </tr>
          </thead>
          <tbody>
            {layers.map((l) => (
              <tr key={l.name} className="rs-table-row">
                <td className="rs-table-td">
                  <code>{l.name}</code>
                </td>
                <td className="rs-table-td">{l.holds}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="rs-t-body">
        Declared in that order at the top of both stylesheets, so a later layer beats an earlier one:
        touch beats components, motion beats everything Vlak paints. The React stylesheet and
        vlak.css use the same names, so a page can load both without a fight.
      </p>

      <h2 className="section-label">Why unlayered CSS wins</h2>
      <CodeBlock code={override} />
      <p className="rs-t-body">
        The cascade sorts by layer before specificity. Styles outside any layer beat styles inside
        one, whatever the selector. A single class in your stylesheet outranks a Vlak rule with
        pseudo-classes and media queries behind it. Nothing in Vlak uses{" "}
        <code className="rs-code">!important</code>; a test fails the build if it does.
      </p>

      <h2 className="section-label">Keeping your own layers</h2>
      <CodeBlock code={layered} />
      <p className="rs-t-body">
        If your project layers everything, name Vlak&apos;s layers before yours in one{" "}
        <code className="rs-code">@layer</code> statement that appears before the import. Order of
        first mention decides.
      </p>

      <h2 className="section-label">The rs-* classes are the contract</h2>
      <CodeBlock code={contract} />
      <p className="rs-t-body">
        Every component applies semantic <code className="rs-code">rs-*</code> classes next to its
        compiled StyleX atomics. The atomics are hashes and change between builds; the{" "}
        <code className="rs-code">rs-*</code> names are listed on each component page, in the
        registry, and in <code className="rs-code">/r/&lt;name&gt;.json</code>. A test enforces that
        every registry class is applied by the component&apos;s source and painted by its CSS. Use
        them for overrides, end-to-end selectors, and analytics; they are stable across the three
        install paths.
      </p>

      <h2 className="section-label">Overriding a component</h2>
      <p className="rs-t-body">
        Three levels, from broad to narrow. Change a token (
        <a className="rs-link" href="/docs/theming">
          Theming
        </a>
        ) and every component follows. Restyle a class, as above, and one component changes
        everywhere. Pass <code className="rs-code">className</code> or{" "}
        <code className="rs-code">style</code> to a React component and one instance changes; every
        component merges both onto its root element.
      </p>
    </DocsShell>
  );
}
