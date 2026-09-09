# Widget

A surface with a subtle 1px outline and 4px corners for React content and provider iframes, with attribution, data states, actions, and supporting context.

Category: ai  
Name: `widget`  
Also known as: AI widget, Tool result card, Connected service widget, Integration widget, Generative UI, WidgetEmbed, Embedded widget, iframe  
Page: https://vlak.dev/ai/widget/

## When to use

- Present application data and third-party results with the same title, provider, content, action, and footer slots.
- Map your integration's result to ready, loading, empty, or error. Supply rendered React content in children for the ready state.
- Use WidgetEmbed in children for a provider iframe. Supply its embed address, a descriptive title, and an explicit height; the default height is 320px.
- WidgetEmbed fills the available width and defaults to lazy loading, no-referrer, and a sandbox allowing scripts and forms. Set sandbox and allow for the provider's application-approved permissions.
- Show the source in provider and an update time or other context in footer.
- Use subtle Button actions and subtle ToggleGroup controls for supporting actions and visible view choices within a widget.
- Use onRetry for an application-owned reload. Update status when data arrives; the widget does not fetch data or infer success.
- CSS-only markup supplies the frame; data transitions and retry handling require React or application code.

## When not to

- Treating this surface as a connector, authentication flow, or tool execution engine.
- Passing untrusted markup or model-selected component names directly into rendered content.
- Assuming the parent stylesheet can style a cross-origin iframe's interior. Provider theming, messaging, and automatic height coordination belong to the application integration.
- Hiding consequential actions inside a widget without the application's normal confirmation step.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Widget, WidgetEmbed } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add widget
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/widget.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<section class="rs-widget" aria-labelledby="widget-title" data-status="ready"><header class="rs-widget-header"><div class="rs-widget-heading"><span class="rs-widget-title" id="widget-title">Recent files</span><div class="rs-widget-provider">Connected drive</div></div></header><div class="rs-widget-content"><p class="rs-widget-message">Project brief · Updated today</p></div><div class="rs-widget-footer">Supplied by the connected application</div></section>
```

## Example

```tsx
import { Button, Widget, WidgetEmbed, type WidgetStatus } from "@noorddev/vlak-react";

export function ConnectedWidgets({ status, onRetry, onOpenFiles, embedUrl }: {
  status: WidgetStatus;
  onRetry: () => void | Promise<void>;
  onOpenFiles: () => void;
  embedUrl: string;
}) {
  return <>
    <Widget title="Recent files" provider="Connected drive" status={status} onRetry={onRetry}
      emptyMessage="No files match this request." errorMessage="The drive could not be reached."
      actions={<Button variant="subtle" onClick={onOpenFiles}>Open files</Button>} footer="Updated just now">
      <p>Project brief · Ready for review</p>
    </Widget>
    <Widget title="Project board" provider="Connected board">
      <WidgetEmbed title="Project board from the connected provider" src={embedUrl} height={360} />
    </Widget>
  </>;
}
```

## Props

### Widget

A shared surface for application and third-party React content, with explicit data states.

Extends `Omit<HTMLAttributes<HTMLElement>, "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` (required) | `ReactNode` |  | Visible name of this widget and its region. |
| `provider` | `ReactNode` |  | Name or linked attribution for the application or integration supplying the content. |
| `icon` | `ReactNode` |  | Optional decorative provider or content mark. |
| `description` | `ReactNode` |  |  |
| `status` | `WidgetStatus` | `"ready"` | Application-supplied data state. The widget never fetches data itself. |
| `statusLabel` | `string` |  |  |
| `emptyMessage` | `string` | `"No results to show."` |  |
| `errorMessage` | `string` | `"This widget could not be loaded."` |  |
| `onRetry` | `() => void \| Promise<void>` |  |  |
| `actions` | `ReactNode` |  | Application-owned controls, rendered after the content. |
| `footer` | `ReactNode` |  | Supporting source, update time, or context below the actions. |
| `children` | `ReactNode` |  |  |

### WidgetEmbed

An explicitly sized provider iframe for a Widget. Permissions and provider messaging remain application-owned.

Extends `IframeHTMLAttributes<HTMLIFrameElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLIFrameElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` (required) | `string` |  | Descriptive name of the embedded interface, announced to assistive technology. |
| `src` (required) | `string` |  | Address supplied by the application or its connected provider. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through provider links, ready content, supplied actions, and the error state's retry button |
| Enter, Space | Activates the focused retry button or supplied native button |
| Tab inside an embed | Follows the provider document's native focus order; its keyboard interactions are supplied by that document |

## Accessibility

- The section is named by its visible title unless an accessible name override is supplied.
- Empty and loading messages use a status region; failures use an alert. Progress remains outside a busy region so it can be announced promptly.
- A rejected retry remains readable and permits another attempt. Pending retries prevent duplicate activation, and changed data states invalidate stale retry results.
- The decorative icon is hidden from assistive technology. Provider content and supplied actions remain in the normal reading and tab order.
- WidgetEmbed requires a title that identifies the embedded document. The provider supplies the document's accessible content and keyboard behavior.
- Native section attributes, className, style, and the section ref are forwarded. WidgetEmbed forwards native iframe attributes, permission overrides, and the iframe ref. The application supplies accessible content and controls for each integration.

## Classes

`rs-widget`, `rs-widget-header`, `rs-widget-icon`, `rs-widget-heading`, `rs-widget-title`, `rs-widget-provider`, `rs-widget-label`, `rs-widget-content`, `rs-widget-description`, `rs-widget-state`, `rs-widget-message`, `rs-widget-actions`, `rs-widget-footer`, `rs-widget-embed`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/widget.tsx`  
CSS: `packages/core/css/components/widget.css`
