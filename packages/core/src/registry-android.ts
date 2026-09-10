import type { VlakComponent } from "./schema.ts";

/** Material anatomy with Vlak paint; reusable independently of the Android interface. */
export const androidComponents: VlakComponent[] = [
  {
    "name": "android-app-bar",
    "title": "Android app bar",
    "description": "A Material app bar with a title, navigation action and trailing actions in Vlak tones.",
    "category": "android",
    "classes": [
      "rs-android-app-bar",
      "rs-android-app-bar-medium",
      "rs-android-app-bar-navigation",
      "rs-android-app-bar-title",
      "rs-android-app-bar-leading-title",
      "rs-android-app-bar-medium-title",
      "rs-android-app-bar-actions",
      "rs-android-app-bar-action"
    ],
    "css": [
      "components/android-app-bar.css"
    ],
    "react": "components/android-app-bar.tsx",
    "registryDependencies": [
      "icons"
    ],
    "snippet": "<header class=\"rs-android-app-bar\"><div class=\"rs-android-app-bar-navigation\"><button class=\"rs-android-app-bar-action\" type=\"button\" aria-label=\"Go back\">←</button></div><h2 class=\"rs-android-app-bar-title\">Documents</h2><div class=\"rs-android-app-bar-actions\"><button class=\"rs-android-app-bar-action\" type=\"button\" aria-label=\"More actions\">⋯</button></div></header>",
    "example": "import { AndroidAppBar, AndroidAppBarAction, Icon } from \"@noorddev/vlak-react\";\n\n<AndroidAppBar title=\"Documents\" navigation={<AndroidAppBarAction aria-label=\"Go back\" onClick={goBack}><Icon name=\"arrow-left\" /></AndroidAppBarAction>} />",
    "usage": {
      "use": [
        "Top-level Android screens with a title and a small set of actions.",
        "A medium app bar when the screen needs a larger title."
      ],
      "avoid": [
        "Page navigation with more destinations than fit in an app bar."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Moves between enabled actions."
      },
      {
        "keys": "Enter or Space",
        "does": "Activates the focused action."
      }
    ],
    "a11y": [
      "Uses a native header and a level-two heading.",
      "Label icon-only actions with aria-label.",
      "Action buttons keep a 48-pixel target and a visible keyboard focus indicator."
    ],
    "aliases": [
      "Material top app bar",
      "Android toolbar",
      "center-aligned top app bar"
    ]
  },
  {
    "name": "android-navigation",
    "title": "Android navigation",
    "description": "Material destination indicators for a bottom navigation bar or vertical rail.",
    "category": "android",
    "classes": [
      "rs-android-navigation",
      "rs-android-navigation-list",
      "rs-android-navigation-rail",
      "rs-android-navigation-item",
      "rs-android-navigation-control",
      "rs-android-navigation-current",
      "rs-android-navigation-disabled",
      "rs-android-navigation-indicator",
      "rs-android-navigation-active-indicator",
      "rs-android-navigation-label"
    ],
    "css": [
      "components/android-navigation.css"
    ],
    "react": "components/android-navigation.tsx",
    "registryDependencies": [],
    "snippet": "<nav class=\"rs-android-navigation\" aria-label=\"Workspace\"><ul class=\"rs-android-navigation-list\"><li class=\"rs-android-navigation-item\"><button class=\"rs-android-navigation-control rs-android-navigation-current\" type=\"button\" aria-current=\"page\"><span class=\"rs-android-navigation-indicator rs-android-navigation-active-indicator\" aria-hidden=\"true\">⌂</span><span class=\"rs-android-navigation-label\">Home</span></button></li><li class=\"rs-android-navigation-item\"><button class=\"rs-android-navigation-control\" type=\"button\"><span class=\"rs-android-navigation-indicator\" aria-hidden=\"true\">□</span><span class=\"rs-android-navigation-label\">Files</span></button></li></ul></nav>",
    "example": "import { AndroidNavigation } from \"@noorddev/vlak-react\";\n\n<AndroidNavigation aria-label=\"Workspace\" items={[{ value: \"home\", label: \"Home\" }, { value: \"files\", label: \"Files\" }, { value: \"settings\", label: \"Settings\" }]} defaultValue=\"home\" onValueChange={setScreen} />",
    "usage": {
      "use": [
        "Three to five destinations at the bottom of a compact Android layout.",
        "A vertical destination rail beside a wider workspace."
      ],
      "avoid": [
        "Tabs that switch between panels within the same page."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Moves between enabled destinations."
      },
      {
        "keys": "Left or Right arrow",
        "does": "Moves focus in a horizontal bar, respecting text direction."
      },
      {
        "keys": "Up or Down arrow",
        "does": "Moves focus in a vertical rail."
      },
      {
        "keys": "Home or End",
        "does": "Focuses the first or last enabled destination."
      },
      {
        "keys": "Enter or Space",
        "does": "Activates a button destination; native links use Enter."
      }
    ],
    "a11y": [
      "A labelled nav contains native buttons or links in a list.",
      "aria-current marks the active destination; arrow keys only move focus.",
      "Disabled destinations cannot activate and are skipped by arrow keys."
    ],
    "aliases": [
      "Material navigation bar",
      "Android navigation rail",
      "bottom navigation"
    ]
  },
  {
    "name": "android-search-bar",
    "title": "Android search bar",
    "description": "A rounded Material search field with a leading icon and a clear action.",
    "category": "android",
    "classes": [
      "rs-android-search-bar",
      "rs-android-search-bar-disabled",
      "rs-android-search-input",
      "rs-android-search-icon",
      "rs-android-search-clear"
    ],
    "css": [
      "components/android-search-bar.css"
    ],
    "react": "components/android-search-bar.tsx",
    "registryDependencies": [
      "icons"
    ],
    "snippet": "<div class=\"rs-android-search-bar\"><span class=\"rs-android-search-icon\" aria-hidden=\"true\">⌕</span><input class=\"rs-android-search-input\" type=\"search\" aria-label=\"Search documents\" placeholder=\"Search documents\" /></div>",
    "example": "import { AndroidSearchBar } from \"@noorddev/vlak-react\";\n\n<AndroidSearchBar aria-label=\"Search documents\" placeholder=\"Search documents\" value={query} onValueChange={setQuery} />",
    "usage": {
      "use": [
        "Searching a collection within an Android screen.",
        "A 56-pixel search surface with a clear action."
      ],
      "avoid": [
        "Selecting an option from autocomplete suggestions; use a combobox for that behavior."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Focuses the search field and its clear action when present."
      },
      {
        "keys": "Escape",
        "does": "Clears an editable query and keeps focus in the field."
      },
      {
        "keys": "Enter",
        "does": "Uses the enclosing form's native submit behavior."
      }
    ],
    "a11y": [
      "Uses input type search with native input attributes and ref.",
      "Provide a visible label or aria-label; a placeholder is not a label.",
      "The clear action follows the input onChange path, also calls onValueChange and returns focus to the field.",
      "Uncontrolled values follow native form reset."
    ],
    "aliases": [
      "Material search bar",
      "Android search field",
      "search input"
    ]
  },
  {
    "name": "android-switch",
    "title": "Android switch",
    "description": "A Material switch with a 52-by-32 track and an expanding thumb, built on a native checkbox.",
    "category": "android",
    "classes": [
      "rs-android-switch",
      "rs-android-switch-checked"
    ],
    "css": [
      "components/android-switch.css"
    ],
    "react": "components/android-switch.tsx",
    "registryDependencies": [],
    "snippet": "<label for=\"android-sync\">Background sync</label> <input class=\"rs-android-switch rs-android-switch-checked\" id=\"android-sync\" name=\"sync\" type=\"checkbox\" role=\"switch\" checked aria-checked=\"true\" />",
    "example": "import { AndroidSwitch } from \"@noorddev/vlak-react\";\n\n<label htmlFor=\"sync\">Background sync</label>\n<AndroidSwitch id=\"sync\" name=\"sync\" checked={enabled} onCheckedChange={setEnabled} />",
    "usage": {
      "use": [
        "A binary Android preference that takes effect immediately."
      ],
      "avoid": [
        "Selecting one option from a mutually exclusive group."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Focuses the switch when enabled."
      },
      {
        "keys": "Space",
        "does": "Toggles the switch."
      }
    ],
    "a11y": [
      "Uses a native checkbox with role switch and a 52-by-48 target.",
      "Associate a visible label using htmlFor, or provide aria-label.",
      "Supports native names, values, required state, disabled state and form reset.",
      "The thumb changes position and size in addition to the filled track."
    ],
    "aliases": [
      "Material switch",
      "Android toggle",
      "Expressive switch"
    ]
  },
  {
    "name": "android-list",
    "title": "Android list",
    "description": "Segmented Material list rows with leading content, supporting text and independent trailing controls.",
    "category": "android",
    "classes": [
      "rs-android-list",
      "rs-android-list-row",
      "rs-android-list-body",
      "rs-android-list-action",
      "rs-android-list-two-line",
      "rs-android-list-three-line",
      "rs-android-list-leading",
      "rs-android-list-copy",
      "rs-android-list-headline",
      "rs-android-list-secondary",
      "rs-android-list-trailing"
    ],
    "css": [
      "components/android-list.css"
    ],
    "react": "components/android-list.tsx",
    "registryDependencies": ["android-switch"],
    "snippet": "<ul class=\"rs-android-list\" aria-label=\"Connections\"><li class=\"rs-android-list-row\"><button class=\"rs-android-list-body rs-android-list-action rs-android-list-two-line\" type=\"button\"><span class=\"rs-android-list-copy\"><span class=\"rs-android-list-headline\">Wi-Fi</span><span class=\"rs-android-list-secondary\">Studio network</span></span></button><span class=\"rs-android-list-trailing\">Connected</span></li><li class=\"rs-android-list-row\"><div class=\"rs-android-list-body\"><span class=\"rs-android-list-copy\"><span class=\"rs-android-list-headline\">Device name</span></span></div><span class=\"rs-android-list-trailing\">Pixel</span></li></ul>",
    "example": "import { AndroidList, AndroidListRow, AndroidSwitch } from \"@noorddev/vlak-react\";\n\n<AndroidList aria-label=\"Connections\">\n  <AndroidListRow headline=\"Wi-Fi\" supportingText=\"Studio network\" onAction={openNetworks} trailing={<AndroidSwitch aria-label=\"Wi-Fi enabled\" defaultChecked />} />\n  <AndroidListRow headline=\"Device name\" supportingText=\"Pixel\" />\n</AndroidList>",
    "usage": {
      "use": [
        "Grouped Android settings and one-, two- or three-line content rows.",
        "A row action beside an independent trailing switch."
      ],
      "avoid": [
        "Tabular data where users compare aligned columns."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Moves between row actions and independent trailing controls."
      },
      {
        "keys": "Enter or Space",
        "does": "Activates a focused row button."
      }
    ],
    "a11y": [
      "Native ul and li preserve list structure.",
      "Only rows with onAction become buttons; static rows add no tab stop.",
      "Trailing controls are siblings of the row button, so interactive elements are never nested.",
      "Decorative leading content is hidden from assistive technology."
    ],
    "aliases": [
      "Material list item",
      "Android settings row",
      "Expressive segmented list"
    ]
  },
  {
    "name": "android-chip",
    "title": "Android chip",
    "description": "A Material filter chip with a filled selection state and a checkmark.",
    "category": "android",
    "classes": [
      "rs-android-chip",
      "rs-android-chip-selected",
      "rs-android-chip-icon"
    ],
    "css": [
      "components/android-chip.css"
    ],
    "react": "components/android-chip.tsx",
    "registryDependencies": [
      "icons"
    ],
    "snippet": "<button class=\"rs-android-chip rs-android-chip-selected\" type=\"button\" aria-pressed=\"true\"><span class=\"rs-android-chip-icon\" aria-hidden=\"true\">✓</span>Unread</button>",
    "example": "import { AndroidChip } from \"@noorddev/vlak-react\";\n\n<AndroidChip selected={unread} onSelectedChange={setUnread}>Unread</AndroidChip>",
    "usage": {
      "use": [
        "Independent filters that users can select and clear."
      ],
      "avoid": [
        "Mutually exclusive navigation or status labels with no action."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Focuses each enabled filter."
      },
      {
        "keys": "Enter or Space",
        "does": "Toggles the focused filter."
      }
    ],
    "a11y": [
      "A native button exposes selection through aria-pressed.",
      "The checkmark and filled surface distinguish selection without hue.",
      "The compact chip keeps a 48-pixel hit area."
    ],
    "aliases": [
      "Material filter chip",
      "Android filter chip",
      "selectable chip"
    ]
  },
  {
    "name": "android-fab",
    "title": "Android floating action button",
    "description": "A Material floating action button with an optional extended text label.",
    "category": "android",
    "classes": [
      "rs-android-fab",
      "rs-android-fab-extended",
      "rs-android-fab-icon"
    ],
    "css": [
      "components/android-fab.css"
    ],
    "react": "components/android-fab.tsx",
    "registryDependencies": ["icons"],
    "snippet": "<button class=\"rs-android-fab rs-android-fab-extended\" type=\"button\"><span class=\"rs-android-fab-icon\" aria-hidden=\"true\">+</span>New document</button>",
    "example": "import { AndroidFab, Icon } from \"@noorddev/vlak-react\";\n\n<AndroidFab icon={<Icon name=\"plus\" size={24} />} onClick={createDocument}>New document</AndroidFab>",
    "usage": {
      "use": [
        "The principal creation action on an Android screen."
      ],
      "avoid": [
        "Several equally prominent actions on one screen."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Focuses the enabled action."
      },
      {
        "keys": "Enter or Space",
        "does": "Activates the action."
      }
    ],
    "a11y": [
      "Uses a native button with a target of at least 56 pixels.",
      "Provide aria-label when omitting the visible text label.",
      "Does not submit a form unless type submit is explicit."
    ],
    "aliases": [
      "Material FAB",
      "Android extended FAB",
      "floating action button"
    ]
  },
  {
    "name": "android-sheet",
    "title": "Android bottom sheet",
    "description": "A native modal bottom sheet with Material geometry, accessible naming and focus restoration.",
    "category": "android",
    "classes": [
      "rs-android-sheet",
      "rs-android-sheet-open",
      "rs-android-sheet-handle",
      "rs-android-sheet-close",
      "rs-android-sheet-title",
      "rs-android-sheet-body"
    ],
    "css": [
      "components/android-sheet.css"
    ],
    "react": "components/android-sheet.tsx",
    "registryDependencies": [
      "dialog",
      "icons"
    ],
    "snippet": "<dialog class=\"rs-android-sheet\" aria-labelledby=\"android-sheet-title\"><span class=\"rs-android-sheet-handle\" aria-hidden=\"true\"></span><button class=\"rs-android-sheet-close\" type=\"button\" aria-label=\"Close\">×</button><h2 class=\"rs-android-sheet-title\" id=\"android-sheet-title\">Connection settings</h2><p class=\"rs-android-sheet-body\">Choose how this device connects.</p></dialog>",
    "example": "import { AndroidSheet, AndroidSheetTitle, AndroidSheetBody } from \"@noorddev/vlak-react\";\n\n<AndroidSheet open={open} onOpenChange={setOpen}>\n  <AndroidSheetTitle>Connection settings</AndroidSheetTitle>\n  <AndroidSheetBody>Choose how this device connects.</AndroidSheetBody>\n</AndroidSheet>",
    "usage": {
      "use": [
        "Contextual Android controls that temporarily cover the lower screen.",
        "A focused choice or short task with a clear way to dismiss it."
      ],
      "avoid": [
        "Permanent side navigation or long documents."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab or Shift+Tab",
        "does": "Moves through the modal's controls using native dialog focus containment."
      },
      {
        "keys": "Escape",
        "does": "Requests dismissal when dismissable is enabled."
      },
      {
        "keys": "Enter or Space",
        "does": "Activates the focused control."
      }
    ],
    "a11y": [
      "Native dialog showModal supplies the top layer, inert background and focus containment.",
      "Title and body parts connect aria-labelledby and aria-describedby automatically.",
      "Closing returns focus to the connected opener.",
      "The handle is decorative; this sheet does not promise a drag gesture.",
      "Supports controlled open state or defaultOpen; onOpenChange reports dismissal."
    ],
    "aliases": [
      "Material modal bottom sheet",
      "Android bottom sheet",
      "modal sheet"
    ]
  }
];
