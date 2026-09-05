/**
 * Vlak component registry: the interface kit as data. This is the
 * single source the docs site, the CLI, the generated registry JSON,
 * and the integrity tests all read from. Each entry names the CSS
 * classes involved, the source files that implement it, and carries a
 * minimal markup snippet in the house style.
 */

import type { VlakComponent } from "./schema";
import { dataAdditions } from "./registry-data-additions.ts";
import { navigationAdditions } from "./registry-navigation-additions.ts";
import { inputAdditions } from "./registry-input-additions.ts";
import { mediaAdditions } from "./registry-media-additions.ts";

export type { VlakComponent } from "./schema";

export const vlakComponents: VlakComponent[] = [
  ...dataAdditions,
  ...navigationAdditions,
  ...inputAdditions,
  ...mediaAdditions,
  {
    name: "button",
    title: "Button",
    description: "Triggers an action. Solid primary or 1px ghost, with a minimum 44px target at every size.",
    category: "actions",
    classes: ["rs-btn-primary", "rs-btn-ghost", "rs-btn-sm", "rs-btn-grouped", "rs-btn-grouped-ghost"],
    css: ["components/button.css"],
    react: "components/button.tsx",
    snippet: `<button class="rs-btn-primary">Primary action</button>\n<button class="rs-btn-ghost">Secondary</button>`,
    example: `import { Button } from "@noorddev/vlak-react";

<Button>Primary action</Button>
<Button variant="ghost" size="sm">Secondary</Button>
<Button disabled>Saving…</Button>`,
    usage: {
      use: ["One primary action per view, with ghost for the secondary action.", "Submitting a form or answering a dialog."],
      avoid: ["Navigation that changes the URL; use Link or a nav component.", "On and off state; use Toggle or Switch, which carry aria-pressed and aria-checked."],
    },
    keyboard: [
      { keys: "Tab", does: "Moves focus to the button" },
      { keys: "Enter, Space", does: "Activates it" },
    ],
    a11y: [
      "Renders a native <button>; type defaults to \"button\", so pass type=\"submit\" inside a form.",
      "The visible text is the name. Give icon-only buttons an aria-label.",
      "2px ink focus ring on :focus-visible. disabled uses the native attribute and 40% opacity; forced colors keep system colors.",
    ],
    aliases: ["Button", "Primary button", "Ghost button", "Secondary button"],
  },
  {
    name: "button-group",
    title: "Button group",
    description: "Keeps related actions together as joined ghost buttons with 1px dividers.",
    category: "actions",
    classes: ["rs-btn-group"],
    css: ["components/button-group.css"],
    react: "components/button-group.tsx",
    registryDependencies: ["button"],
    snippet: `<div class="rs-btn-group"><button class="rs-btn-ghost">Left</button><button class="rs-btn-ghost">Center</button><button class="rs-btn-ghost">Right</button></div>`,
    example: `import { Button, ButtonGroup } from "@noorddev/vlak-react";

<ButtonGroup aria-label="Alignment">
  <Button variant="ghost">Left</Button>
  <Button variant="ghost">Center</Button>
  <Button variant="ghost">Right</Button>
</ButtonGroup>`,
    usage: {
      use: ["Two to four related actions that read as one control.", "Ghost buttons; the group owns the outer stroke and the seams."],
      avoid: ["Exclusive selection; use ToggleGroup, which tracks the pressed option.", "Unrelated actions in one row; space them instead."],
    },
    keyboard: [
      { keys: "Tab", does: "Moves between the buttons" },
      { keys: "Enter, Space", does: "Activates the focused button" },
    ],
    a11y: [
      "Renders role=\"group\"; pass aria-label to name it.",
      "Children get grouped, so each Button keeps its own name and focus ring.",
    ],
    aliases: ["Button group", "Segmented buttons", "Joined buttons"],
  },
  {
    name: "link",
    title: "Text link",
    description: "Navigates to a page or resource. Hairline underline; in-copy variant is inset 1px.",
    category: "actions",
    classes: ["rs-link", "rs-link-underline"],
    css: ["components/link.css"],
    react: "components/link.tsx",
    snippet: `<div><a class="rs-link" href="#">A text link</a></div>\n<div><a class="rs-link-underline" href="#">An in-copy link</a></div>`,
    example: `import { Link } from "@noorddev/vlak-react";

<Link href="/docs">A text link</Link>
<p>Read the <Link underline href="/docs">guide</Link> first.</p>`,
    usage: {
      use: ["Navigation to another page or anchor.", "underline for links inside running copy."],
      avoid: ["Actions that do not change the URL; use Button.", "Bare hrefs with \"click here\" text; the text should name the destination."],
    },
    keyboard: [
      { keys: "Tab", does: "Moves focus to the link" },
      { keys: "Enter", does: "Follows it" },
    ],
    a11y: [
      "Renders a native <a>; it needs an href to be focusable.",
      "2px ink focus ring on :focus-visible.",
    ],
    aliases: ["Link", "Anchor", "Text link", "Inline link"],
  },
  {
    name: "input",
    title: "Input",
    description: "Collects one line of text. 1px border, 2px focus ring, 12px label above.",
    category: "forms",
    classes: ["rs-field", "rs-field-label", "rs-input", "rs-input-full", "rs-input-ok", "rs-input-invalid", "rs-feedback", "rs-feedback-ok", "rs-feedback-error", "rs-input-field", "rs-input-grouped", "rs-input-label"],
    css: ["components/input.css"],
    react: "components/input.tsx",
    snippet: `<div class="rs-field"><span class="rs-field-label">E-mail</span><input class="rs-input rs-input-full" /></div>`,
    example: `import { Input } from "@noorddev/vlak-react";

<Input label="E-mail" type="email" placeholder="you@example.com" hint="We never share it." />
<Input label="Name" error="Name is required." />
<Input label="Handle" ok feedback="Available" />`,
    usage: {
      use: ["Single-line text, e-mail, number, password, and search fields.", "label, hint, and error together; the component wires them to the control."],
      avoid: ["Long text; use Textarea.", "A fixed set of options; use Select or NativeSelect."],
    },
    keyboard: [
      { keys: "Tab", does: "Moves focus to the field" },
      { keys: "Enter", does: "Submits the enclosing form" },
    ],
    a11y: [
      "Renders a native <input> with a generated id; label points at it with htmlFor.",
      "hint and error are linked through aria-describedby; error also sets aria-invalid and renders with role=\"alert\".",
      "Inside Field, pass plain so Field's hint and error describe the control instead.",
    ],
    aliases: ["Input", "Text field", "TextField", "Text input"],
  },
  {
    name: "label",
    title: "Label",
    description: "Names a form control. 12px secondary text, set above the control.",
    category: "forms",
    classes: ["rs-label"],
    css: ["components/label.css"],
    react: "components/label.tsx",
    snippet: `<label class="rs-label" for="name">Name</label>`,
    example: `import { Label } from "@noorddev/vlak-react";

<Label htmlFor="name">Name</Label>
<input id="name" className="rs-input rs-input-full" />`,
    usage: {
      use: ["Naming a control that does not take a label prop.", "Custom layouts where the label sits apart from the field."],
      avoid: ["Alongside Input's own label prop; it already renders one.", "As a heading; use the type scale."],
    },
    a11y: [
      "Renders a native <label>; pass htmlFor with the control's id so clicks focus the control and the name is exposed.",
    ],
    aliases: ["Label", "Form label", "Field label"],
  },
  {
    name: "field",
    title: "Field",
    description: "Groups a label, control, and hint or error in one vertical field.",
    category: "forms",
    classes: ["rs-field", "rs-field-label", "rs-field-hint", "rs-field-error"],
    css: ["components/field.css"],
    react: "components/field.tsx",
    registryDependencies: ["input"],
    snippet: `<div class="rs-field"><label class="rs-field-label" for="invoice-name">Name</label><input class="rs-input rs-input-full" id="invoice-name" aria-describedby="invoice-name-hint" /><p class="rs-field-hint" id="invoice-name-hint">As it appears on the invoice.</p></div>`,
    example: `import { Field, FieldError, FieldHint, FieldLabel, Input } from "@noorddev/vlak-react";

<Field>
  <FieldLabel htmlFor="name">Name</FieldLabel>
  <Input plain id="name" />
  <FieldHint>As it appears on the invoice.</FieldHint>
</Field>

<Field>
  <FieldLabel htmlFor="iban">IBAN</FieldLabel>
  <Input plain id="iban" />
  <FieldError>Check the country code.</FieldError>
</Field>`,
    usage: {
      use: ["Any control with a label plus a hint or an error, including NativeSelect, Textarea, Slider, and InputOTP.", "Form layouts where every field stacks the same way."],
      avoid: ["A lone Input; its label, hint, and error props do the same job.", "Grouping several controls; use a fieldset with a legend."],
    },
    a11y: [
      "Field passes the ids of a rendered FieldHint and FieldError to the control through aria-describedby.",
      "A rendered FieldError sets aria-invalid on the control and has role=\"alert\".",
      "FieldLabel is a native <label>; pass htmlFor with the control's id.",
    ],
    aliases: ["Field", "Form field", "Form item", "FormField", "Form control"],
  },
  {
    name: "input-group",
    title: "Input group",
    description: "Joins a text field with a prefix or suffix inside one 1px border.",
    category: "forms",
    classes: ["rs-input-group", "rs-input-addon", "rs-input-group-end"],
    css: ["components/input-group.css"],
    react: "components/input-group.tsx",
    registryDependencies: ["input"],
    snippet: `<div class="rs-input-group"><span class="rs-input-addon">https://</span><input class="rs-input" placeholder="vlak.dev" /></div>`,
    example: `import { Input, InputAddon, InputGroup } from "@noorddev/vlak-react";

<InputGroup>
  <InputAddon>https://</InputAddon>
  <Input placeholder="vlak.dev" aria-label="Site" />
</InputGroup>

<InputGroup end>
  <Input placeholder="0.00" aria-label="Amount" />
  <InputAddon>EUR</InputAddon>
</InputGroup>`,
    usage: {
      use: ["A fixed prefix or suffix that belongs to the value: a protocol, a unit, a currency.", "end to place the addon after the field."],
      avoid: ["Buttons inside the field; use InlineForm.", "Icons as decoration; the addon is text."],
    },
    a11y: [
      "The Input child is cloned with plain and grouped; it keeps its own id and name.",
      "The addon is presentational text. Give the input an aria-label or a FieldLabel; the addon does not name it.",
    ],
    aliases: ["Input group", "Input addon", "Prefix input", "Suffix input"],
  },
  {
    name: "native-select",
    title: "Native select",
    description: "Presents browser-native options inside a 1px control border.",
    category: "forms",
    classes: ["rs-native-select", "rs-native-select-invalid", "rs-native-select-field", "rs-native-select-label", "rs-native-select-control", "rs-native-select-icon"],
    css: ["components/native-select.css"],
    react: "components/native-select.tsx",
    registryDependencies: ["icons"],
    snippet: `<div class="rs-native-select-control"><select class="rs-native-select" aria-label="City"><option>Alkmaar</option><option>Amsterdam</option><option>Rotterdam</option></select><svg class="rs-native-select-icon rs-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5.5 3.75 L10.5 8.25 L5.5 12.75" transform="rotate(90 8 8)" vector-effect="non-scaling-stroke" /></svg></div>`,
    example: `import { NativeSelect } from "@noorddev/vlak-react";

<NativeSelect label="City" defaultValue="alkmaar">
  <option value="alkmaar">Alkmaar</option>
  <option value="amsterdam">Amsterdam</option>
  <option value="rotterdam">Rotterdam</option>
</NativeSelect>`,
    usage: {
      use: ["A short fixed list where the platform picker is fine, especially on phones.", "Forms that post natively; the value travels with the form."],
      avoid: ["Rich option labels or type-ahead over long lists; use Select or Combobox.", "Fewer than three options; use Radio."],
    },
    keyboard: [
      { keys: "Space, Alt + Arrow down", does: "Opens the platform list" },
      { keys: "Arrow up, Arrow down", does: "Changes the value" },
      { keys: "Type a letter", does: "Jumps to a matching option" },
    ],
    a11y: [
      "Renders a native <select> with a generated id; label renders a <label> pointing at it.",
      "Inside Field, hint and error reach it through aria-describedby and aria-invalid.",
    ],
    aliases: ["Native select", "Select element", "Dropdown", "HTML select"],
  },
  {
    name: "inline-form",
    title: "Inline form",
    description: "Pairs one field with an embedded submit action. The button appears after validation.",
    category: "patterns",
    classes: ["rs-inline-field", "rs-inline-input", "rs-inline-btn", "rs-reveal", "rs-reveal-in", "rs-subscribed", "rs-inline-field-btn", "rs-inline-error"],
    css: ["components/inline-form.css"],
    react: "components/inline-form.tsx",
    registryDependencies: ["button"],
    snippet: `<div class="rs-inline-field"><input class="rs-inline-input" placeholder="Your e-mail" /><span class="rs-reveal rs-reveal-in"><button class="rs-btn-primary rs-inline-btn">Subscribe</button></span></div>`,
    example: `import { InlineForm } from "@noorddev/vlak-react";

<InlineForm
  placeholder="Your e-mail"
  buttonLabel="Subscribe"
  inputProps={{ "aria-label": "E-mail", type: "email" }}
  onSubmit={(email) => subscribe(email)}
/>`,
    usage: {
      use: ["One value and one action: newsletter, invite by e-mail, join a waitlist.", "validate to decide when the action appears; the default is a loose e-mail check."],
      avoid: ["More than one field; use Form with Field.", "Actions needing a separate confirmation step; compose a Dialog before submitting."],
    },
    keyboard: [
      { keys: "Enter", does: "Submits once the value validates" },
      { keys: "Tab", does: "Reaches the button only after the value validates" },
    ],
    a11y: [
      "The input is named by inputProps aria-label, falling back to the placeholder; use a clear persistent name.",
      "The submit button stays out of the tab order (tabIndex -1) until validate returns true.",
      "Submission awaits the onSubmit promise. aria-busy and pendingLabel indicate progress; duplicate submits are ignored, failure is an alert, and retry preserves the value.",
      "Success is a live status inside the same form, preserving its ref. Without an onSubmit handler the form cannot claim success.",
      "Controlled with value and onValueChange, or uncontrolled with defaultValue; native inputProps onChange is composed with internal state.",
    ],
    aliases: ["Inline form", "Newsletter form", "Subscribe form", "Single-field form"],
  },
  {
    name: "radio",
    title: "Radio",
    description: "Selects one option from a group. The selected dot fills with ink.",
    category: "forms",
    classes: ["rs-radio", "rs-radio-dot", "rs-radio-on", "rs-radio-fill"],
    css: ["components/radio.css"],
    react: "components/radio.tsx",
    snippet: `<label class="rs-radio"><span class="rs-radio-dot rs-radio-on"></span>Monthly</label>`,
    example: `import { useState } from "react";
import { Radio, RadioGroup } from "@noorddev/vlak-react";

const [plan, setPlan] = useState("monthly");

<RadioGroup aria-label="Billing" value={plan} onValueChange={setPlan}>
  <Radio value="monthly" label="Monthly" />
  <Radio value="yearly" label="Yearly" />
</RadioGroup>`,
    usage: {
      use: ["One choice from two to six visible options.", "Choices that should all be readable at once."],
      avoid: ["Many options; use Select.", "Independent on and off choices; use Checkbox."],
    },
    keyboard: [
      { keys: "Tab", does: "Moves focus into the group, onto the checked radio" },
      { keys: "Arrow up, Arrow down, Arrow left, Arrow right", does: "Moves the selection" },
      { keys: "Space", does: "Selects the focused radio" },
    ],
    a11y: [
      "RadioGroup renders role=\"radiogroup\"; pass aria-label or aria-labelledby to name it.",
      "Radio is a native <input type=\"radio\"> hidden from view inside a <label>; the ink dot mirrors its state.",
      "The group shares a generated name unless you pass one.",
    ],
    aliases: ["Radio", "Radio group", "RadioGroup", "Radio button"],
  },
  {
    name: "checkbox",
    title: "Checkbox",
    description: "Selects any number of options. A 44px target surrounds the check mark; indeterminate uses a minus.",
    category: "forms",
    classes: ["rs-choice", "rs-check", "rs-check-on"],
    css: ["components/checkbox.css"],
    react: "components/checkbox.tsx",
    snippet: `<label class="rs-choice"><span class="rs-check rs-check-on"><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter"><path d="M3.5 8.5 L6.5 11.5 L12.5 4.5" vector-effect="non-scaling-stroke"/></svg></span>Brand</label>`,
    example: `import { useState } from "react";
import { Checkbox } from "@noorddev/vlak-react";

const [opted, setOpted] = useState(false);

<Checkbox label="Brand" defaultChecked />
<Checkbox label="Send me the newsletter" checked={opted} onChange={(e) => setOpted(e.target.checked)} />`,
    usage: {
      use: ["Independent on and off choices, alone or in a list.", "Consent and acknowledgement lines."],
      avoid: ["A setting that takes effect immediately; use Switch.", "One choice from many; use Radio."],
    },
    keyboard: [
      { keys: "Tab", does: "Moves focus to the checkbox" },
      { keys: "Space", does: "Toggles it" },
    ],
    a11y: [
      "A native <input type=\"checkbox\"> hidden from view inside a <label>; the 16px box mirrors its state.",
      "label is the accessible name. Without one, pass aria-label.",
      "Controlled with checked and onCheckedChange or native onChange, or uncontrolled with defaultChecked. indeterminate sets the native mixed state.",
    ],
    aliases: ["Checkbox", "Check box", "Tick box"],
  },
  {
    name: "switch",
    title: "Switch",
    description: "Turns one setting on or off. A 64×44px target contains the moving thumb and ink-filled track.",
    category: "forms",
    classes: ["rs-switch", "rs-switch-on", "rs-switch-thumb", "rs-switch-thumb-on"],
    css: ["components/switch.css"],
    react: "components/switch.tsx",
    snippet: `<span class="rs-switch rs-switch-on"><i></i></span>`,
    example: `import { useState } from "react";
import { Switch } from "@noorddev/vlak-react";

const [enabled, setEnabled] = useState(false);

<Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Notifications" />`,
    usage: {
      use: ["A setting that applies as soon as it flips.", "Binary state with a clear on and off."],
      avoid: ["Choices that need a submit button; use Checkbox.", "More than two states; use ToggleGroup."],
    },
    keyboard: [
      { keys: "Tab", does: "Moves focus to the switch" },
      { keys: "Space, Enter", does: "Toggles it" },
    ],
    a11y: [
      "A native <button> with role=\"switch\" and aria-checked.",
      "It has no visible text; pass aria-label or aria-labelledby.",
      "Controlled with checked and onCheckedChange, or uncontrolled with defaultChecked.",
    ],
    aliases: ["Switch", "Toggle switch"],
  },
  {
    name: "slider",
    title: "Slider",
    description: "Selects one value from a range. A fine track sits inside a 44px hit area.",
    category: "forms",
    classes: ["rs-slider", "rs-slider-fill", "rs-slider-thumb", "rs-slider-thumb-focused", "rs-slider-range"],
    css: ["components/slider.css"],
    react: "components/slider.tsx",
    snippet: `<div class="rs-slider"><span class="rs-slider-fill" style="width:62%"></span><span class="rs-slider-thumb" style="left:62%"></span></div>`,
    example: `import { useState } from "react";
import { Slider } from "@noorddev/vlak-react";

const [volume, setVolume] = useState(62);

<Slider value={volume} onValueChange={setVolume} min={0} max={100} step={1} aria-label="Volume" />`,
    usage: {
      use: ["A number inside a known range where the position matters more than the digits.", "Volume, opacity, zoom, and similar live values."],
      avoid: ["Exact values; use Input type=\"number\".", "Ranges with two thumbs; the component has one."],
    },
    keyboard: [
      { keys: "Tab", does: "Moves focus to the slider" },
      { keys: "Arrow right, Arrow up", does: "Increases by step" },
      { keys: "Arrow left, Arrow down", does: "Decreases by step" },
      { keys: "Home, End", does: "Jumps to min or max" },
    ],
    a11y: [
      "A native <input type=\"range\"> drives the ink track; the platform exposes value, min, and max.",
      "It has no visible text; pass aria-label or aria-labelledby.",
      "The visible thumb sits on a 44px hit area and shows a focus ring on :focus-visible.",
    ],
    aliases: ["Slider", "Range", "Range input"],
  },
  {
    name: "progress",
    title: "Progress",
    description: "Shows completion for a known process. 4px bar; the label carries the percentage.",
    category: "feedback",
    classes: ["rs-progress", "rs-progress-head", "rs-progress-fill"],
    css: ["components/progress.css"],
    react: "components/progress.tsx",
    snippet: `<div class="rs-progress-head"><span id="upload-label">Uploading</span><span>40%</span></div><div class="rs-progress" role="progressbar" aria-labelledby="upload-label" aria-valuemin="0" aria-valuemax="100" aria-valuenow="40"><span class="rs-progress-fill" style="width:40%"></span></div>`,
    example: `import { Progress } from "@noorddev/vlak-react";

<Progress label="Uploading" value={40} />
<Progress value={3} max={5} aria-label="Steps done" />`,
    usage: {
      use: ["Determinate progress with a known total.", "label to show the name and the percentage above the bar."],
      avoid: ["Unknown duration; use Spinner.", "Static ratios like storage used; a number reads better."],
    },
    a11y: [
      "Renders role=\"progressbar\" with aria-valuemin, aria-valuemax, aria-valuenow, and aria-valuetext as a percentage.",
      "label names the bar through aria-labelledby; without one, pass aria-label.",
    ],
    aliases: ["Progress", "Progress bar", "Meter"],
  },
  {
    name: "tabs",
    title: "Tabs",
    description: "Switches between related panels. Text labels in one row; active tab has a 1px underline.",
    category: "navigation",
    classes: ["rs-tabs", "rs-tabs-vertical", "rs-tab", "rs-tab-active"],
    css: ["components/tabs.css"],
    react: "components/tabs.tsx",
    snippet: `<div class="rs-tabs"><span class="rs-tab rs-tab-active">Overview</span><span class="rs-tab">Activity</span><span class="rs-tab">Settings</span></div>`,
    example: `import { Tab, TabList, TabPanel, Tabs } from "@noorddev/vlak-react";

<Tabs defaultValue="overview">
  <TabList aria-label="Project">
    <Tab value="overview">Overview</Tab>
    <Tab value="activity">Activity</Tab>
    <Tab value="settings">Settings</Tab>
  </TabList>
  <TabPanel value="overview">…</TabPanel>
  <TabPanel value="activity">…</TabPanel>
  <TabPanel value="settings">…</TabPanel>
</Tabs>`,
    usage: {
      use: ["Two to six views of the same object that share one place on the page.", "orientation=\"vertical\" on TabList for a stacked rail."],
      avoid: ["Navigation between pages; use NavigationMenu with real links.", "Sequential steps; use Stepper."],
    },
    keyboard: [
      { keys: "Tab", does: "Moves focus to the selected tab, then into the panel" },
      { keys: "Arrow left, Arrow right", does: "Moves to the previous or next tab and selects it (wraps)" },
      { keys: "Arrow up, Arrow down", does: "The same when orientation is vertical" },
      { keys: "Home, End", does: "First or last tab" },
    ],
    a11y: [
      "TabList is role=\"tablist\" (aria-orientation when vertical); pass aria-label to name it.",
      "Tab is a <button role=\"tab\"> with aria-selected and aria-controls; TabPanel is role=\"tabpanel\" with aria-labelledby, hidden when not selected.",
      "One roving tab stop: only the selected tab is in the tab order.",
      "Without a default, the first enabled tab is selected. Removing or disabling the active tab reconciles to the first enabled tab; each target is at least 44px.",
      "Controlled with value and onValueChange, or uncontrolled with defaultValue.",
    ],
    aliases: ["Tabs", "Tab list", "Tab bar"],
  },
  {
    name: "breadcrumbs",
    title: "Breadcrumbs",
    description: "Shows a page's place in a hierarchy. Ancestors are links; the current page is full ink.",
    category: "navigation",
    classes: ["rs-crumbs", "rs-crumbs-list", "rs-crumbs-item", "rs-crumbs-link", "rs-crumbs-sep", "rs-crumbs-here"],
    css: ["components/breadcrumbs.css"],
    react: "components/breadcrumbs.tsx",
    snippet: `<p class="rs-crumbs"><a class="rs-crumbs-link" href="/">Studio</a><span class="rs-crumbs-sep">/</span><span class="rs-crumbs-here">Vlak</span></p>`,
    example: `import { Breadcrumbs } from "@noorddev/vlak-react";

<Breadcrumbs items={[{ label: "Studio", href: "/studio" }, { label: "Vlak", href: "/studio/vlak" }, { label: "Components" }]} />`,
    usage: {
      use: ["Showing where a page sits in a hierarchy three or more levels deep.", "The last item is the current page and carries no href."],
      avoid: ["Flat sites with one level.", "As the primary navigation; pair it with a nav."],
    },
    keyboard: [
      { keys: "Tab", does: "Moves between the ancestor links" },
      { keys: "Enter", does: "Follows the link" },
    ],
    a11y: [
      "Renders <nav aria-label=\"Breadcrumb\"> with an ordered list.",
      "The last item is marked aria-current=\"page\"; separators are aria-hidden.",
    ],
    aliases: ["Breadcrumb", "Breadcrumbs", "Trail"],
  },
  {
    name: "crumb-bar",
    title: "Crumb bar",
    description: "Keeps the current path visible while scrolling. Fixed at 72px with a 1px bottom rule when active.",
    category: "navigation",
    classes: ["rs-crumb-bar", "rs-crumb-bar-scrolled", "rs-crumb-bar-inner", "rs-crumb-root", "rs-crumb-root-full", "rs-crumb-root-short", "rs-crumb-crumbs", "rs-crumb-crumbs-on", "rs-crumb-item", "rs-crumb-here", "rs-crumb-link", "rs-crumb-sep"],
    css: ["components/crumb-bar.css"],
    react: "components/crumb-bar.tsx",
    registryDependencies: ["breadcrumbs"],
    snippet: `<nav class="rs-crumb-bar rs-crumb-bar-scrolled"><div class="rs-crumb-bar-inner"><a class="rs-crumb-root" href="/"><span class="rs-crumb-root-full">Vlak</span><span class="rs-crumb-root-short">rs</span></a><p class="rs-crumbs"><span>Docs</span><span class="rs-crumbs-sep">/</span><span class="rs-crumbs-here">Components</span></p></div></nav>`,
    example: `import { CrumbBar } from "@noorddev/vlak-react";

<CrumbBar
  root={{ label: "Renato Valdés Olmos", href: "/" }}
  rootShort="RVO"
  trail={[{ label: "Components", href: "/components" }, { label: "Switch" }]}
  threshold={110}
/>`,
    usage: {
      use: ["The fixed top bar of a long page: transparent over the cover, paper and a hairline once scrolled.", "A root mark plus the trail of the current page."],
      avoid: ["Pages without a cover; use Breadcrumbs in the flow.", "Bars that hold actions or search; this one holds the trail only."],
    },
    keyboard: [
      { keys: "Tab", does: "Moves to the root link, then the trail links once the bar is scrolled in" },
      { keys: "Enter", does: "Follows the link" },
    ],
    a11y: [
      "Renders <nav aria-label=\"Breadcrumb\">; the trail is an ordered list with aria-current=\"page\" on the last item.",
      "While the bar is transparent the trail is inert, so nothing focuses into an invisible link.",
    ],
    aliases: ["Crumb bar", "Sticky header", "Top bar", "App bar"],
  },
  {
    name: "pagination",
    title: "Pagination",
    description: "Moves through paginated content. Square controls; the current page fills with ink.",
    category: "navigation",
    classes: ["rs-pages", "rs-page", "rs-page-on", "rs-page-gap", "rs-pages-icon"],
    css: ["components/pagination.css"],
    react: "components/pagination.tsx",
    snippet: `<div class="rs-pages"><span class="rs-page"><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter"><path d="M10.5 3.75 L5.5 8.25 L10.5 12.75" vector-effect="non-scaling-stroke"/></svg></span><span class="rs-page rs-page-on">1</span><span class="rs-page">2</span><span class="rs-page"><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter"><path d="M5.5 3.75 L10.5 8.25 L5.5 12.75" vector-effect="non-scaling-stroke"/></svg></span></div>`,
    example: `import { useState } from "react";
import { Pagination } from "@noorddev/vlak-react";

const [page, setPage] = useState(1);

<Pagination page={page} count={12} onPageChange={setPage} siblings={1} />`,
    usage: {
      use: ["Paged lists and tables where the user needs to jump to a specific page.", "siblings to widen the window around the current page."],
      avoid: ["Feeds that load more on scroll.", "Fewer than three pages; a previous and next pair is enough."],
    },
    keyboard: [
      { keys: "Tab", does: "Moves between the page buttons" },
      { keys: "Enter, Space", does: "Goes to that page" },
    ],
    a11y: [
      "Renders <nav aria-label=\"Pagination\"> of native buttons; the current page carries aria-current=\"page\".",
      "Previous and next are labelled and disabled at the ends; gaps are aria-hidden.",
    ],
    aliases: ["Pagination", "Pager", "Page navigation"],
  },
  {
    name: "select",
    title: "Select",
    description: "Selects one option from an overlay. The closed trigger carries a chevron.",
    category: "forms",
    classes: ["rs-select", "rs-select-list"],
    css: ["components/select.css"],
    react: "components/select.tsx",
        registryDependencies: ["dropdown-menu"],
    snippet: `<button class="rs-dropdown" role="combobox" aria-haspopup="listbox" aria-expanded="true"><span>Alkmaar</span></button>\n<div class="rs-menu rs-select-list" role="listbox"><div class="rs-menu-item rs-menu-item-active" role="option" aria-selected="true">Alkmaar</div><div class="rs-menu-item" role="option" aria-selected="false">Amsterdam</div></div>`,
    example: `import { useState } from "react";
import { Select } from "@noorddev/vlak-react";

const [city, setCity] = useState("alkmaar");

<Select
  aria-label="City"
  options={[
    { value: "alkmaar", label: "Alkmaar" },
    { value: "amsterdam", label: "Amsterdam" },
    { value: "rotterdam", label: "Rotterdam" },
  ]}
  value={city}
  onValueChange={setCity}
/>`,
    usage: {
      use: ["One choice from a list of five or more when the labels are short.", "Lists that benefit from type-ahead and a consistent overlay across platforms."],
      avoid: ["Free text or filtering; use Combobox.", "Native form posts and phones where the platform picker is better; use NativeSelect."],
    },
    keyboard: [
      { keys: "Arrow down, Arrow up, Enter, Space", does: "Opens the list on the selected option" },
      { keys: "Home, End", does: "Opens on the first or last option; moves there when open" },
      { keys: "Type letters", does: "Jumps to the next matching option, open or closed" },
      { keys: "Arrow down, Arrow up", does: "Moves the active option" },
      { keys: "Page up, Page down", does: "Moves ten options" },
      { keys: "Enter, Space", does: "Selects the active option and closes" },
      { keys: "Escape", does: "Closes and returns focus to the trigger" },
      { keys: "Tab", does: "Closes and moves on" },
    ],
    a11y: [
      "APG select-only combobox: the trigger is a <button role=\"combobox\"> with aria-haspopup=\"listbox\", aria-expanded, aria-controls, and aria-activedescendant.",
      "The list is role=\"listbox\" with role=\"option\" rows carrying aria-selected; focus stays on the trigger.",
      "Pass aria-label or aria-labelledby; the listbox is labelled by the same source.",
      "Controlled with value and onValueChange, or uncontrolled with defaultValue. A click outside closes it.",
    ],
    aliases: ["Select", "Listbox", "Dropdown select", "Picker"],
  },
  {
    name: "dialog",
    title: "Dialog",
    description: "Focuses attention on a modal task. Title, body, and two equal actions.",
    category: "surfaces",
    classes: ["rs-dialog", "rs-dialog-title", "rs-dialog-body", "rs-dialog-actions", "rs-dialog-close"],
    css: ["components/dialog.css"],
    react: "components/dialog.tsx",
    registryDependencies: ["button"],
    snippet: `<div class="rs-dialog" role="dialog" aria-labelledby="remove-title" aria-describedby="remove-body"><h2 class="rs-dialog-title" id="remove-title">Remove this item?</h2><p class="rs-dialog-body" id="remove-body">This can't be undone.</p><div class="rs-dialog-actions"><button class="rs-btn-ghost rs-btn-sm">Cancel</button><button class="rs-btn-primary rs-btn-sm">Remove</button></div></div>`,
    example: `import { useState } from "react";
import { Button, Dialog, DialogActions, DialogBody, DialogTitle } from "@noorddev/vlak-react";

const [open, setOpen] = useState(false);

<Button variant="ghost" onClick={() => setOpen(true)}>Remove</Button>
<Dialog open={open} onClose={() => setOpen(false)} closeLabel="Close">
  <DialogTitle>Remove this item?</DialogTitle>
  <DialogBody>This can't be undone.</DialogBody>
  <DialogActions>
    <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
    <Button size="sm" onClick={remove}>Remove</Button>
  </DialogActions>
</Dialog>`,
    usage: {
      use: ["A short decision or a form that must finish before the page continues.", "One title, one sentence of body, two equal actions."],
      avoid: ["Content the user should keep the page in view for; use Sheet or Popover.", "Destructive confirmations that must not dismiss on Escape; use AlertDialog."],
    },
    keyboard: [
      { keys: "Escape", does: "Calls onClose (when dismissable, the default)" },
      { keys: "Tab, Shift + Tab", does: "Cycles focus inside the open dialog" },
      { keys: "Enter, Space", does: "Activates the focused action" },
    ],
    a11y: [
      "A native <dialog> opened with showModal(): the platform traps focus, provides the backdrop, and handles Escape.",
      "DialogTitle (an h2 by default) names it through aria-labelledby; DialogBody describes it through aria-describedby, only while mounted.",
      "On open, focus moves to [autofocus] or the first focusable element; on close it returns to the element that opened it.",
      "dismissable={false} maps to closedby=\"none\"; lightDismiss adds a click on the backdrop. closeLabel renders a labelled close button. The ref is forwarded to the <dialog>.",
    ],
    aliases: ["Dialog", "Modal", "Modal dialog"],
  },
  {
    name: "badge",
    title: "Badge",
    description: "Labels status or category. 11px text with outline, solid, and muted variants.",
    category: "feedback",
    classes: ["rs-badge", "rs-badge-solid", "rs-badge-muted"],
    css: ["components/badge.css"],
    react: "components/badge.tsx",
    snippet: `<span class="rs-badge">Recommended</span><span class="rs-badge-solid">Delivered</span><span class="rs-badge-muted">In progress</span>`,
    example: `import { Badge } from "@noorddev/vlak-react";

<Badge>Recommended</Badge>
<Badge variant="solid">Delivered</Badge>
<Badge variant="muted">In progress</Badge>`,
    usage: {
      use: ["A short status or category next to a title.", "solid for done, outline for a recommendation, muted for pending."],
      avoid: ["Counts that update live; announce those elsewhere.", "Clickable filters; use Toggle."],
    },
    a11y: [
      "A plain <span>; the text is all there is. Keep it to one or two words.",
    ],
    aliases: ["Badge", "Tag", "Pill", "Status"],
  },
  {
    name: "chip",
    title: "Mono chip",
    description: "Marks a short technical identifier. Monospace text with a 1px mixed border.",
    category: "content",
    classes: ["rs-chip"],
    css: ["components/chip.css"],
    react: "components/chip.tsx",
    snippet: `<span class="rs-chip">/noord-brand</span>`,
    example: `import { Chip } from "@noorddev/vlak-react";

<Chip>/noord-brand</Chip>`,
    usage: {
      use: ["Identifiers in monospace: paths, handles, keys, short code.", "Inline in copy or in a list of tags."],
      avoid: ["Status words; use Badge.", "Removable filter tokens; the chip has no close control."],
    },
    a11y: [
      "A plain <span> set in the mono stack.",
    ],
    aliases: ["Chip", "Mono chip", "Code chip", "Token"],
  },
  {
    name: "card",
    title: "Card",
    description: "Groups related content as a label, title, and body. No outline.",
    category: "surfaces",
    classes: ["rs-card", "rs-card-label", "rs-card-title", "rs-card-body", "rs-card-in"],
    css: ["components/card.css"],
    react: "components/card.tsx",
    snippet: `<div class="rs-card"><span class="rs-card-label">Case study</span><h3 class="rs-card-title">A quieter interface</h3><p class="rs-card-body">Emphasis from weight and spacing, never from a hue.</p></div>`,
    example: `import { Card, CardBody, CardLabel, CardTitle } from "@noorddev/vlak-react";

<Card>
  <CardLabel>Case study</CardLabel>
  <CardTitle>A quieter interface</CardTitle>
  <CardBody>Emphasis from weight and spacing, never from a hue.</CardBody>
</Card>`,
    usage: {
      use: ["A titled block of copy on the grid: label, title, body.", "CardInner for a padded field inside a Nest."],
      avoid: ["Framed boxes with shadows; cards have no outline.", "Interactive tiles; wrap the title in a Link instead of making the card clickable."],
    },
    a11y: [
      "CardTitle renders an <h3>; adjust the heading level with a wrapper when it breaks the outline.",
      "The ref on Card is forwarded to the <div>.",
    ],
    aliases: ["Card", "Panel", "Tile"],
  },
  {
    name: "concentric-radius",
    title: "Concentric radius",
    description: "Calculates aligned nested corners. Inner radius = outer − inset, clamped at 0.",
    category: "surfaces",
    classes: ["rs-nest", "rs-nest-in"],
    css: ["components/concentric-radius.css"],
    react: "components/concentric-radius.tsx",
    registryDependencies: ["button"],
    hidden: true,
    snippet: `<div class="rs-nest" style="--rs-out:28px;--rs-gap:16px;width:184px"><div class="rs-nest-in"><button class="rs-btn-primary rs-btn-sm">Save</button></div></div>`,
    example: `import { Button, Nest, NestInner, innerRadius } from "@noorddev/vlak-react";

<Nest radius={28} pad={16}>
  <NestInner>
    <Button size="sm">Save</Button>
  </NestInner>
</Nest>

innerRadius(28, 16); // 12`,
    usage: {
      use: ["Nested rounded boxes whose corners must share a centre.", "innerRadius(outer, pad) computes max(0, outer minus padding) in constant time. Obsolete fit options remain accepted but are ignored."],
      avoid: ["Square chrome; surfaces are 0 or 4px and rarely nest."],
    },
    a11y: [
      "Layout only. Nest sets --rs-out, --rs-gap, and --rs-in on a <div>.",
    ],
    aliases: ["Nested radius", "Concentric corners", "Inner radius"],
  },
  {
    name: "stepper",
    title: "Stepper",
    description: "Shows progress through ordered steps. 1px connectors; done fills with ink, active is outlined.",
    category: "navigation",
    classes: ["rs-steps", "rs-step", "rs-step-dot", "rs-step-done", "rs-step-active", "rs-step-name", "rs-step-sub", "rs-step-line"],
    css: ["components/stepper.css"],
    react: "components/stepper.tsx",
    snippet: `<div class="rs-steps"><div class="rs-step"><span class="rs-step-dot rs-step-done">1</span><span class="rs-step-line"></span><span class="rs-step-name">Brief</span></div><div class="rs-step"><span class="rs-step-dot rs-step-active">2</span><span class="rs-step-name">Design</span></div></div>`,
    example: `import { Stepper } from "@noorddev/vlak-react";

<Stepper steps={[{ name: "Brief" }, { name: "Design", sub: "In review" }, { name: "Build" }]} current={1} />`,
    usage: {
      use: ["A fixed sequence of three to six steps where the user should see what is done and what is next.", "sub for a short status under a step."],
      avoid: ["Steps the user can jump between; use Tabs.", "Progress of one task; use Progress."],
    },
    a11y: [
      "The active step carries aria-current=\"step\"; connector lines are aria-hidden.",
      "The dots are numbered text, so the order reads without color.",
    ],
    aliases: ["Stepper", "Steps", "Progress steps", "Wizard"],
  },
  {
    name: "table",
    title: "Table",
    description: "Presents structured values in rows and columns. 1px row rules; total rows use 2px rules.",
    category: "content",
    classes: ["rs-table", "rs-total-row", "rs-table-row", "rs-table-td", "rs-table-th", "rs-table-total-cell"],
    css: ["components/table.css"],
    react: "components/table.tsx",
    snippet: `<table class="rs-table"><thead><tr><th>Phase</th><th>Weeks</th></tr></thead><tbody><tr><td>Strategy</td><td>2</td></tr><tr><td>Identity</td><td>4</td></tr></tbody></table>`,
    example: `import { Table, TableBody, TableHead, TableRow, TableTd, TableTh } from "@noorddev/vlak-react";

<Table>
  <TableHead>
    <TableRow>
      <TableTh scope="col">Phase</TableTh>
      <TableTh scope="col">Weeks</TableTh>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableTd>Strategy</TableTd>
      <TableTd>2</TableTd>
    </TableRow>
    <TableRow total>
      <TableTd total>Total</TableTd>
      <TableTd total>6</TableTd>
    </TableRow>
  </TableBody>
</Table>`,
    usage: {
      use: ["Static tabular data with a last column of numbers.", "total on the closing row and its cells for 2px rules."],
      avoid: ["Sorting and empty states; use DataTable.", "Layout; use the grid."],
    },
    a11y: [
      "A native <table>; use TableTh with scope for headers and add a <caption> when the table needs a name.",
      "The ref on Table is forwarded to the <table>.",
    ],
    aliases: ["Table", "Static table", "Grid"],
  },
  {
    name: "icons",
    title: "Icons",
    description: "Provides interface marks on a 16px viewBox. 1px currentColor strokes with butt caps and miter joins.",
    category: "icons",
    classes: [
      "rs-icons",
      "rs-icon",
      "rs-icon-catalog",
      "rs-icon-group",
      "rs-icon-group-title",
      "rs-icon-grid",
      "rs-icon-cell",
      "rs-icon-pair",
      "rs-icon-kin",
      "rs-icon-label",
    ],
    css: ["components/icons.css"],
    react: "components/icon.tsx",
    snippet: `<div class="rs-icons"><svg class="rs-icon" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter"><path d="M5.5 3 H13 V10.5" vector-effect="non-scaling-stroke"/><rect x="3" y="5.5" width="7.5" height="7.5" vector-effect="non-scaling-stroke"/></svg><svg class="rs-icon" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter"><path d="M5.5 3 H13 V10.5" vector-effect="non-scaling-stroke"/><rect x="3" y="5.5" width="7.5" height="7.5" vector-effect="non-scaling-stroke"/></svg></div>`,
    example: `import { Icon, IconCatalog, iconNames } from "@noorddev/vlak-react";

<Icon name="search" size={12} />
<Icon name="search" size={16} />
<Icon name="check" size={24} variant="filled" />
<Icon name="chevron-right" rotate={90} />
<button type="button" aria-label="Close"><Icon name="close" /></button>

iconNames; // every drawn mark
<IconCatalog />`,
    usage: {
      use: ["Chrome marks at 12, 16, or 24: chevrons, close, search, sort, and the rest of the family.", "rotate for the down and up chevrons; variant=\"filled\" for the solid kin."],
      avoid: ["Illustration or brand marks; these are 1px hairline glyphs.", "Icons as the only label; add text or an aria-label on the control."],
    },
    a11y: [
      "Icon renders an inline <svg aria-hidden=\"true\">; it is decorative unless you pass aria-hidden={false}, role=\"img\", and aria-label.",
      "Icon-only controls need an aria-label; the icon never names them.",
    ],
    aliases: ["Icon", "Icons", "Icon set", "Glyphs"],
  },
  {
    name: "accordion",
    title: "Accordion",
    description: "Reveals related sections on demand. Native details rows with 1px rules.",
    category: "content",
    classes: ["rs-acc", "rs-acc-item", "rs-acc-chevron", "rs-acc-body", "rs-acc-chevron-open", "rs-acc-summary"],
    css: ["components/accordion.css"],
    react: "components/accordion.tsx",
    snippet: `<div class="rs-acc"><details class="rs-acc-item" name="faq" open><summary>What is Vlak?<svg class="rs-acc-chevron" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter"><g transform="rotate(90 8 8)"><path d="M5.5 3.5 L10.5 8 L5.5 12.5" vector-effect="non-scaling-stroke"/></g></svg></summary><div class="rs-acc-body">A minimal, CSS-first design system.</div></details><details class="rs-acc-item" name="faq"><summary>Does it require Radix?<svg class="rs-acc-chevron" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter"><g transform="rotate(90 8 8)"><path d="M5.5 3.5 L10.5 8 L5.5 12.5" vector-effect="non-scaling-stroke"/></g></svg></summary><div class="rs-acc-body">No. Native elements provide the behavior.</div></details></div>`,
    example: `import { Accordion, AccordionItem } from "@noorddev/vlak-react";

<Accordion exclusive>
  <AccordionItem title="What is Vlak?" defaultOpen>
    A minimal, CSS-first design system.
  </AccordionItem>
  <AccordionItem title="Does it require Radix?">
    No. Native elements provide the behavior.
  </AccordionItem>
</Accordion>`,
    usage: {
      use: ["FAQ and settings sections where headings should stay scannable.", "exclusive to keep one item open through the platform's details name grouping."],
      avoid: ["Hiding content most readers need; put it in the flow.", "A single item; use Collapsible."],
    },
    keyboard: [
      { keys: "Tab", does: "Moves to the next summary" },
      { keys: "Enter, Space", does: "Opens or closes the item" },
    ],
    a11y: [
      "Each item is a native <details> with a <summary>; the platform exposes the expanded state.",
      "title is the summary text and the accessible name. Controlled with open and onToggle, or uncontrolled with defaultOpen.",
    ],
    aliases: ["Accordion", "Disclosure group", "Expansion panel", "FAQ"],
  },
  {
    name: "alert",
    title: "Alert",
    description: "Calls attention to contextual information. 1px frame and icon; critical variant fills with ink.",
    category: "feedback",
    classes: ["rs-alert", "rs-alert-title", "rs-alert-body", "rs-alert-solid", "rs-alert-body-solid", "rs-alert-icon", "rs-alert-icon-solid", "rs-alert-title-solid"],
    css: ["components/alert.css"],
    react: "components/alert.tsx",
    snippet: `<div class="rs-alert" role="status"><div><span class="rs-alert-title">Heads up</span><p class="rs-alert-body">Your workspace syncs every hour.</p></div></div>`,
    example: `import { Alert } from "@noorddev/vlak-react";

<Alert title="Heads up">Your workspace syncs every hour.</Alert>
<Alert variant="solid" title="Payment failed" live="assertive">Update your card to keep publishing.</Alert>`,
    usage: {
      use: ["A persistent message that belongs to the page: a warning, a limit, a state.", "variant=\"solid\" for the one critical message in view."],
      avoid: ["Transient confirmations; use toast.", "Notes in running copy; use Callout."],
    },
    a11y: [
      "Static content renders role=\"note\". Pass live=\"polite\" (role=\"status\") or live=\"assertive\" (role=\"alert\") only when the alert appears in response to something.",
      "The default icon is decorative; icon accepts your own node.",
    ],
    aliases: ["Alert", "Banner", "Notice", "Inline message"],
  },
  {
    name: "alert-dialog",
    title: "Alert dialog",
    description: "Requires a decision before work continues. Native dialog with Escape and light dismiss disabled.",
    category: "surfaces",
    classes: ["rs-alert-dialog"],
    css: ["components/alert-dialog.css"],
    react: "components/alert-dialog.tsx",
    registryDependencies: ["dialog", "button"],
    snippet: `<dialog class="rs-dialog" role="alertdialog" closedby="none" aria-labelledby="delete-title" aria-describedby="delete-body" open><h2 class="rs-dialog-title" id="delete-title">Delete this workspace?</h2><p class="rs-dialog-body" id="delete-body">All projects go with it.</p><div class="rs-dialog-actions"><button class="rs-btn-ghost rs-btn-sm">Cancel</button><button class="rs-btn-primary rs-btn-sm">Delete</button></div></dialog>`,
    example: `import { useState } from "react";
import { AlertDialog, AlertDialogActions, AlertDialogBody, AlertDialogTitle, Button } from "@noorddev/vlak-react";

const [open, setOpen] = useState(false);

<AlertDialog open={open} onClose={() => setOpen(false)}>
  <AlertDialogTitle>Delete this workspace?</AlertDialogTitle>
  <AlertDialogBody>All projects go with it.</AlertDialogBody>
  <AlertDialogActions>
    <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Keep it</Button>
    <Button size="sm" onClick={remove}>Delete</Button>
  </AlertDialogActions>
</AlertDialog>`,
    usage: {
      use: ["Destructive or irreversible actions that need an explicit answer.", "Exactly two actions: keep and proceed."],
      avoid: ["Anything the user may dismiss without answering; use Dialog.", "Informational messages; use Alert or toast."],
    },
    keyboard: [
      { keys: "Tab, Shift + Tab", does: "Cycles focus between the actions" },
      { keys: "Enter, Space", does: "Activates the focused action" },
      { keys: "Escape", does: "Does nothing; the dialog must be answered" },
    ],
    a11y: [
      "A native modal <dialog> with role=\"alertdialog\" and closedby=\"none\": Escape and light dismiss are off.",
      "AlertDialogTitle and AlertDialogBody wire aria-labelledby and aria-describedby like Dialog; focus moves in on open and returns on close.",
    ],
    aliases: ["Alert dialog", "Confirm dialog", "Confirmation", "Destructive confirm"],
  },
  {
    name: "avatar",
    title: "Avatar",
    description: "Identifies a person or group. 32px image or initials; broken images fall back automatically.",
    category: "content",
    classes: ["rs-avatar", "rs-avatar-sm", "rs-avatar-lg", "rs-avatar-row", "rs-avatar-image", "rs-avatar-in-row"],
    css: ["components/avatar.css"],
    react: "components/avatar.tsx",
    snippet: `<div class="rs-avatar-row"><span class="rs-avatar">RV</span><span class="rs-avatar">NO</span><span class="rs-avatar">+3</span></div>`,
    example: `import { Avatar, AvatarRow } from "@noorddev/vlak-react";

<Avatar src="/renn.jpg" name="Renn" initials="RV" size="lg" />
<AvatarRow>
  <Avatar name="Renn" initials="RV" />
  <Avatar name="Noord" initials="NO" />
  <Avatar initials="+3" alt="" />
</AvatarRow>`,
    usage: {
      use: ["A person or organisation next to their name, or a row of collaborators.", "initials as the fallback while the image loads or fails."],
      avoid: ["Logos and product images; use AspectRatio.", "Decorative circles without a subject."],
    },
    a11y: [
      "The image alt defaults to name, then initials; pass alt=\"\" for a decorative avatar.",
      "Initials with a name render role=\"img\" with aria-label; without a name they are plain text.",
      "A broken image falls back to the initials.",
    ],
    aliases: ["Avatar", "Profile picture", "User image", "Avatar group"],
  },
  {
    name: "item",
    title: "Item",
    description: "Presents one list entry. Title and description sit left; metadata sits right.",
    category: "content",
    classes: ["rs-item", "rs-item-title", "rs-item-desc", "rs-item-meta"],
    css: ["components/item.css"],
    react: "components/item.tsx",
    snippet: `<div class="rs-item"><div><p class="rs-item-title">Alkmaar</p><p class="rs-item-desc">The studio city.</p></div><span class="rs-item-meta">NL</span></div>`,
    example: `import { Item } from "@noorddev/vlak-react";

<Item title="Alkmaar" description="The studio city." meta="NL" />`,
    usage: {
      use: ["Rows in a flush list: a title, a line of description, a trailing meta value.", "Settings lists, results, and directories."],
      avoid: ["Rows that navigate; wrap the title in a Link.", "Tabular numbers across many columns; use Table."],
    },
    a11y: [
      "A <div> with two <p> lines and a trailing <span>; nothing is interactive by itself.",
    ],
    aliases: ["Item", "List item", "Row", "Cell"],
  },
  {
    name: "textarea",
    title: "Textarea",
    description: "Collects multiple lines of text. Resizes vertically only.",
    category: "forms",
    classes: ["rs-textarea", "rs-textarea-invalid", "rs-textarea-feedback", "rs-textarea-field", "rs-textarea-label"],
    css: ["components/textarea.css"],
    react: "components/textarea.tsx",
    registryDependencies: ["input"],
    snippet: `<div class="rs-field"><span class="rs-field-label">Notes</span><textarea class="rs-textarea" placeholder="What should we know?"></textarea></div>`,
    example: `import { Textarea } from "@noorddev/vlak-react";

<Textarea label="Notes" placeholder="What should we know?" rows={4} />`,
    usage: {
      use: ["Free text longer than one line.", "Vertical resize only; the width follows the grid."],
      avoid: ["Single values; use Input.", "Rich text; this is a native textarea."],
    },
    keyboard: [
      { keys: "Tab", does: "Moves focus to the field; Enter inserts a line break" },
    ],
    a11y: [
      "A native <textarea> with a generated id; label renders a <label> pointing at it.",
      "Inside Field, hint and error reach it through aria-describedby and aria-invalid.",
    ],
    aliases: ["Textarea", "Text area", "Multiline input"],
  },
  {
    name: "separator",
    title: "Separator",
    description: "Separates related regions with a 1px horizontal or vertical rule.",
    category: "content",
    classes: ["rs-sep", "rs-sep-v"],
    css: ["components/separator.css"],
    react: "components/separator.tsx",
    snippet: `<hr class="rs-sep" />`,
    example: `import { Separator } from "@noorddev/vlak-react";

<Separator />
<Separator orientation="vertical" style={{ height: 16 }} />`,
    usage: {
      use: ["A hairline between groups in a stack or a row.", "orientation=\"vertical\" between inline items."],
      avoid: ["Between every list row; rows carry their own rules.", "As spacing; use the grid."],
    },
    a11y: [
      "Horizontal renders an <hr>; vertical renders role=\"separator\" with aria-orientation=\"vertical\". Neither takes focus.",
    ],
    aliases: ["Separator", "Divider", "Rule", "hr"],
  },
  {
    name: "skeleton",
    title: "Skeleton",
    description: "Reserves space while content loads. Divider-tone pulse that respects reduced motion.",
    category: "feedback",
    classes: ["rs-skeleton"],
    css: ["components/skeleton.css"],
    react: "components/skeleton.tsx",
    snippet: `<span class="rs-skeleton" style="width:180px;height:14px"></span>`,
    example: `import { Skeleton } from "@noorddev/vlak-react";

<Skeleton width="60%" />
<Skeleton width={240} height={14} />`,
    usage: {
      use: ["Holding the shape of content that is about to arrive.", "One line per line of text, at the text's height."],
      avoid: ["Waits longer than a few seconds; show a message.", "Small controls; use Spinner."],
    },
    a11y: [
      "aria-hidden; it says nothing. Set aria-busy on the region and announce the load elsewhere.",
      "The pulse stops under prefers-reduced-motion.",
    ],
    aliases: ["Skeleton", "Placeholder", "Loading placeholder", "Shimmer"],
  },
  {
    name: "empty",
    title: "Empty",
    description: "Explains an empty state with a title, one sentence, and an optional action.",
    category: "feedback",
    classes: ["rs-empty", "rs-empty-title", "rs-empty-body", "rs-empty-action"],
    css: ["components/empty.css"],
    react: "components/empty.tsx",
    registryDependencies: ["button"],
    snippet: `<div class="rs-empty"><p class="rs-empty-title">No projects yet</p><p class="rs-empty-body">Start one. The grid is empty on purpose.</p><div class="rs-empty-action"><button class="rs-btn-ghost rs-btn-sm">New project</button></div></div>`,
    example: `import { Button, Empty } from "@noorddev/vlak-react";

<Empty title="No projects yet" action={<Button variant="ghost" size="sm">New project</Button>}>
  Start one. The grid is empty on purpose.
</Empty>`,
    usage: {
      use: ["A list, table, or search with nothing to show.", "One sentence and one action at most."],
      avoid: ["Errors; use Alert.", "Loading; use Skeleton."],
    },
    a11y: [
      "Plain text in a cell; the action is whatever you pass, so give it a real control.",
    ],
    aliases: ["Empty", "Empty state", "Zero state", "No results"],
  },
  {
    name: "spinner",
    title: "Spinner",
    description: "Signals indeterminate progress. 16px ring with a 1px stroke; respects reduced motion.",
    category: "feedback",
    classes: ["rs-spinner", "rs-spinner-ring"],
    css: ["components/spinner.css"],
    react: "components/spinner.tsx",
    snippet: `<span class="rs-spinner" role="status" aria-label="Loading"><svg viewBox="0 0 16 16" width="16" height="16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-dasharray="28 13" vector-effect="non-scaling-stroke"/></svg></span>`,
    example: `import { Spinner } from "@noorddev/vlak-react";

<Spinner label="Loading" />`,
    usage: {
      use: ["Short waits of unknown length inside a control or a row.", "label to say what is loading."],
      avoid: ["Known progress; use Progress.", "Whole-page waits; use Skeleton."],
    },
    a11y: [
      "Renders role=\"status\" with aria-label from label (\"Loading\" by default); the ring is aria-hidden.",
      "The animation stops under prefers-reduced-motion.",
    ],
    aliases: ["Spinner", "Loader", "Loading indicator", "Activity indicator"],
  },
  {
    name: "tooltip",
    title: "Tooltip",
    description: "Explains a control on hover or keyboard focus. A real element describes its trigger.",
    category: "feedback",
    classes: ["rs-tip", "rs-tip-bubble"],
    css: ["components/tooltip.css"],
    react: "components/tooltip.tsx",
    registryDependencies: ["button"],
    snippet: `<span class="rs-tip"><button class="rs-btn-ghost rs-btn-sm" aria-describedby="copy-tip">Copy</button><span class="rs-tip-bubble" role="tooltip" id="copy-tip">Copy to clipboard</span></span>`,
    example: `import { Button, Tooltip } from "@noorddev/vlak-react";

<Tooltip tip="Copy to clipboard">
  <Button variant="ghost" size="sm" aria-label="Copy">Copy</Button>
</Tooltip>`,
    usage: {
      use: ["A short label for an icon-only or terse control.", "Text that adds to the name, never text that replaces it."],
      avoid: ["Content that must be read to operate the control; put it in view.", "Rich content; use HoverCard."],
    },
    keyboard: [
      { keys: "Tab", does: "Focuses the trigger and shows the tip" },
      { keys: "Escape", does: "Hides the tip until the pointer leaves" },
    ],
    a11y: [
      "The tip is a real element with role=\"tooltip\", linked to the trigger through aria-describedby.",
      "An element child is described directly (and given tabIndex when it cannot take focus); a text child makes the wrapper the trigger.",
      "Shown on hover and focus; the bubble stays hoverable.",
    ],
    aliases: ["Tooltip", "Tip", "Hint"],
  },
  {
    name: "toast",
    title: "Toast",
    description: "Reports a brief status in the bottom-right corner. Polite live region; pauses on hover and closes on demand.",
    category: "feedback",
    classes: ["rs-toasts", "rs-toast", "rs-toast-title", "rs-toast-body", "rs-toast-close"],
    css: ["components/toast.css"],
    react: "components/toast.tsx",
    snippet: `<div class="rs-toasts" role="status" aria-live="polite"><div class="rs-toast"><div><span class="rs-toast-title">Saved</span><p class="rs-toast-body">Your changes are live.</p></div><button class="rs-toast-close" type="button" aria-label="Dismiss">&times;</button></div></div>`,
    example: `import { Toaster, toast } from "@noorddev/vlak-react";

// once, in your layout
<Toaster duration={4000} closeLabel="Dismiss" />

// from anywhere
toast("Saved", { description: "Your changes are live." });`,
    usage: {
      use: ["Confirming something that already happened: saved, sent, copied.", "One line; a description only when the title needs it."],
      avoid: ["Errors the user must act on; use Alert or AlertDialog.", "Anything with a link or a button inside."],
    },
    keyboard: [
      { keys: "Tab", does: "Reaches the close button of each toast" },
      { keys: "Enter, Space", does: "Dismisses the toast" },
    ],
    a11y: [
      "The stack is role=\"status\" with aria-live=\"polite\".",
      "Each toast has a labelled close button (closeLabel, \"Dismiss\" by default).",
      "Lifetime scales with the text length and pauses while hovered or focused; duration on the call overrides it.",
    ],
    aliases: ["Toast", "Sonner", "Snackbar", "Notification"],
  },
  {
    name: "dropdown-menu",
    title: "Dropdown menu",
    description: "Presents a compact list of actions. Menu roles and arrow-key navigation are built in.",
    category: "actions",
    classes: ["rs-menu", "rs-dropdown", "rs-menu-item", "rs-menu-item-active", "rs-menu-item-disabled", "rs-menu-sep", "rs-menu-nested"],
    css: ["components/dropdown-menu.css"],
    react: "components/dropdown-menu.tsx",
    registryDependencies: ["button"],
    snippet: `<div class="rs-menu" role="menu"><button class="rs-menu-item" role="menuitem">Rename</button><button class="rs-menu-item" role="menuitem">Duplicate</button><hr class="rs-menu-sep" /><button class="rs-menu-item" role="menuitem">Delete</button></div>`,
    example: `import { DropdownMenu } from "@noorddev/vlak-react";

<DropdownMenu
  label="Actions"
  items={[
    { label: "Rename", onSelect: rename },
    { label: "Duplicate", onSelect: duplicate },
    { separator: true },
    { label: "Delete", onSelect: remove },
    { label: "Archive", disabled: true },
  ]}
/>`,
    usage: {
      use: ["Three or more actions on one object behind a single trigger.", "Separators to group destructive actions at the end."],
      avoid: ["Choosing a value; use Select.", "Navigation links; use NavigationMenu."],
    },
    keyboard: [
      { keys: "Arrow down, Enter, Space", does: "Opens the menu on the first item" },
      { keys: "Arrow up", does: "Opens the menu on the last item" },
      { keys: "Arrow down, Arrow up", does: "Moves between items and wraps" },
      { keys: "Arrow right, Arrow left", does: "Opens a child menu or returns to its parent; directions reverse in RTL" },
      { keys: "Home, End", does: "First or last item" },
      { keys: "Type letters", does: "Moves to the next item starting with them" },
      { keys: "Enter, Space", does: "Selects the item and closes" },
      { keys: "Escape", does: "Closes and returns focus to the trigger" },
      { keys: "Tab", does: "Closes and moves on" },
    ],
    a11y: [
      "The trigger is a <button> with aria-haspopup=\"menu\", aria-expanded, and aria-controls; label is its name.",
      "The panel is role=\"menu\" labelled by the trigger; items are <button role=\"menuitem\"> with one roving tab stop.",
      "Disabled items carry aria-disabled and are skipped; separators are <hr>. A click outside closes without moving focus.",
      "items opens a named nested menu. checked and onCheckedChange expose controlled menuitemcheckbox state. Escape returns to the immediate parent before closing the root menu.",
    ],
    aliases: ["Dropdown menu", "Menu", "Action menu", "Overflow menu"],
  },
  {
    name: "toggle",
    title: "Toggle",
    description: "Turns one persistent option on or off. Pressed fills with ink and exposes aria-pressed.",
    category: "actions",
    classes: ["rs-toggle", "rs-toggle-group", "rs-toggle-grouped-on", "rs-toggle-pressed"],
    css: ["components/toggle.css"],
    react: "components/toggle.tsx",
    snippet: `<div class="rs-toggle-group"><button class="rs-toggle" aria-pressed="true">Left</button><button class="rs-toggle" aria-pressed="false">Center</button><button class="rs-toggle" aria-pressed="false">Right</button></div>`,
    example: `import { useState } from "react";
import { Toggle } from "@noorddev/vlak-react";

const [bold, setBold] = useState(false);

<Toggle pressed={bold} onPressedChange={setBold} aria-label="Bold">B</Toggle>`,
    usage: {
      use: ["A formatting or filter option that is on or off and stays in view.", "Several independent toggles in a row."],
      avoid: ["A setting that applies immediately to the app; use Switch.", "One of several; use ToggleGroup."],
    },
    keyboard: [
      { keys: "Tab", does: "Moves focus to the toggle" },
      { keys: "Enter, Space", does: "Presses or releases it" },
    ],
    a11y: [
      "A native <button> with aria-pressed.",
      "Give icon-only toggles an aria-label. Controlled with pressed and onPressedChange, or uncontrolled with defaultPressed.",
    ],
    aliases: ["Toggle", "Toggle button", "Press button"],
  },
  {
    name: "toggle-group",
    title: "Toggle group",
    description: "Selects one option from joined toggles. The active option fills with ink.",
    category: "actions",
    classes: ["rs-toggle-group"],
    css: ["components/toggle.css"],
    react: "components/toggle-group.tsx",
    registryDependencies: ["toggle"],
    snippet: `<div class="rs-toggle-group"><button class="rs-toggle" aria-pressed="true">Left</button><button class="rs-toggle" aria-pressed="false">Center</button><button class="rs-toggle" aria-pressed="false">Right</button></div>`,
    example: `import { useState } from "react";
import { ToggleGroup } from "@noorddev/vlak-react";

const [align, setAlign] = useState("left");

<ToggleGroup
  aria-label="Alignment"
  options={[
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
    { value: "right", label: "Right" },
  ]}
  value={align}
  onValueChange={setAlign}
/>`,
    usage: {
      use: ["One of two to five options that should all stay visible: alignment, view mode, period.", "Short labels of equal weight."],
      avoid: ["Many or long options; use Select.", "Multiple selection; use several Toggle buttons."],
    },
    keyboard: [
      { keys: "Tab", does: "Moves between the options" },
      { keys: "Enter, Space", does: "Selects the focused option" },
    ],
    a11y: [
      "Renders role=\"group\" of native buttons with aria-pressed; pass aria-label to name the group.",
      "Controlled with value and onValueChange, or uncontrolled with defaultValue.",
    ],
    aliases: ["Toggle group", "Segmented control", "Exclusive toggles"],
  },
  {
    name: "popover",
    title: "Popover",
    description: "Places non-modal content above the page with the native Popover API and light dismiss.",
    category: "surfaces",
    classes: ["rs-popover", "rs-popover-title", "rs-popover-body"],
    css: ["components/popover.css"],
    react: "components/popover.tsx",
    registryDependencies: ["button"],
    snippet: `<button class="rs-btn-ghost rs-btn-sm" popovertarget="info">Details</button>\n<div id="info" popover="auto" class="rs-popover"><span class="rs-popover-title">Module grid</span><p class="rs-popover-body">204px modules: a 184px column and a 20px gutter.</p></div>`,
    example: `import { Popover, PopoverBody, PopoverTitle } from "@noorddev/vlak-react";

<Popover trigger="Details" align="start" aria-label="Module grid">
  <PopoverTitle>Module grid</PopoverTitle>
  <PopoverBody>204px modules: a 184px column and a 20px gutter.</PopoverBody>
</Popover>`,
    usage: {
      use: ["Secondary detail the user asks for and dismisses: a definition, a small form, a legend.", "align=\"end\" when the trigger sits at the right edge."],
      avoid: ["Menus; use DropdownMenu.", "Anything that must block the page; use Dialog."],
    },
    keyboard: [
      { keys: "Enter, Space", does: "Opens or closes from the trigger" },
      { keys: "Escape", does: "Closes (platform light dismiss)" },
      { keys: "Tab", does: "Moves into the panel" },
    ],
    a11y: [
      "The native Popover API: the panel is popover=\"auto\" in the top layer; the trigger is a ghost Button with popovertarget, so the platform manages aria-expanded and light dismiss.",
      "Name the panel with aria-label or aria-labelledby; PopoverTitle is visible text only.",
      "Placed by CSS anchor positioning where supported, else measured and flipped above when there is no room below.",
    ],
    aliases: ["Popover", "Popup", "Flyout"],
  },
  {
    name: "sheet",
    title: "Sheet",
    description: "Opens a focused task from a screen edge. Native dialog with platform focus handling and backdrop.",
    category: "surfaces",
    classes: ["rs-sheet", "rs-sheet-left", "rs-sheet-title", "rs-sheet-body", "rs-sheet-close"],
    css: ["components/sheet.css"],
    react: "components/sheet.tsx",
    registryDependencies: ["dialog"],
    snippet: `<dialog class="rs-sheet" aria-labelledby="filters-title" open><button class="rs-sheet-close" type="button" aria-label="Close">&times;</button><h2 class="rs-sheet-title" id="filters-title">Filters</h2><p class="rs-sheet-body">Everything narrows from here.</p></dialog>`,
    example: `import { useState } from "react";
import { Button, Sheet, SheetBody, SheetTitle } from "@noorddev/vlak-react";

const [open, setOpen] = useState(false);

<Button variant="ghost" onClick={() => setOpen(true)}>Filters</Button>
<Sheet open={open} onClose={() => setOpen(false)} side="right" closeLabel="Close">
  <SheetTitle>Filters</SheetTitle>
  <SheetBody>Everything narrows from here.</SheetBody>
</Sheet>`,
    usage: {
      use: ["Filters, settings, or a detail view that slides in beside the page.", "side=\"left\" for navigation on phones."],
      avoid: ["Short decisions; use Dialog.", "Content that should stay open while the page is used; the sheet is modal."],
    },
    keyboard: [
      { keys: "Escape", does: "Calls onClose (when dismissable, the default)" },
      { keys: "Tab, Shift + Tab", does: "Cycles focus inside the sheet" },
    ],
    a11y: [
      "A native modal <dialog> docked to an edge: the platform traps focus and provides the backdrop.",
      "SheetTitle names it through aria-labelledby; SheetBody describes it. Focus moves in on open and returns on close.",
      "closeLabel renders a labelled close button; lightDismiss closes on a backdrop click. The ref is forwarded to the <dialog>.",
    ],
    aliases: ["Sheet", "Side panel", "Drawer", "Slide-over", "Off-canvas"],
  },
  {
    name: "drawer",
    title: "Drawer",
    description: "Opens a focused task from the bottom edge. Native dialog with platform focus handling and backdrop.",
    category: "surfaces",
    classes: ["rs-drawer", "rs-drawer-title", "rs-drawer-body", "rs-drawer-close"],
    css: ["components/drawer.css"],
    react: "components/drawer.tsx",
    registryDependencies: ["dialog"],
    snippet: `<dialog class="rs-drawer" aria-labelledby="notes-title" open><button class="rs-drawer-close" type="button" aria-label="Close">&times;</button><h2 class="rs-drawer-title" id="notes-title">Notes</h2><p class="rs-drawer-body">A bottom panel. Escape closes it.</p></dialog>`,
    example: `import { useState } from "react";
import { Button, Drawer, DrawerBody, DrawerTitle } from "@noorddev/vlak-react";

const [open, setOpen] = useState(false);

<Button variant="ghost" onClick={() => setOpen(true)}>Notes</Button>
<Drawer open={open} onClose={() => setOpen(false)} closeLabel="Close">
  <DrawerTitle>Notes</DrawerTitle>
  <DrawerBody>A bottom panel. Escape closes it.</DrawerBody>
</Drawer>`,
    usage: {
      use: ["Phone-first panels that rise from the bottom edge: options, a share sheet, a short form.", "Content that reads in one screen."],
      avoid: ["Desktop side panels; use Sheet.", "Long content; the drawer is not a page."],
    },
    keyboard: [
      { keys: "Escape", does: "Calls onClose (when dismissable, the default)" },
      { keys: "Tab, Shift + Tab", does: "Cycles focus inside the drawer" },
    ],
    a11y: [
      "A native modal <dialog> from the bottom edge: the platform traps focus and provides the backdrop.",
      "DrawerTitle names it through aria-labelledby; DrawerBody describes it. Focus moves in on open and returns on close.",
      "closeLabel renders a labelled close button. The ref is forwarded to the <dialog>.",
    ],
    aliases: ["Drawer", "Bottom sheet", "Vaul", "Bottom panel"],
  },
  {
    name: "scroll-area",
    title: "Scroll area",
    description: "Contains overflow without visible scrollbars. 20px edge feathers signal more content.",
    category: "content",
    classes: ["rs-scroll"],
    css: ["components/scroll-area.css"],
    react: "components/scroll-area.tsx",
    snippet: `<div class="rs-scroll" style="max-height:140px" tabindex="0"><p>Alkmaar</p><p>Amsterdam</p><p>Delft</p><p>Eindhoven</p><p>Groningen</p><p>Haarlem</p><p>Rotterdam</p><p>Utrecht</p></div>`,
    example: `import { ScrollArea } from "@noorddev/vlak-react";

<ScrollArea maxHeight={240} aria-label="Cities">
  {cities.map((city) => <p key={city}>{city}</p>)}
</ScrollArea>`,
    usage: {
      use: ["A bounded list inside a fixed layout: a sidebar, a panel, a menu of many rows.", "maxHeight sets the box; the scrollbar hides and the ends feather."],
      avoid: ["Page-level scrolling; let the page scroll.", "Content that needs a visible scrollbar for orientation."],
    },
    keyboard: [
      { keys: "Tab", does: "Focuses the region" },
      { keys: "Arrow up, Arrow down, Page up, Page down", does: "Scrolls it" },
    ],
    a11y: [
      "Renders role=\"region\" with tabIndex=0, so keyboards can scroll it; aria-label defaults to \"Scrollable content\", pass your own.",
    ],
    aliases: ["Scroll area", "Scroll view", "Scrollable region", "Overflow box"],
  },
  {
    name: "chart",
    title: "Charts",
    description: "Plots one or more lines on a 204px field. 1px grid, textured series, and one optional spot color.",
    category: "charts",
    classes: ["rs-chart", "rs-chart-canvas", "rs-chart-line", "rs-chart-grid", "rs-chart-axis", "rs-chart-bar", "rs-spark", "rs-chart-legend-svg", "rs-chart-svg"],
    css: ["components/chart.css"],
    react: "components/chart.tsx",
    snippet: `<div class="rs-chart"><svg viewBox="0 0 240 64" width="240" height="64"><line class="rs-chart-grid" x1="0" x2="240" y1="56" y2="56"/><path class="rs-chart-line" d="M0 44 L40 36 L80 40 L120 22 L160 26 L200 12 L240 16"/></svg></div>`,
    example: `import { LineChart, Sparkline } from "@noorddev/vlak-react";

<LineChart
  height={204}
  labels={days}
  series={[
    { name: "Sheets", values: sheets },
    { name: "Proofs", values: proofs },
  ]}
  unit="sheets"
  yLabel="Output"
  annotations={[{ at: 3, label: "Press" }]}
  spot
/>

<Sparkline values={[3, 5, 4, 8, 7, 9]} label="Sheets" unit="k" />`,
    usage: {
      use: ["Up to four series over time on one field; solid, dashed, gray, and dotted keep them apart without hue.", "spot for the one accent the chart is allowed; Sparkline for a trend inside a row."],
      avoid: ["Categories; use BarChart.", "More than four series; split them into SmallMultiples."],
    },
    keyboard: [
      { keys: "Tab", does: "Focuses the plot" },
      { keys: "Arrow right, Arrow left", does: "Moves the cursor across the points; a status tooltip reads the values" },
      { keys: "Home, End", does: "First or last point" },
      { keys: "Escape", does: "Clears the cursor" },
    ],
    a11y: [
      "The plot is a focusable <svg role=\"group\"> with aria-roledescription=\"interactive chart\", named by aria-label, aria-labelledby, yLabel, or the series names.",
      "A visually hidden table carries every value, so the data reads without the picture; the tooltip is role=\"status\".",
      "Sparkline is role=\"img\" with a name built from label, the count, and the last value, plus the same hidden table.",
      "Numbers format through Intl.NumberFormat; locale picks the reader's own by default. Marks stay visible in forced colors.",
      "Null or non-finite samples create gaps instead of fabricated zeros. Missing values read as No data; empty plots announce their state, and an empty Sparkline has no invented last point.",
      "Explicit domains generate ticks within their bounds and clip marks to the plot. Without a domain, negative values remain visible.",
    ],
    aliases: ["Chart", "Line chart", "Sparkline", "Trend line"],
  },
  {
    name: "bar-chart",
    title: "Bar chart",
    description: "Compares values with vertical or horizontal bars. Thin ink marks, square ends, optional stacks.",
    category: "charts",
    classes: ["rs-chart-bar"],
    css: ["components/chart.css"],
    react: "components/chart.tsx",
    registryDependencies: ["chart"],
    snippet: `<div class="rs-chart"><svg viewBox="0 0 240 64" width="240" height="64"><line class="rs-chart-grid" x1="0" x2="240" y1="56" y2="56"/><rect class="rs-chart-bar" x="20" y="18" width="8" height="38"/><rect class="rs-chart-bar" x="48" y="10" width="8" height="46"/><rect class="rs-chart-bar" x="76" y="24" width="8" height="32"/></svg></div>`,
    example: `import { BarChart } from "@noorddev/vlak-react";

<BarChart
  height={204}
  orientation="horizontal"
  data={[
    { label: "Alkmaar", value: 42 },
    { label: "Delft", value: 28 },
  ]}
  unit="issues"
/>

<BarChart
  labels={["Q1", "Q2", "Q3"]}
  series={[
    { name: "Sheets", values: [12, 18, 9] },
    { name: "Proofs", values: [4, 6, 3] },
  ]}
  stacked
/>`,
    usage: {
      use: ["Comparing categories; data for one series, series plus labels for up to four grouped series.", "stacked separates positive and negative totals; orientation=\"horizontal\" and inverted work with either grouping mode."],
      avoid: ["Continuous time; use LineChart.", "Parts of one whole; use Donut or Share."],
    },
    keyboard: [
      { keys: "Tab", does: "Focuses the plot" },
      { keys: "Arrow right, Arrow left", does: "Moves the cursor across the bars; a status tooltip reads the values" },
      { keys: "Home, End", does: "First or last bar" },
      { keys: "Escape", does: "Clears the cursor" },
    ],
    a11y: [
      "The plot is a focusable <svg role=\"group\"> with aria-roledescription=\"interactive chart\", named by aria-label, aria-labelledby, yLabel, or the series names.",
      "A visually hidden table carries every value; the legend is aria-hidden because the table names the series.",
      "Every series renders. Null and non-finite bars are omitted and read as No data; signed bars retain nonzero geometry when inverted.",
    ],
    aliases: ["Bar chart", "Column chart", "Stacked bar chart", "Horizontal bar chart"],
  },
  {
    name: "area-chart",
    title: "Area chart",
    description: "Shows change and magnitude with a filled first series. 1px grid and one optional spot color.",
    category: "charts",
    classes: ["rs-chart-area"],
    css: ["components/chart.css"],
    react: "components/chart.tsx",
    registryDependencies: ["chart"],
    snippet: `<div class="rs-chart"><svg viewBox="0 0 240 64" width="240" height="64"><path class="rs-chart-area" d="M0 44 L40 36 L80 40 L120 22 L160 26 L200 12 L240 16 L240 56 L0 56 Z"/><path class="rs-chart-line" d="M0 44 L40 36 L80 40 L120 22 L160 26 L200 12 L240 16"/></svg></div>`,
    example: `import { AreaChart } from "@noorddev/vlak-react";

<AreaChart
  height={204}
  labels={days}
  series={[{ name: "Sheets", values: sheets }]}
  unit="sheets"
  annotations={[{ at: 3, label: "Press" }]}
/>`,
    usage: {
      use: ["One series over time where the volume under the line matters.", "The same props as LineChart; the first series is filled."],
      avoid: ["Several overlapping series; the fills hide each other. Use LineChart.", "Categories; use BarChart."],
    },
    keyboard: [
      { keys: "Tab", does: "Focuses the plot" },
      { keys: "Arrow right, Arrow left", does: "Moves the cursor across the points; a status tooltip reads the values" },
      { keys: "Home, End", does: "First or last point" },
      { keys: "Escape", does: "Clears the cursor" },
    ],
    a11y: [
      "Same as LineChart: a focusable, named plot and a visually hidden data table.",
    ],
    aliases: ["Area chart", "Filled line chart"],
  },
  {
    name: "scatter-chart",
    title: "Scatter chart",
    description: "Shows the relationship between two measures. Marks sit on a 1px grid in ink or one spot color.",
    category: "charts",
    classes: ["rs-chart-mark"],
    css: ["components/chart.css"],
    react: "components/chart.tsx",
    registryDependencies: ["chart"],
    snippet: `<div class="rs-chart"><svg viewBox="0 0 240 64" width="240" height="64"><line class="rs-chart-grid" x1="0" x2="240" y1="56" y2="56"/><circle class="rs-chart-mark" cx="36" cy="40" r="2"/><circle class="rs-chart-mark" cx="88" cy="22" r="2"/><circle class="rs-chart-mark" cx="140" cy="30" r="2"/><circle class="rs-chart-mark" cx="196" cy="14" r="2"/></svg></div>`,
    example: `import { ScatterChart } from "@noorddev/vlak-react";

<ScatterChart
  height={204}
  points={[{ x: 12, y: 40 }, { x: 40, y: 22, label: "Press" }, { x: 60, y: 30 }]}
  xLabel="Module"
  yLabel="Density"
  annotations={[{ at: 40, label: "204" }]}
/>`,
    usage: {
      use: ["Two numeric variables per point; group annotates the legend and accessible data table, not a separate visual mark style.", "xDomain and yDomain pin valid numeric axes; invalid or equal domains fall back to the data extent."],
      avoid: ["Ordered categories; use BarChart.", "Thousands of points; aggregate first."],
    },
    keyboard: [
      { keys: "Tab", does: "Focuses the plot" },
      { keys: "Arrow right, Arrow left", does: "Moves the cursor across the points; a status tooltip reads x and y" },
      { keys: "Home, End", does: "First or last point" },
      { keys: "Escape", does: "Clears the cursor" },
    ],
    a11y: [
      "A focusable, named plot with a visually hidden table of x and y per point.",
      "Non-finite coordinates are excluded. Empty datasets display No data to display without invalid SVG coordinates.",
    ],
    aliases: ["Scatter chart", "Scatter plot", "Dot plot", "XY chart"],
  },
  {
    name: "donut",
    title: "Donut or share",
    description: "Shows one part of a whole as a ring or flush share strip. 1px stroke.",
    category: "charts",
    classes: ["rs-chart-donut"],
    css: ["components/chart.css"],
    react: "components/chart.tsx",
    registryDependencies: ["chart"],
    snippet: `<div class="rs-chart"><svg class="rs-chart-donut" viewBox="0 0 96 96" width="96" height="96"><circle cx="48" cy="48" r="36" fill="none" stroke="currentColor" stroke-width="1"/></svg></div>`,
    example: `import { Donut, Share } from "@noorddev/vlak-react";

<Donut value={72} max={100} size={184} label="printed" />
<Share slices={[{ label: "Sheet", value: 72 }, { label: "Proof", value: 18 }, { label: "Waste", value: 10 }]} unit="%" />`,
    usage: {
      use: ["One value against its total as a ring, or a flush strip of shares.", "label under the number in the ring."],
      avoid: ["Comparing several values; use BarChart.", "More than five slices; the strip stops reading."],
    },
    a11y: [
      "Donut renders role=\"img\" named by the caption or label and the value text; a visually hidden table carries value and max.",
      "Share renders a named group of slices with a hidden table of label and value per slice.",
      "Invalid totals do not produce a percentage. Share excludes negative and non-finite slices and explains an empty total.",
    ],
    aliases: ["Donut", "Donut chart", "Ring chart", "Pie chart", "Share strip"],
  },
  {
    name: "histogram",
    title: "Histogram",
    description: "Shows a distribution in adjacent bins with 1px gaps.",
    category: "charts",
    classes: ["rs-chart-hist"],
    css: ["components/chart.css"],
    react: "components/chart.tsx",
    registryDependencies: ["chart"],
    snippet: `<div class="rs-chart"><svg viewBox="0 0 240 64" width="240" height="64"><rect class="rs-chart-hist" x="8" y="36" width="36" height="20"/><rect class="rs-chart-hist" x="45" y="20" width="36" height="36"/><rect class="rs-chart-hist" x="82" y="8" width="36" height="48"/><rect class="rs-chart-hist" x="119" y="24" width="36" height="32"/></svg></div>`,
    example: `import { Histogram } from "@noorddev/vlak-react";

<Histogram
  height={204}
  bins={[
    { label: "0–1", count: 4 },
    { label: "1–2", count: 11 },
    { label: "2–3", count: 18 },
  ]}
  yLabel="Sessions"
/>`,
    usage: {
      use: ["The distribution of one variable across ordered bins.", "Adjacent bins with a 1px seam; the order is the axis."],
      avoid: ["Unordered categories; use BarChart.", "Time series; use LineChart."],
    },
    keyboard: [
      { keys: "Tab", does: "Focuses the plot" },
      { keys: "Arrow right, Arrow left", does: "Moves the cursor across the bins; a status tooltip reads the count" },
      { keys: "Home, End", does: "First or last bin" },
      { keys: "Escape", does: "Clears the cursor" },
    ],
    a11y: [
      "A focusable, named plot with a visually hidden table of label and count per bin.",
      "Counts must be finite and non-negative; invalid bins are excluded, and an empty dataset is announced.",
    ],
    aliases: ["Histogram", "Distribution chart", "Frequency chart"],
  },
  {
    name: "small-multiples",
    title: "Small multiples",
    description: "Compares repeated charts on shared axes. Each panel occupies one 184px column.",
    category: "charts",
    classes: ["rs-chart-multi", "rs-chart-multi-item", "rs-chart-multi-cap"],
    css: ["components/chart.css"],
    react: "components/chart.tsx",
    registryDependencies: ["chart"],
    snippet: `<div class="rs-chart-multi"><div class="rs-chart"><svg viewBox="0 0 184 64" width="184" height="64"><path class="rs-chart-line" d="M0 40 L46 28 L92 34 L138 16 L184 22"/></svg></div><div class="rs-chart"><svg viewBox="0 0 184 64" width="184" height="64"><path class="rs-chart-line" d="M0 30 L46 36 L92 22 L138 28 L184 18"/></svg></div></div>`,
    example: `import { SmallMultiples } from "@noorddev/vlak-react";

<SmallMultiples
  height={136}
  panels={[
    { title: "Alkmaar", labels: days, series: [{ name: "Sheets", values: alkmaar }] },
    { title: "Delft", labels: days, series: [{ name: "Sheets", values: delft }] },
  ]}
  unit="sheets"
/>`,
    usage: {
      use: ["The same measure across places, products, or periods, one small line chart per panel on a shared value domain by default.", "Set sharedDomain=false only for independent trends; it removes direct magnitude comparison."],
      avoid: ["Panels with different units; they no longer compare.", "One series; use LineChart."],
    },
    keyboard: [
      { keys: "Tab", does: "Focuses each panel's plot in turn" },
      { keys: "Arrow right, Arrow left, Home, End, Escape", does: "Move and clear the cursor inside the focused panel" },
    ],
    a11y: [
      "Each panel is a <figure> with a caption; its plot is labelled by that caption and carries its own hidden table.",
    ],
    aliases: ["Small multiples", "Trellis chart", "Facet grid", "Panel charts"],
  },
  {
    name: "collapsible",
    title: "Collapsible",
    description: "Shows or hides one section with a native details disclosure.",
    category: "content",
    classes: ["rs-disclosure", "rs-disclosure-body", "rs-disclosure-chevron", "rs-disclosure-chevron-open", "rs-disclosure-summary"],
    css: ["components/collapsible.css"],
    react: "components/collapsible.tsx",
    registryDependencies: ["accordion"],
    snippet: `<details class="rs-disclosure"><summary>Show the details<svg class="rs-acc-chevron" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter"><g transform="rotate(90 8 8)"><path d="M5.5 3.5 L10.5 8 L5.5 12.5" vector-effect="non-scaling-stroke"/></g></svg></summary><div class="rs-disclosure-body">Here they are.</div></details>`,
    example: `import { Collapsible } from "@noorddev/vlak-react";

<Collapsible title="Show the details">Here they are.</Collapsible>
<Collapsible title="Advanced" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>…</Collapsible>`,
    usage: {
      use: ["One optional block the reader can reveal: details, advanced options, a long list.", "defaultOpen when most readers want it open."],
      avoid: ["Several related sections; use Accordion.", "Content everyone needs; leave it in the flow."],
    },
    keyboard: [
      { keys: "Tab", does: "Moves focus to the summary" },
      { keys: "Enter, Space", does: "Opens or closes it" },
    ],
    a11y: [
      "A native <details> and <summary>; the platform exposes the expanded state and title is the name.",
    ],
    aliases: ["Collapsible", "Disclosure", "Details", "Expander"],
  },
  {
    name: "hover-card",
    title: "Hover card",
    description: "Previews linked context on hover or keyboard focus.",
    category: "surfaces",
    classes: ["rs-hover-card", "rs-hover-card-panel", "rs-hover-card-open"],
    css: ["components/hover-card.css"],
    react: "components/hover-card.tsx",
    snippet: `<span class="rs-hover-card"><span tabindex="0" aria-describedby="noord-card">@noord</span><span class="rs-hover-card-panel" role="tooltip" id="noord-card">Noord, a venture studio in Alkmaar. Ten portfolio companies, one design system.</span></span>`,
    example: `import { HoverCard, Link } from "@noorddev/vlak-react";

<HoverCard trigger={<Link href="/noord">@noord</Link>}>
  Noord, a venture studio in Alkmaar. Ten portfolio companies, one design system.
</HoverCard>`,
    usage: {
      use: ["A preview of the thing a link points at: a profile, a document, a place.", "Rich content that is not needed to use the link."],
      avoid: ["One-line labels; use Tooltip.", "Content with its own controls; use Popover."],
    },
    keyboard: [
      { keys: "Tab", does: "Focuses the trigger and shows the card" },
      { keys: "Escape", does: "Hides the card until the pointer leaves" },
    ],
    a11y: [
      "The panel is role=\"tooltip\" and describes the trigger through aria-describedby.",
      "A focusable trigger element is used as is; anything else is wrapped in a tab stop.",
    ],
    aliases: ["Hover card", "Preview card", "Profile card", "Rich tooltip"],
  },
  {
    name: "kbd",
    title: "Kbd",
    description: "Labels a keyboard key. Monospace cap with a 1px frame and heavier bottom edge.",
    category: "content",
    classes: ["rs-kbd", "rs-kbd-pair"],
    css: ["components/kbd.css"],
    react: "components/kbd.tsx",
    snippet: `<kbd class="rs-kbd">⌘</kbd> <kbd class="rs-kbd">K</kbd>`,
    example: `import { Kbd, KbdPair } from "@noorddev/vlak-react";

<KbdPair><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdPair>`,
    usage: {
      use: ["Showing a shortcut next to a command or in help copy.", "KbdPair to keep a chord together."],
      avoid: ["Code; use Chip.", "Buttons; a key cap is not a control."],
    },
    a11y: [
      "Renders a native <kbd>; screen readers read the characters. Spell out modifier symbols in surrounding text when they matter.",
    ],
    aliases: ["Kbd", "Keyboard key", "Key cap", "Shortcut"],
  },
  {
    name: "input-otp",
    title: "One-time code",
    description: "Collects a one-time code in one cell per character. Supports auto-advance, backspace, and paste.",
    category: "forms",
    classes: ["rs-otp", "rs-otp-cell", "rs-otp-cell-invalid"],
    css: ["components/input-otp.css"],
    react: "components/input-otp.tsx",
    snippet: `<div class="rs-otp" role="group" aria-label="One-time code"><input class="rs-otp-cell" maxlength="1" value="8" aria-label="Digit 1" /><input class="rs-otp-cell" maxlength="1" value="2" aria-label="Digit 2" /><input class="rs-otp-cell" maxlength="1" aria-label="Digit 3" /><input class="rs-otp-cell" maxlength="1" aria-label="Digit 4" /></div>`,
    example: `import { InputOTP } from "@noorddev/vlak-react";

<InputOTP length={6} aria-label="One-time code" onComplete={(code) => verify(code)} />`,
    usage: {
      use: ["Numeric verification codes from SMS, mail, or an authenticator.", "onComplete to submit as soon as the last cell fills."],
      avoid: ["Alphanumeric codes; the cells strip non-digits.", "Passwords; use Input type=\"password\"."],
    },
    keyboard: [
      { keys: "Type a digit", does: "Fills the cell and moves to the next" },
      { keys: "Backspace", does: "Clears the cell; on an empty cell moves back and clears the previous one" },
      { keys: "Arrow left, Arrow right", does: "Moves between cells" },
      { keys: "Paste", does: "Fills from the current cell onward" },
    ],
    a11y: [
      "Renders role=\"group\" named by aria-label (\"One-time code\" by default); each cell is an <input> named \"Digit n\".",
      "inputMode=\"numeric\" and autoComplete=\"one-time-code\" on the first cell let phones offer the code.",
      "Inside Field, hint and error reach the group and cells through aria-describedby and aria-invalid.",
      "Controlled with value and onValueChange, or uncontrolled with defaultValue; name submits one hidden complete-code value. disabled and readOnly apply to every cell.",
      "Each cell has a 44px target and 4px corners. length is clamped to 1–12; onComplete fires once per distinct complete code until it changes.",
    ],
    aliases: ["One-time code", "OTP input", "InputOTP", "PIN input", "Verification code"],
  },
  {
    name: "context-menu",
    title: "Context menu",
    description: "Opens actions at the pointer or with Shift+F10. Escape and outside click close the menu.",
    category: "actions",
    classes: ["rs-context-menu-trigger", "rs-context-menu-pin"],
    css: ["components/context-menu.css"],
    react: "components/context-menu.tsx",
    registryDependencies: ["dropdown-menu"],
    snippet: `<div class="rs-menu" role="menu"><button class="rs-menu-item" role="menuitem">Copy</button><button class="rs-menu-item" role="menuitem">Paste</button><hr class="rs-menu-sep" /><button class="rs-menu-item" role="menuitem">Inspect</button></div>`,
    example: `import { ContextMenu } from "@noorddev/vlak-react";

<ContextMenu items={[{ label: "Copy", onSelect: copy }, { label: "Paste", onSelect: paste }, { separator: true }, { label: "Inspect" }]}>
  <Canvas />
</ContextMenu>`,
    usage: {
      use: ["Actions on a region or object that already has a primary interaction: a canvas, a row, a file.", "The same items shape as DropdownMenu."],
      avoid: ["Actions with no other way in; add a visible DropdownMenu too.", "Touch-only surfaces without a long-press alternative."],
    },
    keyboard: [
      { keys: "Shift + F10, Context menu key", does: "Opens the menu at the wrapper" },
      { keys: "Arrow down, Arrow up, Home, End, Type letters", does: "Move between items" },
      { keys: "Enter, Space", does: "Selects the item and closes" },
      { keys: "Escape", does: "Closes and returns focus" },
    ],
    a11y: [
      "The wrapper is a tab stop with aria-keyshortcuts=\"Shift+F10\"; pass tabIndex={-1} when the child is focusable itself.",
      "The panel is role=\"menu\" with menuitem buttons, roving focus, and type-ahead; focus returns to whatever had it when the menu closes.",
      "Right-click opens at the pointer; the keyboard opens at the trigger's edge.",
    ],
    aliases: ["Context menu", "Right-click menu", "Contextual menu"],
  },
  {
    name: "menubar",
    title: "Menubar",
    description: "Groups application menus in one row of dropdowns with a 1px frame.",
    category: "actions",
    classes: ["rs-menubar"],
    css: ["components/menubar.css"],
    react: "components/menubar.tsx",
    registryDependencies: ["dropdown-menu"],
    snippet: `<div class="rs-menubar" role="menubar"><button class="rs-dropdown" role="menuitem" aria-haspopup="menu"><span>File</span></button><button class="rs-dropdown" role="menuitem" aria-haspopup="menu"><span>Edit</span></button><button class="rs-dropdown" role="menuitem" aria-haspopup="menu"><span>View</span></button></div>`,
    example: `import { Menubar } from "@noorddev/vlak-react";

<Menubar
  menus={[
    { label: "File", items: [{ label: "New", onSelect: create }, { label: "Open…", onSelect: open }] },
    { label: "Edit", items: [{ label: "Undo", onSelect: undo }, { label: "Redo", onSelect: redo }] },
  ]}
/>`,
    usage: {
      use: ["Desktop-style application menus: File, Edit, View.", "Tools and editors with many commands grouped by verb."],
      avoid: ["Site navigation; use NavigationMenu.", "One menu; use DropdownMenu."],
    },
    keyboard: [
      { keys: "Tab", does: "Moves focus to the bar (one roving tab stop)" },
      { keys: "Arrow left, Arrow right", does: "Moves between menus; an open menu follows" },
      { keys: "Home, End", does: "First or last menu" },
      { keys: "Arrow down, Enter, Space", does: "Opens the menu on the first item" },
      { keys: "Arrow up", does: "Opens the menu on the last item" },
      { keys: "Escape", does: "Closes the open menu and returns focus to its trigger" },
    ],
    a11y: [
      "Renders role=\"menubar\"; each trigger is a <button role=\"menuitem\"> with aria-haspopup=\"menu\", aria-expanded, and aria-controls.",
      "Open panels are role=\"menu\" labelled by their trigger, with the same keyboard model as DropdownMenu.",
    ],
    aliases: ["Menubar", "Menu bar", "Application menu"],
  },
  {
    name: "navigation-menu",
    title: "Navigation menu",
    description: "Moves between primary destinations. Horizontal links; the current page is full ink.",
    category: "navigation",
    classes: ["rs-nav", "rs-nav-link"],
    css: ["components/navigation-menu.css"],
    react: "components/navigation-menu.tsx",
    snippet: `<nav class="rs-nav"><a href="#" aria-current="page">Overview</a><a href="#">Docs</a><a href="#">Changelog</a></nav>`,
    example: `import { NavigationMenu } from "@noorddev/vlak-react";

<NavigationMenu
  aria-label="Primary"
  items={[
    { label: "Overview", href: "/", current: true },
    { label: "Docs", href: "/docs" },
    { label: "Changelog", href: "/changelog" },
  ]}
/>`,
    usage: {
      use: ["The main links of a site in one row.", "current on the item for the page you are on."],
      avoid: ["Nested menus; keep the row flat and use a Sidebar for depth.", "Actions; use Button."],
    },
    keyboard: [
      { keys: "Tab", does: "Moves between the links" },
      { keys: "Enter", does: "Follows the link" },
    ],
    a11y: [
      "Renders <nav> with aria-label (\"Primary\" by default) and plain <a> links; the current page carries aria-current=\"page\".",
    ],
    aliases: ["Navigation menu", "Nav", "Top navigation", "Navbar", "Header links"],
  },
  {
    name: "sidebar",
    title: "Sidebar",
    description: "Holds persistent navigation in a 204px rail with a head, body, and foot.",
    category: "navigation",
    classes: ["rs-sidebar", "rs-sidebar-head", "rs-sidebar-nav", "rs-sidebar-item", "rs-sidebar-label", "rs-sidebar-foot"],
    css: ["components/sidebar.css"],
    react: "components/sidebar.tsx",
    snippet: `<aside class="rs-sidebar"><div class="rs-sidebar-head">Vlak</div><nav class="rs-sidebar-nav"><p class="rs-sidebar-label">Go to</p><a class="rs-sidebar-item" aria-current="page">Overview</a><a class="rs-sidebar-item" href="#">Docs</a><a class="rs-sidebar-item" href="#">Components</a></nav><div class="rs-sidebar-foot">0.3</div></aside>`,
    example: `import { Sidebar, SidebarFoot, SidebarHead, SidebarItem, SidebarLabel, SidebarNav } from "@noorddev/vlak-react";

<Sidebar>
  <SidebarHead>Vlak</SidebarHead>
  <SidebarNav aria-label="Sidebar">
    <SidebarLabel>Go to</SidebarLabel>
    <SidebarItem href="/" current>Overview</SidebarItem>
    <SidebarItem href="/docs">Docs</SidebarItem>
    <SidebarItem href="/components">Components</SidebarItem>
  </SidebarNav>
  <SidebarFoot>0.3</SidebarFoot>
</Sidebar>`,
    usage: {
      use: ["A 204px rail for app or docs navigation with a head, groups of links, and a foot.", "SidebarLabel to name each group of items."],
      avoid: ["Marketing sites; use NavigationMenu.", "Collapsing it on desktop; the rail is the layout."],
    },
    keyboard: [
      { keys: "Tab", does: "Moves between the items" },
      { keys: "Enter", does: "Follows the link" },
    ],
    a11y: [
      "Sidebar is an <aside>; SidebarNav is a <nav> named by aria-label (\"Sidebar\" by default).",
      "SidebarItem is an <a>; current sets aria-current=\"page\".",
    ],
    aliases: ["Sidebar", "Side nav", "Rail", "Navigation drawer"],
  },
  {
    name: "carousel",
    title: "Carousel",
    description: "Browses a sequence on a scroll-snap track. Buttons move one slide; the ends feather.",
    category: "content",
    classes: ["rs-carousel", "rs-carousel-track", "rs-carousel-slide", "rs-carousel-nav", "rs-carousel-icon", "rs-carousel-page"],
    css: ["components/carousel.css"],
    react: "components/carousel.tsx",
    registryDependencies: ["pagination"],
    snippet: `<div class="rs-carousel"><div class="rs-carousel-track"><div class="rs-carousel-slide">One</div><div class="rs-carousel-slide">Two</div><div class="rs-carousel-slide">Three</div></div><div class="rs-carousel-nav"><button class="rs-page"><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter"><path d="M10.5 3.75 L5.5 8.25 L10.5 12.75" vector-effect="non-scaling-stroke"/></svg></button><button class="rs-page"><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter"><path d="M5.5 3.75 L10.5 8.25 L5.5 12.75" vector-effect="non-scaling-stroke"/></svg></button></div></div>`,
    example: `import { Carousel, CarouselSlide } from "@noorddev/vlak-react";

<Carousel aria-label="Case studies">
  {cases.map((c) => (
    <CarouselSlide key={c.id}>
      <CaseCard {...c} />
    </CarouselSlide>
  ))}
</Carousel>`,
    usage: {
      use: ["A row of cards or images wider than the page, browsed one nudge at a time.", "Scroll snap does the alignment; the buttons nudge by 80% of the width."],
      avoid: ["Autoplay or hero sliders; nothing moves on its own.", "Essential content only reachable by scrolling; show it in the flow too."],
    },
    keyboard: [
      { keys: "Tab", does: "Focuses the track, then the previous and next buttons" },
      { keys: "Arrow left, Arrow right", does: "Scrolls the focused track" },
      { keys: "Enter, Space", does: "Nudges from the buttons" },
    ],
    a11y: [
      "The track is role=\"region\" with aria-roledescription=\"carousel\", named by aria-label, and focusable.",
      "CarouselSlide is role=\"group\" with aria-roledescription=\"slide\", named \"n of N\" unless you pass aria-label.",
      "The buttons are labelled \"Previous\" and \"Next\".",
    ],
    aliases: ["Carousel", "Slideshow", "Embla", "Swiper"],
  },
  {
    name: "resizable",
    title: "Resizable",
    description: "Resizes two adjacent panes with a draggable 1px handle. Arrow keys adjust the split.",
    category: "surfaces",
    classes: ["rs-split", "rs-split-pane", "rs-split-handle"],
    css: ["components/resizable.css"],
    react: "components/resizable.tsx",
    snippet: `<div class="rs-split"><div class="rs-split-pane" style="width:50%">Left</div><button class="rs-split-handle" role="separator" aria-valuenow="50"></button><div class="rs-split-pane" style="width:50%">Right</div></div>`,
    example: `import { Split } from "@noorddev/vlak-react";

<Split initial={60} min={30} max={80} handleLabel="Resize editor and preview">
  <Editor />
  <Preview />
</Split>`,
    usage: {
      use: ["Two panes the user sizes against each other: editor and preview, list and detail.", "Percentages for initial, min, and max."],
      avoid: ["More than two panes; nest a Split.", "Layouts that should stack on phones by other rules; it stacks at 640px on its own."],
    },
    keyboard: [
      { keys: "Tab", does: "Focuses the handle" },
      { keys: "Arrow left, Arrow up", does: "Shrinks the first pane by 2%" },
      { keys: "Arrow right, Arrow down", does: "Grows it by 2%" },
      { keys: "Shift + Arrow keys", does: "Moves by 10%" },
      { keys: "Home, End", does: "Jumps to min or max" },
    ],
    a11y: [
      "The handle is a <button role=\"separator\"> with aria-orientation, aria-valuenow, aria-valuemin, aria-valuemax, and aria-label from handleLabel.",
      "Below 640px the panes stack and the axis follows: the orientation flips and the arrows move vertically.",
    ],
    aliases: ["Resizable", "Split pane", "Resizable panels", "Splitter", "Panel group"],
  },
  {
    name: "combobox",
    title: "Combobox",
    description: "Filters and selects an option from a listbox through one text field.",
    category: "forms",
    classes: ["rs-combobox", "rs-combobox-empty"],
    css: ["components/combobox.css"],
    react: "components/combobox.tsx",
    registryDependencies: ["input", "dropdown-menu"],
    snippet: `<div class="rs-combobox"><input class="rs-input rs-input-full" role="combobox" placeholder="Search…" /><div class="rs-menu" role="listbox"><div class="rs-menu-item rs-menu-item-active" role="option" aria-selected="false">Alkmaar</div><div class="rs-menu-item" role="option" aria-selected="false">Amsterdam</div></div></div>`,
    example: `import { useState } from "react";
import { Combobox } from "@noorddev/vlak-react";

const [city, setCity] = useState("");

<Combobox
  aria-label="City"
  options={cities}
  value={city}
  onValueChange={setCity}
  placeholder="Search cities…"
  emptyLabel="No city matches."
/>`,
    usage: {
      use: ["One choice from a long list the user knows how to type: cities, people, tags.", "searchText on an option when its label is not a plain string."],
      avoid: ["Short lists; use Select.", "Free-form values not in the list; the combobox only picks options."],
    },
    keyboard: [
      { keys: "Type", does: "Filters the options and opens the list" },
      { keys: "Arrow down", does: "Opens the list on the selected option, then moves down" },
      { keys: "Arrow up", does: "Opens the list on the last option, then moves up" },
      { keys: "Home, End", does: "First or last match" },
      { keys: "Page up, Page down", does: "Moves ten matches" },
      { keys: "Enter", does: "Picks the active match and closes" },
      { keys: "Escape", does: "Clears the search and closes" },
      { keys: "Tab", does: "Closes and moves on" },
    ],
    a11y: [
      "APG editable combobox: an <input role=\"combobox\"> with aria-autocomplete=\"list\", aria-expanded, aria-controls, and aria-activedescendant; focus stays in the input.",
      "The list is role=\"listbox\" with role=\"option\" rows carrying aria-selected; it does not open on focus alone.",
      "Pass aria-label or aria-labelledby. Controlled with value and onValueChange, or uncontrolled with defaultValue.",
    ],
    aliases: ["Combobox", "Autocomplete", "Typeahead", "Searchable select"],
  },
  {
    name: "command",
    title: "Command",
    description: "Finds and runs commands in a native dialog. Filter by typing; navigate with arrows and Enter.",
    category: "actions",
    classes: ["rs-command", "rs-command-input", "rs-command-list", "rs-command-group", "rs-command-item", "rs-command-item-active", "rs-command-hint", "rs-command-empty"],
    css: ["components/command.css"],
    react: "components/command.tsx",
    registryDependencies: ["dialog"],
    snippet: `<div class="rs-command" style="border:1px solid var(--divider);border-radius:var(--radius)"><input class="rs-command-input" placeholder="Type a command or search…" /><div class="rs-command-list" role="listbox"><div class="rs-command-group">Go to</div><div class="rs-command-item rs-command-item-active" role="option" aria-selected="true"><span>Components</span><span class="rs-command-hint">⌘1</span></div><div class="rs-command-item" role="option" aria-selected="false"><span>Tokens</span><span class="rs-command-hint">⌘2</span></div></div></div>`,
    example: `import { useEffect, useState } from "react";
import { CommandDialog } from "@noorddev/vlak-react";

const [open, setOpen] = useState(false);

// wire the shortcut once in your app
useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setOpen(true);
    }
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, []);

<CommandDialog
  open={open}
  onClose={() => setOpen(false)}
  groups={[
    { label: "Go to", items: [{ label: "Components", hint: "⌘1", onSelect: () => go("/components") }] },
    { label: "Actions", items: [{ label: "New project", keywords: "create add", onSelect: create }] },
  ]}
/>`,
    usage: {
      use: ["A palette of commands and destinations behind one shortcut.", "keywords on an item to widen the match; hint for the shortcut label."],
      avoid: ["Picking a value for a field; use Combobox.", "Fewer than ten commands; use DropdownMenu."],
    },
    keyboard: [
      { keys: "Type", does: "Filters the items by label and keywords" },
      { keys: "Arrow down, Arrow up", does: "Moves the active item" },
      { keys: "Home, End", does: "First or last item" },
      { keys: "Page up, Page down", does: "Moves ten items" },
      { keys: "Enter", does: "Runs the active item and closes" },
      { keys: "Escape", does: "Closes" },
    ],
    a11y: [
      "The input is role=\"combobox\" named \"Command\" with aria-autocomplete=\"list\" and aria-activedescendant; the list is role=\"listbox\" with labelled role=\"group\" sections.",
      "CommandDialog places it in a native modal <dialog>; Command alone renders inline. The input takes focus on mount.",
    ],
    aliases: ["Command", "Command palette", "cmdk", "Command menu", "Spotlight"],
  },
  {
    name: "calendar",
    title: "Calendar",
    description: "Selects a date from a month grid. Selected day fills with ink; today has a 1px outline.",
    category: "forms",
    classes: ["rs-cal", "rs-cal-head", "rs-cal-title", "rs-cal-nav", "rs-cal-grid", "rs-cal-row", "rs-cal-dow", "rs-cal-day", "rs-cal-day-out", "rs-cal-day-today", "rs-cal-day-selected", "rs-cal-icon", "rs-cal-page"],
    css: ["components/calendar.css"],
    react: "components/calendar.tsx",
    registryDependencies: ["pagination"],
    snippet: `<div class="rs-cal"><div class="rs-cal-head"><span class="rs-cal-title">July 2026</span><span class="rs-cal-nav"><button class="rs-page"><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter"><path d="M10.5 3.75 L5.5 8.25 L10.5 12.75" vector-effect="non-scaling-stroke"/></svg></button><button class="rs-page"><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter"><path d="M5.5 3.75 L10.5 8.25 L5.5 12.75" vector-effect="non-scaling-stroke"/></svg></button></span></div><div class="rs-cal-grid" role="grid"><div class="rs-cal-row" role="row"><span class="rs-cal-dow" role="columnheader">Mo</span><span class="rs-cal-dow" role="columnheader">Tu</span><span class="rs-cal-dow" role="columnheader">We</span><span class="rs-cal-dow" role="columnheader">Th</span><span class="rs-cal-dow" role="columnheader">Fr</span><span class="rs-cal-dow" role="columnheader">Sa</span><span class="rs-cal-dow" role="columnheader">Su</span></div><div class="rs-cal-row" role="row"><button class="rs-cal-day" role="gridcell" tabindex="-1">20</button><button class="rs-cal-day" role="gridcell" tabindex="-1">21</button><button class="rs-cal-day" role="gridcell" tabindex="-1">22</button><button class="rs-cal-day" role="gridcell" tabindex="-1">23</button><button class="rs-cal-day rs-cal-day-selected" role="gridcell" tabindex="0" aria-selected="true">24</button><button class="rs-cal-day rs-cal-day-today" role="gridcell" tabindex="-1" aria-current="date">25</button><button class="rs-cal-day" role="gridcell" tabindex="-1">26</button></div></div></div>`,
    example: `import { useState } from "react";
import { Calendar } from "@noorddev/vlak-react";

const [date, setDate] = useState<Date>();

<Calendar value={date} onValueChange={setDate} weekStart={1} />`,
    usage: {
      use: ["Picking one day when the month context matters: bookings, deadlines, schedules.", "Inline on the page; DatePicker wraps it in a trigger."],
      avoid: ["Typing a known date; use Input type=\"date\".", "Ranges; the grid selects one day."],
    },
    keyboard: [
      { keys: "Tab", does: "Focuses the month buttons, then the roving day" },
      { keys: "Arrow left, Arrow right", does: "Previous or next day" },
      { keys: "Arrow up, Arrow down", does: "Same day the week before or after" },
      { keys: "Home, End", does: "First or last day of the week" },
      { keys: "Page up, Page down", does: "Same day the month before or after" },
      { keys: "Shift + Page up, Shift + Page down", does: "Same day the year before or after" },
      { keys: "Enter, Space", does: "Selects the focused available day" },
    ],
    a11y: [
      "Renders role=\"grid\" labelled by the month title, which is aria-live=\"polite\"; rows are role=\"row\" and weekday headers are role=\"columnheader\" with long names.",
      "Days are <button role=\"gridcell\"> with a full-date aria-label, aria-selected, and aria-current=\"date\" on today; one roving tab stop.",
      "Previous and next month buttons are labelled. Controlled with value and onValueChange, or uncontrolled with defaultValue.",
      "Days and month controls are 44px targets. min, max and isDateDisabled prevent selection; unavailable days expose aria-disabled while remaining discoverable with arrows.",
      "locale formats the month, weekdays and full-date labels; weekStart sets Sunday or Monday independently. disabled removes the day grid from the tab order.",
    ],
    aliases: ["Calendar", "Date grid", "Month view", "Day picker"],
  },
  {
    name: "date-picker",
    title: "Date picker",
    description: "Selects a date from a calendar overlay opened by a 1px trigger.",
    category: "forms",
    classes: ["rs-date-picker-cal-menu"],
    css: ["components/date-picker.css"],
    react: "components/date-picker.tsx",
    registryDependencies: ["dropdown-menu", "calendar"],
    snippet: `<button class="rs-dropdown"><span>24 July 2026</span></button>`,
    example: `import { useState } from "react";
import { DatePicker } from "@noorddev/vlak-react";

const [date, setDate] = useState<Date>();

<DatePicker value={date} onValueChange={setDate} placeholder="Pick a date" dialogLabel="Choose a date" />`,
    usage: {
      use: ["A date field in a form where the calendar should stay out of the way until asked.", "format to render the chosen date your way."],
      avoid: ["Dates the user knows by heart; use Input type=\"date\".", "Always-visible calendars; use Calendar."],
    },
    keyboard: [
      { keys: "Enter, Space, Arrow down", does: "Opens the calendar" },
      { keys: "Arrow keys, Home, End, Page up, Page down", does: "Move through the calendar" },
      { keys: "Enter, Space", does: "Selects the day and closes" },
      { keys: "Escape", does: "Closes and returns focus to the trigger" },
      { keys: "Tab", does: "Moves through the calendar controls; leaving the picker closes it" },
    ],
    a11y: [
      "The trigger is a <button> with aria-haspopup=\"dialog\", aria-expanded, and aria-controls; the calendar sits in a non-modal role=\"dialog\" named by dialogLabel.",
      "On open, focus moves to the selected day or today; on close it returns to the trigger.",
      "min, max, isDateDisabled and locale pass through to Calendar. The native top-layer panel follows its trigger and flips or clamps to the viewport.",
      "Controlled with value and onValueChange, or uncontrolled with defaultValue.",
    ],
    aliases: ["Date picker", "DatePicker", "Date input", "Date field"],
  },
  {
    name: "data-table",
    title: "Data table",
    description: "Sorts, filters and selects structured records. Native controls expose sort and selection state.",
    category: "content",
    classes: ["rs-datatable-sort", "rs-datatable-empty", "rs-datatable-sort-icon", "rs-datatable-sort-icon-on", "rs-datatable-table", "rs-datatable-td", "rs-datatable-td-alt", "rs-datatable-th", "rs-datatable-scroll", "rs-datatable-td-selected"],
    css: ["components/data-table.css"],
    react: "components/data-table.tsx",
    registryDependencies: ["table", "input", "checkbox"],
    snippet: `<table class="rs-table"><thead><tr><th><button class="rs-datatable-sort">Phase</button></th><th>Weeks</th></tr></thead><tbody><tr><td>Identity</td><td>4</td></tr><tr><td>Strategy</td><td>2</td></tr></tbody></table>`,
    example: `import { DataTable } from "@noorddev/vlak-react";

<DataTable
  columns={[
    { key: "phase", header: "Phase", sortable: true },
    { key: "weeks", header: "Weeks", sortable: true },
    { key: "owner", header: "Owner", render: (row) => row.owner.name },
  ]}
  rows={rows}
  rowKey={(row) => row.id}
  emptyLabel="No phases yet."
/>`,
    usage: {
      use: ["Rows from data with controlled or default sorting, selection keys and text filtering.", "render for rich cells, sortValue for sort keys, filterRow for custom filtering, and a stable rowKey to keep selection attached to records."],
      avoid: ["Hand-written rows; use Table.", "Inline editing or pagination; compose those around it. Large datasets need windowing or server-side data management."],
    },
    keyboard: [
      { keys: "Tab", does: "Moves through the optional filter, sort buttons and selection checkboxes" },
      { keys: "Enter, Space", does: "Sorts ascending, then descending, then clears" },
    ],
    a11y: [
      "Sortable headers hold a native <button>; the <th> carries aria-sort while sorted.",
      "Filter and sort have value/callback pairs: filter/onFilterChange and sort/onSortChange, with defaultFilter/defaultSort for local state.",
      "selectable adds native checkboxes; selectedKeys/onSelectionChange controls selection, with defaultSelectedKeys for local state. Select all affects visible filtered rows and exposes mixed state.",
      "A horizontal scroll container keeps the table inside its grid; caption names the data. Empty filtered results are a live status. Interactive targets are at least 44px.",
    ],
    aliases: ["Data table", "Sortable table", "Grid"],
  },
  {
    name: "aspect-ratio",
    title: "Aspect ratio",
    description: "Keeps media at a defined aspect ratio while it fills the available box.",
    category: "content",
    classes: ["rs-ratio"],
    css: ["components/aspect-ratio.css"],
    react: "components/aspect-ratio.tsx",
    snippet: `<div class="rs-ratio" style="aspect-ratio:16/9;max-width:280px;background:var(--divider-subtle)"></div>`,
    example: `import { AspectRatio } from "@noorddev/vlak-react";

<AspectRatio ratio={16 / 9}>
  <img src="/cover.jpg" alt="Press hall" />
</AspectRatio>`,
    usage: {
      use: ["Images, video, and embeds that must hold a ratio before they load.", "ratio as width over height."],
      avoid: ["Text boxes; let content set the height.", "Avatars; use Avatar."],
    },
    a11y: [
      "Layout only; the media inside carries its own alt or title.",
    ],
    aliases: ["Aspect ratio", "Ratio box", "Media frame"],
  },
  {
    name: "form",
    title: "Form",
    description: "Collects related inputs as stacked fields with one primary action at the end.",
    category: "forms",
    classes: ["rs-form"],
    css: ["components/form.css"],
    react: "components/form.tsx",
    registryDependencies: ["field", "input", "button"],
    snippet: `<form class="rs-form"><div class="rs-field"><span class="rs-field-label">Name</span><input class="rs-input rs-input-full" /></div><div class="rs-field"><span class="rs-field-label">E-mail</span><input class="rs-input rs-input-full" /></div><button class="rs-btn-primary">Send</button></form>`,
    example: `import { Button, Field, FieldLabel, Form, Input } from "@noorddev/vlak-react";

<Form onSubmit={(e) => { e.preventDefault(); save(); }}>
  <Field>
    <FieldLabel htmlFor="name">Name</FieldLabel>
    <Input plain id="name" required />
  </Field>
  <Field>
    <FieldLabel htmlFor="email">E-mail</FieldLabel>
    <Input plain id="email" type="email" required />
  </Field>
  <Button type="submit">Send</Button>
</Form>`,
    usage: {
      use: ["Any form: fields stack, one primary action at the end.", "Native validation attributes; the platform reports them."],
      avoid: ["Search boxes and single fields; use InlineForm.", "Multi-column layouts; stack instead."],
    },
    keyboard: [
      { keys: "Enter", does: "Submits from a text field" },
    ],
    a11y: [
      "A native <form>; name it with aria-label or aria-labelledby when the page has more than one.",
      "Field wires labels, hints, and errors to the controls.",
    ],
    aliases: ["Form", "Form layout", "Stacked form"],
  },
  {
    name: "workflow",
    title: "Workflow card",
    description: "Frames an ordered pipeline. 1px dashed frame, chips, and a ghost add action. Reordering is supplied by SortableList.",
    category: "patterns",
    classes: ["rs-flow", "rs-flow-step", "rs-flow-num", "rs-flow-subs", "rs-flow-sub-add", "rs-flow-add", "rs-flow-plus", "rs-flow-body", "rs-flow-sub", "rs-flow-title"],
    css: ["components/workflow.css"],
    react: "components/flow.tsx",
    snippet: `<div class="rs-flow" style="grid-template-columns:184px;width:184px"><div class="rs-flow-step"><span class="rs-flow-num">1</span><h3 class="rs-flow-title">Proposal</h3><p>Scope, timeline, and fee on one page.</p><div class="rs-flow-subs"><span>Brief</span><span>Fee</span><span class="rs-flow-sub-add">+</span></div></div><button type="button" class="rs-flow-add"><span class="rs-flow-plus">+</span> Add a step</button></div>`,
    example: `import { Flow, FlowAdd, FlowBody, FlowNum, FlowStep, FlowSub, FlowSubAdd, FlowSubs, FlowTitle } from "@noorddev/vlak-react";

<Flow>
  <FlowStep>
    <FlowNum>1</FlowNum>
    <FlowTitle>Proposal</FlowTitle>
    <FlowBody>Scope, timeline, and fee on one page.</FlowBody>
    <FlowSubs>
      <FlowSub>Brief</FlowSub>
      <FlowSub>Fee</FlowSub>
      <FlowSubAdd>+</FlowSubAdd>
    </FlowSubs>
  </FlowStep>
  <FlowAdd onClick={addStep}>Add a step</FlowAdd>
</Flow>`,
    usage: {
      use: ["Editable pipelines: numbered steps with sub-items and a ghost add action.", "Builders, automations, onboarding flows."],
      avoid: ["Read-only progress; use Stepper.", "Deep trees; the pipeline is one row."],
    },
    keyboard: [
      { keys: "Tab", does: "Moves to the add-step button" },
      { keys: "Enter, Space", does: "Activates it" },
    ],
    a11y: [
      "FlowAdd is a native <button>; FlowTitle is an <h3>. FlowSubAdd is a <span>: wrap it in a button when it acts. FlowStep is presentational and is not draggable by itself.",
    ],
    aliases: ["Workflow", "Pipeline", "Flow card", "Process steps"],
  },
  {
    name: "assistant",
    title: "Assistant panel",
    description: "Frames an assistant exchange with a user message, reply, suggestion, and input row.",
    category: "patterns",
    classes: ["rs-ai", "rs-ai-head", "rs-ai-title", "rs-ai-status", "rs-ai-msg", "rs-ai-user", "rs-ai-user-block", "rs-ai-reply", "rs-ai-card", "rs-ai-tag", "rs-ai-text", "rs-ai-done", "rs-ai-input", "rs-ai-send", "rs-ai-status-dot"],
    css: ["components/assistant.css"],
    react: "components/assistant.tsx",
    snippet: `<div class="rs-ai"><div class="rs-ai-msg rs-ai-user"><div class="rs-ai-user-block">Make the intro tighter.</div></div><p class="rs-ai-reply">Done. Two sentences, same claim.</p></div>`,
    example: `import { Assistant, AssistantHead, AssistantMsg, AssistantReply, AssistantStatus, AssistantTitle, AssistantUserBlock, MessageComposer } from "@noorddev/vlak-react";

<Assistant>
  <AssistantHead>
    <AssistantTitle>Assistant</AssistantTitle>
    <AssistantStatus>Ready</AssistantStatus>
  </AssistantHead>
  <AssistantMsg user>
    <AssistantUserBlock>Make the intro tighter.</AssistantUserBlock>
  </AssistantMsg>
  <AssistantReply>Done. Two sentences, same claim.</AssistantReply>
  <MessageComposer onSend={sendMessage} />
</Assistant>`,
    usage: {
      use: ["A chat panel with a head, a message thread, and an input row.", "AssistantCard and AssistantTag for a suggestion the reply proposes."],
      avoid: ["Long transcripts without a ScrollArea.", "Notifications; use toast."],
    },
    a11y: [
      "Layout parts only. Give the thread aria-live=\"polite\" if replies stream in, and make the input a real <input> with a name and the send a <button>.",
    ],
    aliases: ["Assistant", "Chat panel", "AI chat", "Conversation", "Copilot panel"],
  },
  {
    name: "theme-toggle",
    title: "Theme toggle",
    description: "Switches between light and dark schemes. The icon changes and the choice persists locally.",
    category: "actions",
    classes: ["rs-theme-toggle", "rs-theme-toggle-inline", "rs-theme-sun", "rs-theme-moon"],
    css: ["components/theme-toggle.css"],
    react: "components/theme-toggle.tsx",
    snippet: `<button class="rs-theme-toggle rs-theme-toggle-inline" aria-label="Toggle color scheme"><svg class="rs-theme-moon" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter"><path d="M10.5 3.5 A5.5 5.5 0 1 0 10.5 12.5 A4 4 0 1 1 10.5 3.5" vector-effect="non-scaling-stroke"/></svg></button>`,
    example: `import { ThemeToggle } from "@noorddev/vlak-react";

<ThemeToggle storageKey="vlak-theme" onThemeChange={(dark) => track(dark)} />`,
    usage: {
      use: ["Letting the reader pick light or dark and remembering it.", "Top-right of the page chrome; rs-theme-toggle-inline for a spot in the flow."],
      avoid: ["Pages that should follow the system only; leave it out and the system preference applies."],
    },
    keyboard: [
      { keys: "Tab", does: "Moves focus to the button" },
      { keys: "Enter, Space", does: "Switches the scheme" },
    ],
    a11y: [
      "A native <button> whose aria-label states the action (\"Switch to dark scheme\" or \"Switch to light scheme\").",
      "Sets an explicit data-theme=\"light\" or data-theme=\"dark\" on <html> and stores the choice under storageKey; read it early in your document to avoid a flash.",
    ],
    aliases: ["Theme toggle", "Dark mode toggle", "Color scheme switch", "Mode toggle"],
  },
  {
    name: "callout",
    title: "Callout",
    description: "Adds a contextual note to running copy. 1px frame, square corners, no accent bar.",
    category: "feedback",
    classes: ["rs-callout"],
    css: ["components/callout.css"],
    react: "components/callout.tsx",
    snippet: `<div class="rs-callout"><p><strong>Fixed fee.</strong> The number on the cover is the number on the invoice.</p></div>`,
    example: `import { Callout } from "@noorddev/vlak-react";

<Callout>
  <p><strong>Fixed fee.</strong> The number on the cover is the number on the invoice.</p>
</Callout>`,
    usage: {
      use: ["A note inside running copy that deserves a frame: a term, a caveat, a definition.", "A bold lead-in and one or two sentences."],
      avoid: ["Status and warnings; use Alert.", "Stacking several in a row."],
    },
    a11y: [
      "A plain <div> in the reading order; add role=\"note\" and an aria-label when it should be announced as an aside.",
    ],
    aliases: ["Callout", "Note", "Aside", "Admonition"],
  },
  {
    name: "references",
    title: "References",
    description: "Connects inline citations to a numbered source list and cite box. Numerals hang in the gutter.",
    category: "content",
    classes: ["rs-cite", "rs-refs", "rs-ref-authors", "rs-ref-doi", "rs-cite-box", "rs-cite-box-label", "rs-cite-box-text", "rs-cite-cite-a", "rs-cite-item"],
    css: ["components/references.css"],
    react: "components/refs.tsx",
    snippet: `<p>Set in a single ink.<sup class="rs-cite"><a href="#ref-1">1</a></sup></p><ol class="rs-refs"><li id="ref-1"><span class="rs-ref-authors">Müller-Brockmann, J.</span> Grid systems in graphic design. <a class="rs-ref-doi" href="#">niggli.ch/grid</a></li></ol>`,
    example: `import { Cite, CiteBox, CiteBoxLabel, CiteBoxText, CiteLink, RefAuthors, RefDoi, RefItem, Refs } from "@noorddev/vlak-react";

<p>Set in a single ink.<Cite><CiteLink href="#ref-1">1</CiteLink></Cite></p>

<Refs>
  <RefItem id="ref-1">
    <RefAuthors>Müller-Brockmann, J.</RefAuthors> Grid systems in graphic design. <RefDoi href="https://niggli.ch/grid">niggli.ch/grid</RefDoi>
  </RefItem>
</Refs>

<CiteBox>
  <CiteBoxLabel>Cite this</CiteBoxLabel>
  <CiteBoxText>Valdés-Olmos, R. (2026). Vlak. Noord.</CiteBoxText>
</CiteBox>`,
    usage: {
      use: ["Articles and papers with numbered citations and a reference list.", "CiteBox for the how-to-cite block at the end."],
      avoid: ["Footnotes with long asides; keep notes short.", "Link lists; use plain Links."],
    },
    keyboard: [
      { keys: "Tab", does: "Moves between citation links" },
      { keys: "Enter", does: "Jumps to the reference" },
    ],
    a11y: [
      "Cite is a <sup> holding a native <a>; give each RefItem the id the link targets. Refs is an <ol>, so the numbering is real.",
    ],
    aliases: ["References", "Citations", "Footnotes", "Bibliography"],
  },
];

/** Public catalog. Hidden entries stay in `vlakComponents` for CSS, Nest, and math. */
export const catalogComponents: VlakComponent[] = vlakComponents.filter((c) => !c.hidden);
