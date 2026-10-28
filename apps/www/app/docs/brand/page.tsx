import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { DocsExample } from "@/components/docs-examples/frame";
import { DocsShell } from "@/components/docs-shell";
import { DOOR } from "../../specimen";
import "./brand.css";

export const metadata: Metadata = pageMetadata("/docs/brand", {
  title: "Brand on Vlak",
  description: "Five custom properties let a product wear its brand: accent, primary buttons, and two typefaces. Everything else stays fixed.",
  alternates: { canonical: `${DOOR}/docs/brand/` },
});

const hooks = [
  { name: "--accent", fallback: "ink", does: "Links, outline badges, the edge of a focused field." },
  { name: "--action", fallback: "ink", does: "Fill of the primary button." },
  { name: "--action-text", fallback: "paper", does: "The label on that fill." },
  { name: "--font-sans", fallback: "Inter", does: "Body text and controls." },
  { name: "--font-display", fallback: "--font-sans", does: "The display, display XL and title steps of the type scale." },
];

/** The override for a sample brand: AEEG, accent #A04A2A, primary buttons #D4A24C, headings in Rethink Sans. */
const aeeg = `:root{
  --bg:#F8F4EE;
  --text:#1C1B1B;
  --text-secondary:#6B6B6B;
  --accent:#A04A2A;
  --rs-chart-spot:#A04A2A;
  --action:#D4A24C;
  --action-text:#1C1B1B;
  --divider:rgba(28,27,27,0.08);
  --divider-subtle:rgba(28,27,27,0.06);
  --table-alt:rgba(28,27,27,0.02);
  --grid-line:rgba(28,27,27,0.04);
  --control-border:rgba(28,27,27,0.42);
  --control-fill:#E2DDD6;
  --font-sans:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
  --font-display:"Rethink Sans",Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
  --fg:var(--text);
  --muted:var(--text-secondary);
  --border:var(--divider);
  --surface:var(--control-fill);
  --accent-fg:#FFFFFF;
}
[data-theme="dark"]{
  --bg:#100D0B;
  --text:#E7E5E4;
  --text-secondary:#949494;
  --accent:#BA6242;
  --rs-chart-spot:#BA6242;
  --action:#D4A24C;
  --action-text:#100D0B;
  --divider:rgba(231,229,228,0.1);
  --divider-subtle:rgba(231,229,228,0.07);
  --table-alt:rgba(231,229,228,0.03);
  --grid-line:rgba(231,229,228,0.05);
  --control-border:rgba(231,229,228,0.38);
  --control-fill:#282321;
  --font-sans:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
  --font-display:"Rethink Sans",Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
  --fg:var(--text);
  --muted:var(--text-secondary);
  --border:var(--divider);
  --surface:var(--control-fill);
  --accent-fg:#100D0B;
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){
    --bg:#100D0B;
    --text:#E7E5E4;
    --text-secondary:#949494;
    --accent:#BA6242;
    --rs-chart-spot:#BA6242;
    --action:#D4A24C;
    --action-text:#100D0B;
    --divider:rgba(231,229,228,0.1);
    --divider-subtle:rgba(231,229,228,0.07);
    --table-alt:rgba(231,229,228,0.03);
    --grid-line:rgba(231,229,228,0.05);
    --control-border:rgba(231,229,228,0.38);
    --control-fill:#282321;
    --font-sans:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
    --font-display:"Rethink Sans",Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
    --fg:var(--text);
    --muted:var(--text-secondary);
    --border:var(--divider);
    --surface:var(--control-fill);
    --accent-fg:#100D0B;
  }
}
h1,h2,h3{font-family:var(--font-display)}
`;

const fontFace = `@font-face {
  font-family: "Rethink Sans";
  font-style: normal;
  font-weight: 400 800;
  font-display: swap;
  src: url("/fonts/rethink-sans.woff2") format("woff2");
}`;

type Decision = { rule: string; paint: string; why: string };

/** One row per kind of fill. Every rule in vlak.css that paints background-color: var(--text) is in a row. */
const decisions: Decision[] = [
  {
    rule: "Button, primary variant (rs-btn-primary)",
    paint: "--action on --action-text",
    why: "The main action of a view. A dialog's primary action, the composer's send and stop, a confirmation's accept, and the play button are this Button, so they follow.",
  },
  {
    rule: "Inline form submit (rs-inline-field-btn)",
    paint: "--action on --action-text",
    why: "The one action of a one-field form.",
  },
  {
    rule: "Toggle pressed, checkbox, radio, switch, iOS and Android switch, pagination current page, calendar selected day, rating",
    paint: "ink on paper",
    why: "A selected, on or checked state is a full-surface change in ink. In a brand colour it would read as an action.",
  },
  {
    rule: "Alarm panel, channel strip, check-in, clip timeline, colony plate, habit tracker, layer stack, patchbay, sequence alignment, spacing control, well plate, Android chip and navigation indicator",
    paint: "ink on paper",
    why: "The same selection rule, in the specialist components.",
  },
  {
    rule: "Progress, slider and iOS slider fill, audio meter, chart share segment, reference range marker, sleep timeline, parameter knob pointer, stepper done, assistant status dot",
    paint: "ink",
    why: "They show a value or a state, not something to press.",
  },
  {
    rule: "Solid badge, solid alert, tooltip bubble, focused menu item",
    paint: "ink on paper",
    why: "Status and chrome. A badge is information, not a call to act.",
  },
  {
    rule: "Terminal inverse and cursor, persona orb, workflow canvas dot, split handle",
    paint: "ink",
    why: "Marks inside content. They keep ink so content stays legible on any brand.",
  },
  {
    rule: "Android FAB",
    paint: "ink on paper",
    why: "Ambiguous, so it stays. It is the screen's main action, but its hover fill is --text-secondary, a gray that only reads against ink.",
  },
];

const fixed = [
  "The 204px module, the grid verticals and the gutters.",
  "1px hairlines, square chrome, and the one 4px control radius.",
  "44px hit targets and the control scale.",
  "Sentence case, weights 500 and 600, and the type scale's sizes and tracking.",
  "Selection by a full-surface fill, never a stripe or a bar.",
  "Motion: the durations, the one curve, and reduced motion.",
  "Layers, the rs-* class names, and the focus ring.",
];

type Frame = {
  brand: "aeeg" | "harbour";
  dark?: boolean;
  label: string;
  heading: string;
  copy: string;
  link: string;
  action: string;
  ghost: string;
  badge: string;
  chosen: string;
};

const frames: Frame[] = [
  { brand: "aeeg", label: "AEEG, light", heading: "Spring programme", copy: "Doors open at ten. Coffee is on the house.", link: "See the schedule", action: "Book a seat", ghost: "Share", badge: "New", chosen: "Booked" },
  { brand: "aeeg", dark: true, label: "AEEG, dark", heading: "Spring programme", copy: "Doors open at ten. Coffee is on the house.", link: "See the schedule", action: "Book a seat", ghost: "Share", badge: "New", chosen: "Booked" },
  { brand: "harbour", label: "Harbour, light", heading: "Quay review", copy: "Four reviews are open this week.", link: "Open the list", action: "Start review", ghost: "Later", badge: "Draft", chosen: "Done" },
  { brand: "harbour", dark: true, label: "Harbour, dark", heading: "Quay review", copy: "Four reviews are open this week.", link: "Open the list", action: "Start review", ghost: "Later", badge: "Draft", chosen: "Done" },
];

function BrandFrame({ brand, dark, label, heading, copy, link, action, ghost, badge, chosen }: Frame) {
  return (
    <div className="brand-frame" data-brand={brand} data-theme={dark ? "dark" : undefined}>
      <p className="rs-t-label">{label}</p>
      <p className="rs-t-title">{heading}</p>
      <p className="rs-t-body">
        {copy}{" "}
        <a className="rs-link" href="#brand-demos">
          {link}
        </a>
      </p>
      <div className="brand-row">
        <button type="button" className="rs-btn-primary">
          {action}
        </button>
        <button type="button" className="rs-btn-ghost">
          {ghost}
        </button>
        <span className="rs-badge">{badge}</span>
        <span className="rs-badge-solid">{chosen}</span>
      </div>
    </div>
  );
}

export default function BrandPage() {
  return (
    <DocsShell
      title="Brand on Vlak"
      summary="Five custom properties let a product wear its brand. Every other token and rule stays as it is."
    >
      <DocsExample
        flush
        title="Two brands, light and dark"
        description="Each frame carries one brand's tokens on its own element, the way a product carries them on :root. The page around it does not change."
      >
        <div className="brand-demos" id="brand-demos">
          {frames.map((frame) => (
            <BrandFrame key={frame.label} {...frame} />
          ))}
        </div>
      </DocsExample>
      <p className="rs-t-body">
        Rethink Sans is not hosted on this page, so AEEG&apos;s headings fall back to Inter here.
        Harbour sets Georgia, which most machines have. The solid badge is a state, so it stays ink
        in both brands.
      </p>

      <h2 className="section-label">The five hooks</h2>
      <div className="docs-table" tabIndex={0}>
        <table className="rs-table">
          <thead>
            <tr className="rs-table-row">
              <th className="rs-table-th">Property</th>
              <th className="rs-table-th">Vlak&apos;s value</th>
              <th className="rs-table-th">Does</th>
            </tr>
          </thead>
          <tbody>
            {hooks.map((hook) => (
              <tr key={hook.name} className="rs-table-row">
                <td className="rs-table-td">
                  <code>{hook.name}</code>
                </td>
                <td className="rs-table-td">{hook.fallback}</td>
                <td className="rs-table-td">{hook.does}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="rs-t-body">
        Vlak&apos;s own CSS has no hue and a test keeps it so. With none of the hooks set, Vlak looks
        as it did in 0.5.0: a test compares the generated stylesheet with that release&apos;s once
        the hooks sit at their own values. Charts take their one spot colour from <code className="rs-code">--rs-chart-spot</code>{" "}
        or the <code className="rs-code">spot</code> prop; a brand sets it to its accent.
      </p>
      <p className="rs-t-body">
        <code className="rs-code">--action</code>, <code className="rs-code">--action-text</code>,{" "}
        <code className="rs-code">--font-sans</code> and <code className="rs-code">--font-display</code>{" "}
        arrive in 0.6.0. On 0.5.0 and earlier only <code className="rs-code">--accent</code> takes
        effect.
      </p>

      <h2 className="section-label">Set them in your own CSS</h2>
      <CodeBlock code={aeeg} />
      <p className="rs-t-body">
        That is the sample brand above, in light and dark. It is unlayered, so it beats the{" "}
        <code className="rs-code">vlak.tokens</code> layer at any specificity, and it repeats the dark
        values under both selectors Vlak uses. See{" "}
        <a className="rs-link" href="/docs/theming">
          Theming
        </a>{" "}
        and{" "}
        <a className="rs-link" href="/docs/layers">
          Layers
        </a>
        .
      </p>
      <ul className="docs-list">
        <li>
          The five hooks: <code className="rs-code">--accent</code>, <code className="rs-code">--action</code>,{" "}
          <code className="rs-code">--action-text</code>, <code className="rs-code">--font-sans</code> and{" "}
          <code className="rs-code">--font-display</code>.
        </li>
        <li>
          A slight tint. Paper and ink move 2%, and the control fill 3%, toward the accent; the
          hairlines take the ink&apos;s colour. These are ordinary token values. Leave them out and
          Vlak keeps its neutral paper and gray.
        </li>
        <li>
          <code className="rs-code">--rs-chart-spot</code>, set to the accent.
        </li>
        <li>
          <code className="rs-code">--fg</code>, <code className="rs-code">--muted</code>,{" "}
          <code className="rs-code">--border</code>, <code className="rs-code">--surface</code> and{" "}
          <code className="rs-code">--accent-fg</code> are aliases for pages that read a shorter
          vocabulary. Vlak does not read them.
        </li>
        <li>
          The last rule gives headings the display face. Vlak&apos;s own display steps already use{" "}
          <code className="rs-code">--font-display</code>.
        </li>
      </ul>
      <p className="rs-t-body">
        A face needs its own <code className="rs-code">@font-face</code>. Vlak ships Inter only.
      </p>
      <CodeBlock code={fontFace} />

      <h2 className="section-label">What stays fixed</h2>
      <ul className="docs-list">
        {fixed.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="rs-t-body">
        A brand that must change one of these should vendor the component source instead.
      </p>

      <h2 className="section-label">Contrast floors</h2>
      <p className="rs-t-body">
        Vlak&apos;s own values meet them, and a brand&apos;s must too, in light and in dark. Ink
        against paper is 7:1. Secondary text, the accent against paper, and the action text against
        the action fill are 4.5:1. A control&apos;s border is 3:1. When a brand colour falls short,
        move its lightness, not its hue; the sample&apos;s accent is lighter in dark for that reason.
      </p>

      <h2 className="section-label">Primary or selected</h2>
      <p className="rs-t-body">
        Only a main action takes <code className="rs-code">--action</code>: the primary button, a
        submit button, a send button. A selected, on, checked, active, progress, badge or avatar fill
        stays ink. When a rule is ambiguous it stays as it is. A test lists the rules that read{" "}
        <code className="rs-code">--action</code>, so a new one is a decision, not an accident.
      </p>
      <div className="docs-table" tabIndex={0}>
        <table className="rs-table">
          <thead>
            <tr className="rs-table-row">
              <th className="rs-table-th">Rule</th>
              <th className="rs-table-th">Paint</th>
              <th className="rs-table-th">Why</th>
            </tr>
          </thead>
          <tbody>
            {decisions.map((row) => (
              <tr key={row.rule} className="rs-table-row">
                <td className="rs-table-td">{row.rule}</td>
                <td className="rs-table-td">{row.paint}</td>
                <td className="rs-table-td">{row.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DocsShell>
  );
}
