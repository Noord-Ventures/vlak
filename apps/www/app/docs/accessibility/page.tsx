import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { catalogComponents } from "@noorddev/vlak";
import { CodeBlock } from "@/components/code-block";
import { DocsShell } from "@/components/docs-shell";
import { DOOR } from "../../specimen";

export const metadata: Metadata = pageMetadata("/docs/accessibility", {
  title: "Accessibility",
  description: "What every Vlak component commits to, how to name things, how to test, and the pattern behind each control.",
  alternates: { canonical: `${DOOR}/docs/accessibility/` },
});

/**
 * The APG or platform pattern behind each interactive component. The
 * registry's keyboard and a11y fields add the detail on each component
 * page; this table is the map.
 */
const patterns: Record<string, string> = {
  accordion: "Disclosure, native <details>",
  "alert-dialog": "Alert dialog, native <dialog> with role alertdialog",
  breadcrumbs: "Breadcrumb, nav > ol with aria-current",
  button: "Button, native <button>",
  "button-group": "Group of native buttons",
  calendar: "Grid with a roving cell",
  carousel: "Carousel, scroll snap with named groups",
  checkbox: "Checkbox, native input",
  collapsible: "Disclosure, native <details>",
  combobox: "Combobox with list autocomplete",
  command: "Dialog plus combobox and listbox",
  "context-menu": "Menu, opened by pointer or Shift+F10",
  "data-table": "Table with sortable column headers (aria-sort)",
  "date-picker": "Dialog holding a grid",
  dialog: "Dialog, native <dialog>",
  drawer: "Dialog, native <dialog>",
  "dropdown-menu": "Menu button and menu",
  field: "Native label, hint, and error wired through aria-describedby",
  form: "Native form",
  "hover-card": "Tooltip",
  "inline-form": "Native form with one field",
  input: "Native input",
  "input-group": "Native input with a labelled addon",
  "input-otp": "Group of native inputs",
  link: "Link, native <a>",
  menubar: "Menubar",
  "native-select": "Native <select>",
  "navigation-menu": "Navigation landmark",
  pagination: "Navigation landmark with aria-current",
  popover: "Popover API",
  progress: "Progressbar",
  radio: "Radio group, native inputs",
  resizable: "Window splitter, role separator",
  "scroll-area": "Region",
  select: "Select-only combobox",
  sheet: "Dialog, native <dialog>",
  sidebar: "Navigation landmark",
  slider: "Slider, native range input",
  spinner: "Status",
  stepper: "List with aria-current step",
  switch: "Switch, role switch on a button",
  tabs: "Tabs, horizontal or vertical",
  textarea: "Native textarea",
  "theme-toggle": "Button with a state-dependent name",
  toast: "Status region, aria-live polite",
  toggle: "Toggle button, aria-pressed",
  "toggle-group": "Group of toggle buttons",
  tooltip: "Tooltip",
  chart: "Figure with a keyboard cursor and a screen-reader table",
  "bar-chart": "Figure with a keyboard cursor and a screen-reader table",
  "area-chart": "Figure with a keyboard cursor and a screen-reader table",
  "scatter-chart": "Figure with a keyboard cursor and a screen-reader table",
  donut: "Figure with a screen-reader table",
  histogram: "Figure with a keyboard cursor and a screen-reader table",
  "small-multiples": "Figures with screen-reader tables",
  alert: "Note; status or alert when live",
};

const naming = `// Controls without visible text take a name
<Switch aria-label="Notifications" />
<Slider aria-label="Volume" />
<Progress label="Uploading" value={40} />
<Spinner label="Loading" />
<LineChart aria-label="Sheets per day" … />

// Field wires label, hint, and error to the control
<Field>
  <FieldLabel htmlFor="email">E-mail</FieldLabel>
  <Input plain id="email" type="email" />
  <FieldHint>We reply within a day.</FieldHint>
  <FieldError>Enter a valid address.</FieldError>
</Field>

// Dialog titles are h2 and name the dialog; the close button gets a label
<Dialog open={open} onClose={close} closeLabel="Close">
  <DialogTitle>Remove this item?</DialogTitle>
  <DialogBody>This can't be undone.</DialogBody>
</Dialog>`;

const testing = `// vitest, jsdom
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Select } from "@noorddev/vlak-react";

it("has no axe violations", async () => {
  const { container } = render(<Select options={cities} aria-label="City" />);
  expect(await axe(container)).toHaveNoViolations();
});`;

export default function AccessibilityPage() {
  const interactive = catalogComponents.filter((c) => patterns[c.name]);
  return (
    <DocsShell
      title="Accessibility"
      summary="Native elements provide the baseline. Custom widgets follow WAI-ARIA Authoring Practices for semantics, names, keyboard behavior, and focus."
    >
      <h2 className="section-label">Commitments</h2>
      <ul className="docs-list">
        <li>
          Native elements first: <code className="rs-code">&lt;dialog&gt;</code>,{" "}
          <code className="rs-code">&lt;details&gt;</code>, the Popover API, real inputs. The browser
          supplies the semantics and the keyboard.
        </li>
        <li>
          APG patterns where the platform has nothing: listbox, combobox, menu, menubar, grid, tabs,
          window splitter. Arrow keys, Home and End, type-ahead, focus returned to the trigger.
        </li>
        <li>
          A visible 2px focus ring on every control, in ink, with offset. Never removed.
        </li>
        <li>
          Control boundaries at 3:1 against the ground through{" "}
          <code className="rs-code">--control-border</code> (WCAG 1.4.11). Hairlines stay decorative.
        </li>
        <li>
          Text at 4.5:1 or better in both schemes. Emphasis by weight and size; nothing is carried
          by colour alone, because there is only one.
        </li>
        <li>
          <code className="rs-code">prefers-reduced-motion</code>: transitions off, looping demos and
          unsolicited entry disabled.
        </li>
        <li>
          <code className="rs-code">forced-colors</code>: every control keeps a border and a state in
          system colours.
        </li>
        <li>Hit targets of 40px on the desktop and 44px at or under 640px.</li>
        <li>
          Every chart carries a screen-reader table of its data and a keyboard cursor with a status
          tooltip. Numbers format through <code className="rs-code">Intl.NumberFormat</code> with an
          optional <code className="rs-code">locale</code>.
        </li>
        <li>Every interactive component has an axe pass and a keyboard test in the suite.</li>
      </ul>

      <h2 className="section-label">Naming things</h2>
      <CodeBlock code={naming} />
      <p className="rs-t-body">
        Components with visible text name themselves. Components without it (Switch, Slider, icon
        buttons, charts) accept <code className="rs-code">aria-label</code> or{" "}
        <code className="rs-code">aria-labelledby</code> and pass it to the element that carries the
        role. Field binds hint and error to its control with{" "}
        <code className="rs-code">aria-describedby</code> and sets{" "}
        <code className="rs-code">aria-invalid</code> while an error is mounted. Dialog, Sheet, and
        Drawer title themselves from their <code className="rs-code">Title</code> part and describe
        themselves from <code className="rs-code">Body</code>. Alert is a note by default; pass{" "}
        <code className="rs-code">live</code> only when it appears in response to something.
      </p>

      <h2 className="section-label">Testing</h2>
      <CodeBlock code={testing} />
      <p className="rs-t-body">
        The package suite runs axe on every interactive component and walks the keyboard path for
        each pattern: open, move, select, dismiss, focus back on the trigger. The same setup works in
        your project. Test your composition, not the component: the name you passed, the order of
        fields, the focus target after a dialog closes.
      </p>

      <h2 className="section-label">Patterns by component</h2>
      <div className="docs-table" tabIndex={0}>
        <table className="rs-table">
          <thead>
            <tr className="rs-table-row">
              <th className="rs-table-th">Component</th>
              <th className="rs-table-th">Pattern</th>
              <th className="rs-table-th">Keys</th>
            </tr>
          </thead>
          <tbody>
            {interactive.map((c) => (
              <tr key={c.name} className="rs-table-row">
                <td className="rs-table-td">
                  <a className="rs-link" href={`/components/${c.name}`}>
                    {c.title}
                  </a>
                </td>
                <td className="rs-table-td">{patterns[c.name]}</td>
                <td className="rs-table-td">
                  {(c.keyboard ?? []).length > 0
                    ? (c.keyboard ?? []).map((k) => k.keys).join(", ")
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="rs-t-body">
        Each component page carries the full keyboard table and the accessibility notes for that
        component.
      </p>
    </DocsShell>
  );
}
