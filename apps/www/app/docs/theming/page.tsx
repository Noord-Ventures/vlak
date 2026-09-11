import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { vlakTokens } from "@noorddev/vlak";
import { CodeBlock } from "@/components/code-block";
import { ThemeSandboxExample } from "@/components/docs-examples/foundations";
import { DocsExample } from "@/components/docs-examples/frame";
import { DocsShell } from "@/components/docs-shell";
import { DOOR } from "../../specimen";

export const metadata: Metadata = pageMetadata("/docs/theming", {
  title: "Theming",
  description: "Tokens as custom properties, the dark scheme, the module grid, and the text scale.",
  alternates: { canonical: `${DOOR}/docs/theming/` },
});

const { color, grid, radius, motion, control } = vlakTokens;

const properties: { name: string; light: string; dark?: string; does: string }[] = [
  { name: "--bg", light: color.light.paper, dark: color.dark.black, does: "Paper. The page and every surface." },
  { name: "--text", light: color.light.ink, dark: color.dark.white, does: "Ink. Type, borders of solid controls, focus rings." },
  { name: "--text-secondary", light: color.light.gray, dark: color.dark.gray, does: "Gray. Labels, hints, table cells." },
  { name: "--accent", light: color.light.ink, dark: color.dark.white, does: "Aliases ink. There is no hue in the system." },
  { name: "--divider", light: color.light.divider, dark: color.dark.divider, does: "Hairlines: rules, frames, table rows." },
  { name: "--divider-subtle", light: color.light.dividerSubtle, dark: color.dark.dividerSubtle, does: "Fills only: hover, skeleton, muted." },
  { name: "--grid-line", light: color.light.gridLine, dark: color.dark.gridLine, does: "The quiet 204 verticals behind inner pages." },
  { name: "--table-alt", light: color.light.tableAlt, dark: color.dark.tableAlt, does: "Alternate rows, code block ground." },
  { name: "--control-border", light: color.light.controlBorder, dark: color.dark.controlBorder, does: "Form control boundary. 3:1 against the ground." },
  { name: "--radius-sm", light: `${radius.small}px`, does: "Buttons, boxes, dialogs, sheets." },
  { name: "--radius", light: "var(--radius-sm)", does: "Alias of --radius-sm." },
  { name: "--radius-chrome", light: `${radius.chrome}px`, does: "Page chrome, cards, icon marks, charts." },
  { name: "--radius-in", light: "max(0px, calc(var(--radius) - var(--pad)))", does: "Concentric inner corner." },
  { name: "--pad", light: `${grid.pad}px`, does: "Box padding. 25px at or under 480px." },
  { name: "--gutter", light: `${grid.gutter}px`, does: "Gap between modules." },
  { name: "--grid-size", light: `${grid.module}px`, does: "The module: 184 column + 20 gutter." },
  { name: "--grid-image", light: "linear-gradient(…)", does: "The module verticals as a repeating gradient." },
  { name: "--grid-pos", light: "20px 0", does: "Where the gradient starts." },
  { name: "--hit", light: `${control.desktop.hit}px`, does: `Minimum hit target. ${control.phone.hit}px at or under ${control.breakpoint}px.` },
  { name: "--control-h", light: `${control.desktop.height}px`, does: `Control height. ${control.phone.height}px on the phone.` },
  { name: "--control-fs", light: `${control.desktop.font}px`, does: `Control type size. ${control.phone.font}px on the phone.` },
  { name: "--control-label", light: `${control.desktop.label}px`, does: `Field label size. ${control.phone.label}px on the phone.` },
  { name: "--duration-snap", light: motion.snap, does: "State changes the user caused." },
  { name: "--duration", light: motion.ease, does: "Easing changes." },
  { name: "--duration-confirm", light: motion.confirm, does: "Confirmations." },
  { name: "--ease", light: motion.easing, does: "The one curve." },
  { name: "--transition", light: "background-color, color", does: "The default transition pair." },
  { name: "--text-scale", light: "1", does: "Multiplier on reading type. Chrome stays put." },
];

const override = `/* your.css, unlayered: it wins over vlak.tokens */
:root {
  --bg: #FFFFFF;
  --radius-sm: 8px;
}
[data-theme="dark"] {
  --bg: #000000;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { --bg: #000000; }
}`;

const themeScript = `<script>
  (function () {
    var t = localStorage.getItem("vlak-theme");
    var dark = t === "dark" || (!t && matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.dataset.theme = "dark";
  })();
</script>`;

const gridCss = `/* Paint the module behind a page. base.css does this on body. */
.page {
  background-image: var(--grid-image);
  background-size: var(--grid-size) 100%;
  background-position: var(--grid-pos);
}

/* Boxes span whole modules: n × 204 − 20. */
.two-up { width: calc(2 * var(--grid-size) - var(--gutter)); }`;

export default function ThemingPage() {
  return (
    <DocsShell
      title="Theming"
      summary="Every token is a custom property on :root. Override it in unlayered CSS; the components follow."
    >
      <DocsExample
        flush
        title="Scoped token sandbox"
        description="Change the local scheme and control type scale. The rest of this page keeps its current theme."
      >
        <ThemeSandboxExample />
      </DocsExample>

      <h2 className="section-label">Custom properties</h2>
      <p className="rs-t-body">
        Defined once in TypeScript, generated into <code className="rs-code">tokens.css</code>, and
        read by every leaf through <code className="rs-code">var()</code>. The React stylesheet and
        vlak.css carry the same block. Light values below; dark where they differ.
      </p>
      <div className="docs-table" tabIndex={0}>
        <table className="rs-table">
          <thead>
            <tr className="rs-table-row">
              <th className="rs-table-th">Property</th>
              <th className="rs-table-th">Light</th>
              <th className="rs-table-th">Dark</th>
              <th className="rs-table-th">Does</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.name} className="rs-table-row">
                <td className="rs-table-td">
                  <code>{p.name}</code>
                </td>
                <td className="rs-table-td">
                  <code>{p.light}</code>
                </td>
                <td className="rs-table-td">{p.dark ? <code>{p.dark}</code> : ""}</td>
                <td className="rs-table-td">{p.does}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="section-label">Overriding tokens</h2>
      <CodeBlock code={override} />
      <p className="rs-t-body">
        Vlak&apos;s tokens sit in the <code className="rs-code">vlak.tokens</code> cascade layer.
        Author CSS outside any layer beats it, so a plain <code className="rs-code">:root</code> rule
        is the whole override. Set the dark value under{" "}
        <code className="rs-code">[data-theme=&quot;dark&quot;]</code> and, if you rely on the system
        preference, under the media query too. The palette is neutral by design; there is no accent
        token that takes a hue, and the test suite fails on one.
      </p>

      <h2 className="section-label">data-theme and color-scheme</h2>
      <p className="rs-t-body">
        Three states. No attribute: the system preference applies through{" "}
        <code className="rs-code">prefers-color-scheme</code>.{" "}
        <code className="rs-code">data-theme=&quot;dark&quot;</code>: dark.{" "}
        <code className="rs-code">data-theme=&quot;light&quot;</code>: light, even on a dark system.
        Each block also sets <code className="rs-code">color-scheme</code>, so native selects,
        scrollbars, and form chrome match the page.
      </p>
      <CodeBlock code={themeScript} />
      <p className="rs-t-body">
        To persist a choice without a flash, set the attribute before first paint. The{" "}
        <a className="rs-link" href="/components/theme-toggle">
          ThemeToggle
        </a>{" "}
        component stores its choice under <code className="rs-code">vlak-theme</code> in
        localStorage and sets the same attribute; the script above reads it back.
      </p>

      <h2 className="section-label">The module grid</h2>
      <CodeBlock code={gridCss} />
      <p className="rs-t-body">
        {grid.module}px modules: a {grid.column}px column and a {grid.gutter}px gutter. Content boxes
        span whole modules; edges step from grid line to grid line on resize. At or under{" "}
        {grid.mobile.breakpoint}px the field is two columns on {grid.mobile.gutter}px gutters and{" "}
        <code className="rs-code">--pad</code> becomes {grid.mobile.pad}px. Turn the verticals off with{" "}
        <code className="rs-code">--grid-image: none</code>.
      </p>

      <h2 className="section-label">Text scale</h2>
      <CodeBlock code={`html { --text-scale: 1.1; }  /* steps: ${vlakTokens.type.textScale.steps.join(", ")} */`} />
      <p className="rs-t-body">
        Reading type (<code className="rs-code">rs-t-*</code>) multiplies by{" "}
        <code className="rs-code">--text-scale</code>; controls, labels, and chrome stay put. The type
        scale is in rem with no root font-size pin, so a reader&apos;s browser setting applies as well.
      </p>

      <h2 className="section-label">Control scale</h2>
      <p className="rs-t-body">
        Desktop controls are {control.desktop.height}px tall with {control.desktop.font}px type. At or
        under {control.breakpoint}px every interactive control recuts to a {control.phone.hit}pt hit
        with {control.phone.font}px type, through <code className="rs-code">--hit</code>,{" "}
        <code className="rs-code">--control-h</code>, and <code className="rs-code">--control-fs</code>.
        Override those three to change the whole kit.
      </p>
    </DocsShell>
  );
}
