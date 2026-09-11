# Vlak iOS components

8 React components with iOS control geometry, Inter typography, and Vlak's paper-and-ink palette. Version 0.4.0.

## Runtime and integration

These components render HTML in React websites and web apps. Installation supplies JavaScript, TypeScript declarations, and CSS. Platform control names describe the UI patterns; use the Vlak exports and props listed in the component records.

The application owns navigation, records, persistence, and connections to device or account services. Each record documents its controlled or uncontrolled state, keyboard behavior, native HTML element, and forwarded ref. CSS-only markup supplies the visual structure; the application owns its event handling and state updates.

## Install

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { IOSSwitch } from "@noorddev/vlak-react";

<IOSSwitch aria-label="Background sync" defaultChecked />
```

Per-component imports use `@noorddev/vlak-react/components/ios-switch`. The individual records also include Vlak CLI and shadcn registry commands.

## Component records

| Component | React exports | Purpose |
| --- | --- | --- |
| [iOS navigation bar](https://vlak.dev/docs/ios-navigation-bar.md) | `IOSNavigationBar` | Compact or large-title navigation with circular actions and an optional vertical rail. |
| [iOS tab bar](https://vlak.dev/docs/ios-tab-bar.md) | `IOSTabBar` | Floating peer tabs with icon labels, roving focus and horizontal or vertical placement. |
| [iOS search field](https://vlak.dev/docs/ios-search-field.md) | `IOSSearchField` | A 48px search capsule with a native input and a separate clear action. |
| [iOS switch](https://vlak.dev/docs/ios-switch.md) | `IOSSwitch` | A native checkbox with a 64px pill track, translating thumb and a 44px hit height. |
| [iOS list](https://vlak.dev/docs/ios-list.md) | `IOSList`, `IOSListRow` | Inset list groups with labels, descriptions, leading symbols and independent trailing controls. |
| [iOS segmented control](https://vlak.dev/docs/ios-segmented-control.md) | `IOSSegmentedControl` | A pill-shaped single choice with a full selected fill, radio semantics and arrow-key selection. |
| [iOS slider](https://vlak.dev/docs/ios-slider.md) | `IOSSlider` | A native range input with a quiet track, pill thumb and synchronized stepped values. |
| [iOS sheet](https://vlak.dev/docs/ios-sheet.md) | `IOSSheet` | A native modal bottom sheet with a centered title, grabber and deliberate entrance. |

## Related interface study

The [iOS interface](https://vlak.dev/interfaces/ios/) is a separate browser study with local apps and device views. It shares platform patterns with this collection and has its own application implementation. The reusable components can be installed independently of that study and its device chrome.

- [Interactive component catalog](https://vlak.dev/components/#ios)
- [Interface source](https://github.com/Noord-Ventures/vlak/tree/main/apps/www/app/interfaces/mobile-os)
- [Platform study reference](https://github.com/Noord-Ventures/vlak/blob/main/apps/www/app/interfaces/mobile-os/ios-reference.md)
- [React component source](https://github.com/Noord-Ventures/vlak/tree/main/packages/react/src/components)

## Agent and data access

MCP `get_guide` with `page: "ios"` returns this index; the same Markdown is available at `vlak://docs/ios`. `list_components` with `category: "ios"` returns the collection. Read the selected component with `get_component` and its install instructions with `get_install` before writing imports. The [props JSON](https://vlak.dev/docs/props.json) and [registry index](https://vlak.dev/r/index.json) expose the same records as structured data.

```sh
npx @noorddev/vlak-cli docs ios
npx @noorddev/vlak-cli search "iOS" --json
npx @noorddev/vlak-cli docs ios-switch
```

[Component index](https://vlak.dev/docs/index.md) · [Agent guide](https://vlak.dev/docs/agents.md) · [Full documentation](https://vlak.dev/llms-full.txt)
