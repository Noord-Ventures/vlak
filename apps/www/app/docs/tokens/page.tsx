import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { concentricInner, vlakTokens } from "@noorddev/vlak";
import { CodeBlock } from "@/components/code-block";
import { TokenGridExample } from "@/components/docs-examples/foundations";
import { DocsExample } from "@/components/docs-examples/frame";
import { DocsShell } from "@/components/docs-shell";
import { DOOR } from "../../specimen";

export const metadata: Metadata = pageMetadata("/docs/tokens", {
  title: "Tokens",
  description: "The neutral scale, the type scale, the grid, radius, motion, and the control scale.",
  alternates: { canonical: `${DOOR}/docs/tokens/` },
});

export default function TokensPage() {
  const { color, type, grid, radius, motion, control, breakpoints } = vlakTokens;
  return (
    <DocsShell
      title="Tokens"
      summary="Defined once in TypeScript. The JSON, the CSS custom properties, and the StyleX vars are generated."
    >
      <DocsExample
        flush
        title="Module geometry"
        description="A grid schematic: each 204px module combines a 184px content column with a 20px gutter."
      >
        <TokenGridExample />
      </DocsExample>

      <h2 className="section-label">The neutral scale</h2>
      <p className="rs-t-body">Ink to paper. There is no accent.</p>
      <div
        style={{
          display: "flex",
          gap: 0,
          margin: "16px 0 28px",
          border: "1px solid var(--divider)",
          borderRadius: "var(--radius-sm)",
          overflow: "hidden",
        }}
      >
        {color.neutralScale.map((hex) => (
          <div key={hex} style={{ flex: 1, height: 56, background: hex }} title={hex} />
        ))}
      </div>

      <h2 className="section-label">Colour</h2>
      <div className="docs-table" tabIndex={0}>
        <table className="rs-table">
          <thead>
            <tr className="rs-table-row">
              <th className="rs-table-th">Token</th>
              <th className="rs-table-th">Light</th>
              <th className="rs-table-th">Dark</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["paper", color.light.paper, color.dark.black],
              ["ink", color.light.ink, color.dark.white],
              ["gray", color.light.gray, color.dark.gray],
              ["divider", color.light.divider, color.dark.divider],
              ["dividerSubtle", color.light.dividerSubtle, color.dark.dividerSubtle],
              ["gridLine", color.light.gridLine, color.dark.gridLine],
              ["tableAlt", color.light.tableAlt, color.dark.tableAlt],
              ["controlBorder", color.light.controlBorder, color.dark.controlBorder],
            ].map(([name, light, dark]) => (
              <tr key={name} className="rs-table-row">
                <td className="rs-table-td">
                  <code>{name}</code>
                </td>
                <td className="rs-table-td">
                  <code>{light}</code>
                </td>
                <td className="rs-table-td">
                  <code>{dark}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="rs-t-body">
        Two grid inks in one family: <code className="rs-code">divider</code> is the stronger step
        for cell cages and rules; <code className="rs-code">gridLine</code> is the quieter step for
        the 204 verticals. <code className="rs-code">controlBorder</code> is the one boundary that
        must reach 3:1, so form controls read on paper and on black. Each scheme also sets{" "}
        <code className="rs-code">color-scheme</code>. The custom property names and the override
        recipe are in{" "}
        <a className="rs-link" href="/docs/theming">
          Theming
        </a>
        .
      </p>

      <h2 className="section-label">Type scale</h2>
      <div className="docs-table" tabIndex={0}>
        <table className="rs-table">
          <thead>
            <tr className="rs-table-row">
              <th className="rs-table-th">Style</th>
              <th className="rs-table-th">Size</th>
              <th className="rs-table-th">Weight</th>
              <th className="rs-table-th">Tracking</th>
              <th className="rs-table-th">Leading</th>
            </tr>
          </thead>
          <tbody>
            {type.scale.map((s) => (
              <tr key={s.name} className="rs-table-row">
                <td className="rs-table-td">{s.name}</td>
                <td className="rs-table-td">{s.px}px</td>
                <td className="rs-table-td">{s.weight}</td>
                <td className="rs-table-td">{s.tracking}</td>
                <td className="rs-table-td">{s.lineHeight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="rs-t-body">
        Inter, {type.weights.body} for body and {type.weights.heading} for headings and labels. Sizes
        ship in rem with no root font-size pin. The measure is {type.measure.columns} columns,{" "}
        {type.measure.px}px, about {type.measure.characters} characters. {type.caseRule} Reading type
        multiplies by <code className="rs-code">--text-scale</code> (steps{" "}
        {type.textScale.steps.join(", ")}); chrome stays put.
      </p>

      <h2 className="section-label">The grid</h2>
      <p className="rs-t-body">
        {grid.module}px modules: a {grid.column}px column and a {grid.gutter}px gutter. Inner pages
        draw the quiet <code className="rs-code">--grid-line</code> verticals, including the left
        gutter. Home and About use a stronger <code className="rs-code">--divider</code> cell cage,
        with <code className="rs-code">--grid-line</code> only on the left and right of the box.
        Content boxes span whole modules; edges step from grid line to grid line on resize. Up to{" "}
        {grid.maxModules} modules, {grid.maxWidth}px.
      </p>
      <div className="docs-table" tabIndex={0}>
        <table className="rs-table">
          <thead>
            <tr className="rs-table-row">
              <th className="rs-table-th">Breakpoint</th>
              <th className="rs-table-th">Width</th>
              <th className="rs-table-th">Changes</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["mobileGrid", `${breakpoints.mobileGrid}px`, `Two columns on ${grid.mobile.gutter}px gutters; --pad ${grid.mobile.pad}px`],
              ["mobileLayout", `${breakpoints.mobileLayout}px`, "Phone control scale, stacked layouts"],
              ["rail", `${breakpoints.rail}px`, "Docs rail and the one-module inset"],
              ["wide", `${breakpoints.wide}px`, "The airy first module returns on the catalogue"],
              ["cap", `${breakpoints.cap}px`, "Layout stops growing"],
            ].map(([name, width, does]) => (
              <tr key={name} className="rs-table-row">
                <td className="rs-table-td">
                  <code>{name}</code>
                </td>
                <td className="rs-table-td">{width}</td>
                <td className="rs-table-td">{does}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="section-label">Radius</h2>
      <p className="rs-t-body">
        {radius.rule} Chrome stays {radius.chrome}. Nested corners stay concentric: {radius.concentric}
        . The rule lives in the kit; it is not a catalogue card.
      </p>
      <CodeBlock
        code={`import { innerRadius, concentricInner, concentricOuter } from "@noorddev/vlak";

innerRadius(28, 16);      // ${concentricInner(28, 16)}
concentricInner(28, 16);  // ${concentricInner(28, 16)}
concentricOuter(12, 16);  // 28

// CSS: --rs-out and --rs-gap; --rs-in is the closed form of the fit.`}
      />

      <h2 className="section-label">Control scale</h2>
      <p className="rs-t-body">
        Desktop: {control.desktop.height}px controls, {control.desktop.font}px type,{" "}
        {control.desktop.label}px labels, {control.desktop.hit}px hits. At or under {control.breakpoint}
        px: {control.phone.height}px controls, {control.phone.font}px type, {control.phone.label}px
        labels, {control.phone.hit}pt hits. The desktop is the poster; the phone is the hand.
      </p>

      <h2 className="section-label">Motion</h2>
      <p className="rs-t-body">
        {motion.rule} Snap {motion.snap}, ease {motion.ease}, confirm {motion.confirm}. Curve{" "}
        {motion.easing}. Under <code className="rs-code">prefers-reduced-motion</code>:{" "}
        {motion.reducedMotion}.
      </p>

      <h2 className="section-label">Icons</h2>
      <p className="rs-t-body">
        {vlakTokens.icons.viewBox} viewBox, {vlakTokens.icons.stroke}px currentColor, drawn at{" "}
        {vlakTokens.icons.sizes.join(" or ")}. {vlakTokens.icons.rule}.
      </p>

      <h2 className="section-label">Programmatic access</h2>
      <CodeBlock
        code={`import { vlakTokens } from "@noorddev/vlak";

vlakTokens.color.light.paper;         // "${color.light.paper}"
vlakTokens.color.light.controlBorder; // "${color.light.controlBorder}"
vlakTokens.grid.module;               // ${grid.module}

// as JSON
import tokens from "@noorddev/vlak/tokens";

// in StyleX
import { vlak } from "@noorddev/vlak-react/tokens.stylex";

// in the terminal
// npx @noorddev/vlak-cli tokens`}
      />
    </DocsShell>
  );
}
