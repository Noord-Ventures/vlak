# Vlak Android components

8 React components with Material control geometry, Inter typography, and Vlak's paper-and-ink palette. Version 0.5.0.

## Runtime and integration

These components render HTML in React websites and web apps. Installation supplies JavaScript, TypeScript declarations, and CSS. Platform control names describe the UI patterns; use the Vlak exports and props listed in the component records.

The application owns navigation, records, persistence, and connections to device or account services. Each record documents its controlled or uncontrolled state, keyboard behavior, native HTML element, and forwarded ref. CSS-only markup supplies the visual structure; the application owns its event handling and state updates.

## Install

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { AndroidSwitch } from "@noorddev/vlak-react";

<AndroidSwitch aria-label="Background sync" defaultChecked />
```

Per-component imports use `@noorddev/vlak-react/components/android-switch`. The individual records also include Vlak CLI and shadcn registry commands.

## Component records

| Component | React exports | Purpose |
| --- | --- | --- |
| [Android app bar](https://vlak.dev/docs/android-app-bar.md) | `AndroidAppBar`, `AndroidAppBarAction` | A Material app bar with a title, navigation action and trailing actions in Vlak tones. |
| [Android navigation](https://vlak.dev/docs/android-navigation.md) | `AndroidNavigation` | Material destination indicators for a bottom navigation bar or vertical rail. |
| [Android search bar](https://vlak.dev/docs/android-search-bar.md) | `AndroidSearchBar` | A rounded Material search field with a leading icon and a clear action. |
| [Android switch](https://vlak.dev/docs/android-switch.md) | `AndroidSwitch` | A Material switch with a 52-by-32 track and an expanding thumb, built on a native checkbox. |
| [Android list](https://vlak.dev/docs/android-list.md) | `AndroidList`, `AndroidListRow` | Segmented Material list rows with leading content, supporting text and independent trailing controls. |
| [Android chip](https://vlak.dev/docs/android-chip.md) | `AndroidChip` | A Material filter chip with a filled selection state and a checkmark. |
| [Android floating action button](https://vlak.dev/docs/android-fab.md) | `AndroidFab` | A Material floating action button with an optional extended text label. |
| [Android bottom sheet](https://vlak.dev/docs/android-sheet.md) | `AndroidSheet`, `AndroidSheetBody`, `AndroidSheetTitle` | A native modal bottom sheet with Material geometry, accessible naming and focus restoration. |

## Related interface study

The [Android interface](https://vlak.dev/interfaces/android/) is a separate browser study with local apps and device views. It shares platform patterns with this collection and has its own application implementation. The reusable components can be installed independently of that study and its device chrome.

- [Interactive component catalog](https://vlak.dev/components/#android)
- [Interface source](https://github.com/Noord-Ventures/vlak/tree/main/apps/www/app/interfaces/mobile-os)
- [Platform study reference](https://github.com/Noord-Ventures/vlak/blob/main/apps/www/app/interfaces/mobile-os/android-reference.md)
- [React component source](https://github.com/Noord-Ventures/vlak/tree/main/packages/react/src/components)

## Agent and data access

MCP `get_guide` with `page: "android"` returns this index; the same Markdown is available at `vlak://docs/android`. `list_components` with `category: "android"` returns the collection. Read the selected component with `get_component` and its install instructions with `get_install` before writing imports. The [props JSON](https://vlak.dev/docs/props.json) and [registry index](https://vlak.dev/r/index.json) expose the same records as structured data.

```sh
npx @noorddev/vlak-cli docs android
npx @noorddev/vlak-cli search "Android" --json
npx @noorddev/vlak-cli docs android-switch
```

[Component index](https://vlak.dev/docs/index.md) · [Agent guide](https://vlak.dev/docs/agents.md) · [Full documentation](https://vlak.dev/llms-full.txt)
