# Tabs

Switches between related panels. Text labels in one row; active tab has a 1px underline.

Category: navigation  
Name: `tabs`  
Also known as: Tabs, Tab list, Tab bar  
Page: https://vlak.dev/components/tabs/

## When to use

- Two to six views of the same object that share one place on the page.
- orientation="vertical" on TabList for a stacked rail.

## When not to

- Navigation between pages; use NavigationMenu with real links.
- Sequential steps; use Stepper.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Tab, TabList, TabPanel, Tabs } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add tabs
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/tabs.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-tabs"><span class="rs-tab rs-tab-active">Overview</span><span class="rs-tab">Activity</span><span class="rs-tab">Settings</span></div>
```

## Example

```tsx
import { Tab, TabList, TabPanel, Tabs } from "@noorddev/vlak-react";

<Tabs defaultValue="overview">
  <TabList aria-label="Project">
    <Tab value="overview">Overview</Tab>
    <Tab value="activity">Activity</Tab>
    <Tab value="settings">Settings</Tab>
  </TabList>
  <TabPanel value="overview">…</TabPanel>
  <TabPanel value="activity">…</TabPanel>
  <TabPanel value="settings">…</TabPanel>
</Tabs>
```

## Props

### Tab

Extends `ButtonHTMLAttributes<HTMLButtonElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLButtonElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` (required) | `string` |  |  |

### TabList

Roving tabs: arrows step, Home/End jump, and selection follows focus.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Stacked tabs answer Up/Down instead of Left/Right. |

### TabPanel

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` (required) | `string` |  |  |

### Tabs

Extends `Omit<HTMLAttributes<HTMLDivElement>, "onChange">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` |  |  |
| `defaultValue` | `string` |  |  |
| `onValueChange` | `(value: string) => void` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves focus to the selected tab, then into the panel |
| Arrow left, Arrow right | Moves to the previous or next tab and selects it (wraps) |
| Arrow up, Arrow down | The same when orientation is vertical |
| Home, End | First or last tab |

## Accessibility

- TabList is role="tablist" (aria-orientation when vertical); pass aria-label to name it.
- Tab is a <button role="tab"> with aria-selected and aria-controls; TabPanel is role="tabpanel" with aria-labelledby, hidden when not selected.
- One roving tab stop: only the selected tab is in the tab order.
- Without a default, the first enabled tab is selected. Removing or disabling the active tab reconciles to the first enabled tab; each target is at least 44px.
- Controlled with value and onValueChange, or uncontrolled with defaultValue.

## Classes

`rs-tabs`, `rs-tabs-vertical`, `rs-tab`, `rs-tab-active`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/tabs.tsx`  
CSS: `packages/core/css/components/tabs.css`
