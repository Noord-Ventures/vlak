import type { VlakComponent } from "./schema";

export const iosComponents: VlakComponent[] = [
  {
    "name": "ios-navigation-bar",
    "title": "iOS navigation bar",
    "description": "Compact or large-title navigation with circular actions and an optional vertical rail.",
    "registryDependencies": [
      "icons"
    ],
    "snippet": "<header class=\"rs-ios-navigation-bar\"><div class=\"rs-ios-navigation-bar-row\"><button class=\"rs-ios-navigation-bar-button rs-ios-navigation-bar-back\" type=\"button\" aria-label=\"Back\">←</button><h2 class=\"rs-ios-navigation-bar-title\">Notes</h2><div class=\"rs-ios-navigation-bar-actions\"><button class=\"rs-ios-navigation-bar-button\" type=\"button\">Done</button></div></div></header>",
    "example": "import { IOSNavigationBar } from \"@noorddev/vlak-react\";\n\n<IOSNavigationBar title=\"Notes\" onBack={() => history.back()} actions={[{ id: \"done\", label: \"Done\", type: \"submit\", form: \"note-editor\" }]} />",
    "usage": {
      "use": [
        "A compact app title, a large root-screen title, or a trailing vertical action rail.",
        "Pass native button properties to actions, including disabled, form and type."
      ],
      "avoid": [
        "Primary destination switching; use the iOS tab bar.",
        "More actions than fit comfortably in the available width."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Shift+Tab",
        "does": "Moves through enabled Back and action buttons."
      },
      {
        "keys": "Enter, Space",
        "does": "Activates a focused action with native button behavior."
      }
    ],
    "a11y": [
      "Back and icon actions have accessible labels. Each target is at least 44px.",
      "Instance-scoped action IDs avoid collisions; buttonId permits explicit references."
    ],
    "aliases": [
      "UIKit navigation bar",
      "UINavigationBar",
      "iOS toolbar",
      "Duo vertical toolbar"
    ],
    "category": "ios",
    "classes": [
      "rs-ios-navigation-bar",
      "rs-ios-navigation-bar-vertical",
      "rs-ios-navigation-bar-row",
      "rs-ios-navigation-bar-leading",
      "rs-ios-navigation-bar-rail",
      "rs-ios-navigation-bar-actions",
      "rs-ios-navigation-bar-actions-vertical",
      "rs-ios-navigation-bar-title",
      "rs-ios-navigation-bar-large-title",
      "rs-ios-navigation-bar-vertical-title",
      "rs-ios-navigation-bar-button",
      "rs-ios-navigation-bar-back",
      "rs-ios-navigation-bar-icon-button",
      "rs-ios-navigation-bar-disabled"
    ],
    "css": [
      "components/ios-navigation-bar.css"
    ],
    "react": "components/ios-navigation-bar.tsx"
  },
  {
    "name": "ios-tab-bar",
    "title": "iOS tab bar",
    "description": "Floating peer tabs with icon labels, roving focus and horizontal or vertical placement.",
    "registryDependencies": [],
    "snippet": "<div class=\"rs-ios-tab-bar\" role=\"tablist\" aria-label=\"Music\"><button class=\"rs-ios-tab-bar-tab rs-ios-tab-bar-active\" role=\"tab\" aria-selected=\"true\" tabindex=\"0\">Library</button><button class=\"rs-ios-tab-bar-tab\" role=\"tab\" aria-selected=\"false\" tabindex=\"-1\">Search</button></div>",
    "example": "import { IOSTabBar } from \"@noorddev/vlak-react\";\n\n<IOSTabBar defaultValue=\"library\" label=\"Music\" items={[{ id: \"library\", label: \"Library\", panelId: \"library-panel\" }, { id: \"search\", label: \"Search\", panelId: \"search-panel\" }]} />",
    "usage": {
      "use": [
        "A small set of peer views in an app, with content managed by the parent.",
        "Provide panelId and optional buttonId to associate tabs with tabpanels."
      ],
      "avoid": [
        "Unrelated commands; use iOS navigation bar actions.",
        "Hiding labels on a vertical rail without recognizable icons."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Shift+Tab",
        "does": "Enters or leaves the tab bar through its selected tab."
      },
      {
        "keys": "Arrows, Home, End",
        "does": "Moves and selects enabled tabs, wrapping at the ends; horizontal arrows respect text direction."
      },
      {
        "keys": "Enter, Space",
        "does": "Selects the focused tab."
      }
    ],
    "a11y": [
      "Exposes tablist, tab and selected state. Disabled tabs are skipped.",
      "Vertical icon tabs retain their labels for assistive technology. IDs are unique per instance."
    ],
    "aliases": [
      "UITabBar",
      "iOS bottom navigation",
      "Duo tab rail"
    ],
    "category": "ios",
    "classes": [
      "rs-ios-tab-bar",
      "rs-ios-tab-bar-vertical",
      "rs-ios-tab-bar-symbol",
      "rs-ios-tab-bar-vertical-label",
      "rs-ios-tab-bar-tab",
      "rs-ios-tab-bar-active",
      "rs-ios-tab-bar-tab-vertical",
      "rs-ios-tab-bar-disabled"
    ],
    "css": [
      "components/ios-tab-bar.css"
    ],
    "react": "components/ios-tab-bar.tsx"
  },
  {
    "name": "ios-search-field",
    "title": "iOS search field",
    "description": "A 48px search capsule with a native input and a separate clear action.",
    "registryDependencies": [
      "icons"
    ],
    "snippet": "<div class=\"rs-ios-search-field\"><input class=\"rs-ios-search-field-input\" type=\"search\" aria-label=\"Search notes\" placeholder=\"Search\" /></div>",
    "example": "import { IOSSearchField } from \"@noorddev/vlak-react\";\n\n<IOSSearchField name=\"q\" aria-label=\"Search notes\" placeholder=\"Search\" onValueChange={query => console.log(query)} />",
    "usage": {
      "use": [
        "Search within a list, app or document.",
        "Use onValueChange to respond to both typing and the clear button."
      ],
      "avoid": [
        "Treating a placeholder as the only accessible label.",
        "A noneditable search launcher; use a button."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Shift+Tab",
        "does": "Moves between the native search input and the clear button when text is present."
      },
      {
        "keys": "Enter, Space on Clear",
        "does": "Clears the text and returns focus to the input."
      },
      {
        "keys": "Enter in the input",
        "does": "Uses the enclosing form’s native submit behavior."
      }
    ],
    "a11y": [
      "A native search input accepts labels, form attributes, required, disabled and readOnly.",
      "Clearing is a 44px action; native form reset is supported and canceled reset is respected."
    ],
    "aliases": [
      "UISearchBar",
      "UISearchTextField",
      "iOS search input"
    ],
    "category": "ios",
    "classes": [
      "rs-ios-search-field",
      "rs-ios-search-field-disabled",
      "rs-ios-search-field-symbol",
      "rs-ios-search-field-input",
      "rs-ios-search-field-clear"
    ],
    "css": [
      "components/ios-search-field.css"
    ],
    "react": "components/ios-search-field.tsx"
  },
  {
    "name": "ios-switch",
    "title": "iOS switch",
    "description": "A native checkbox with a 64px pill track, translating thumb and a 44px hit height.",
    "registryDependencies": [],
    "snippet": "<span class=\"rs-ios-switch\"><span class=\"rs-ios-switch-track\" aria-hidden=\"true\"></span><span class=\"rs-ios-switch-thumb\" aria-hidden=\"true\"></span><input class=\"rs-ios-switch-input\" type=\"checkbox\" role=\"switch\" aria-label=\"Wi-Fi\" /></span>",
    "example": "import { IOSSwitch } from \"@noorddev/vlak-react\";\n\n<IOSSwitch name=\"wifi\" aria-label=\"Wi-Fi\" defaultChecked onCheckedChange={checked => console.log(checked)} />",
    "usage": {
      "use": [
        "An immediately applied on/off preference.",
        "Associate it with a visible label or an aria-label."
      ],
      "avoid": [
        "A choice among several alternatives; use the iOS segmented control.",
        "A submit command that needs a button."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Shift+Tab",
        "does": "Moves focus to or away from an enabled switch."
      },
      {
        "keys": "Space",
        "does": "Toggles the native checkbox."
      }
    ],
    "a11y": [
      "A native checkbox with switch semantics retains form submission, required and disabled behavior.",
      "Fill and thumb position both communicate state. Reduced motion removes thumb travel; forced colors keeps the boundary visible."
    ],
    "aliases": [
      "UISwitch",
      "iOS toggle"
    ],
    "category": "ios",
    "classes": [
      "rs-ios-switch",
      "rs-ios-switch-disabled",
      "rs-ios-switch-track",
      "rs-ios-switch-on",
      "rs-ios-switch-thumb",
      "rs-ios-switch-thumb-on",
      "rs-ios-switch-input"
    ],
    "css": [
      "components/ios-switch.css"
    ],
    "react": "components/ios-switch.tsx"
  },
  {
    "name": "ios-list",
    "title": "iOS list",
    "description": "Inset list groups with labels, descriptions, leading symbols and independent trailing controls.",
    "registryDependencies": [
      "icons"
    ],
    "snippet": "<section class=\"rs-ios-list\" aria-labelledby=\"settings-heading\"><h3 class=\"rs-ios-list-title\" id=\"settings-heading\">Settings</h3><div class=\"rs-ios-list-group\"><button class=\"rs-ios-list-row rs-ios-list-row-action\" type=\"button\"><span class=\"rs-ios-list-row-copy\">General</span></button></div></section>",
    "example": "import { IOSList, IOSListRow, IOSSwitch } from \"@noorddev/vlak-react\";\n\n<IOSList title=\"Connections\"><IOSListRow label={<label htmlFor=\"wifi\">Wi-Fi</label>} trailing={<IOSSwitch id=\"wifi\" defaultChecked />} /><IOSListRow label=\"Network details\" disclosure onClick={() => console.log(\"Open network\")} /></IOSList>",
    "usage": {
      "use": [
        "Grouped settings, preferences and navigation rows.",
        "Omit onClick for rows containing an interactive trailing input."
      ],
      "avoid": [
        "Nesting a switch or another interactive element inside an action row.",
        "Using a clickable row for plain informational content."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Shift+Tab",
        "does": "Moves through action rows and the controls inside static rows."
      },
      {
        "keys": "Enter, Space",
        "does": "Activates a focused action row as a native button."
      }
    ],
    "a11y": [
      "Group headings label their sections. Static rows are not unnecessary focus stops.",
      "Action rows use native buttons with disabled behavior and at least a 52px height."
    ],
    "aliases": [
      "UITableView grouped",
      "iOS settings list",
      "Inset grouped list"
    ],
    "category": "ios",
    "classes": [
      "rs-ios-list",
      "rs-ios-list-title",
      "rs-ios-list-group",
      "rs-ios-list-footer",
      "rs-ios-list-row",
      "rs-ios-list-row-action",
      "rs-ios-list-row-disabled",
      "rs-ios-list-row-leading",
      "rs-ios-list-row-copy",
      "rs-ios-list-row-description",
      "rs-ios-list-row-trailing"
    ],
    "css": [
      "components/ios-list.css"
    ],
    "react": "components/ios-list.tsx"
  },
  {
    "name": "ios-segmented-control",
    "title": "iOS segmented control",
    "description": "A pill-shaped single choice with a full selected fill, radio semantics and arrow-key selection.",
    "registryDependencies": [],
    "snippet": "<div class=\"rs-ios-segmented-control\" role=\"radiogroup\" aria-label=\"Calendar view\"><button class=\"rs-ios-segmented-control-item rs-ios-segmented-control-selected\" role=\"radio\" aria-checked=\"true\" tabindex=\"0\">Day</button><button class=\"rs-ios-segmented-control-item\" role=\"radio\" aria-checked=\"false\" tabindex=\"-1\">Month</button></div>",
    "example": "import { IOSSegmentedControl } from \"@noorddev/vlak-react\";\n\n<IOSSegmentedControl name=\"view\" label=\"Calendar view\" defaultValue=\"day\" items={[{ id: \"day\", label: \"Day\" }, { id: \"week\", label: \"Week\" }, { id: \"month\", label: \"Month\" }]} />",
    "usage": {
      "use": [
        "A small set of mutually exclusive modes or filters.",
        "Use name to include the selected value in form data."
      ],
      "avoid": [
        "Navigation among independent application destinations; use the iOS tab bar.",
        "Many options that require a long horizontal scroll."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Shift+Tab",
        "does": "Enters or leaves the group through its selected option."
      },
      {
        "keys": "Arrows, Home, End",
        "does": "Moves and selects enabled options; horizontal arrows respect text direction."
      },
      {
        "keys": "Enter, Space",
        "does": "Selects the focused option."
      }
    ],
    "a11y": [
      "Named radiogroup with one tab stop, explicit checked state and disabled options.",
      "Native form reset is supported; reduced motion and forced colors retain readable selection."
    ],
    "aliases": [
      "UISegmentedControl",
      "iOS segmented picker"
    ],
    "category": "ios",
    "classes": [
      "rs-ios-segmented-control",
      "rs-ios-segmented-control-item",
      "rs-ios-segmented-control-selected",
      "rs-ios-segmented-control-disabled"
    ],
    "css": [
      "components/ios-segmented-control.css"
    ],
    "react": "components/ios-segmented-control.tsx"
  },
  {
    "name": "ios-slider",
    "title": "iOS slider",
    "description": "A native range input with a quiet track, pill thumb and synchronized stepped values.",
    "registryDependencies": [],
    "snippet": "<div class=\"rs-ios-slider\"><span class=\"rs-ios-slider-track\" aria-hidden=\"true\"><span class=\"rs-ios-slider-fill\" style=\"width:50%\"></span><span class=\"rs-ios-slider-thumb\" style=\"inset-inline-start:50%\"></span></span><input class=\"rs-ios-slider-input\" type=\"range\" min=\"0\" max=\"100\" value=\"50\" aria-label=\"Volume\" /></div>",
    "example": "import { IOSSlider } from \"@noorddev/vlak-react\";\n\n<IOSSlider name=\"volume\" aria-label=\"Volume\" min={0} max={100} defaultValue={40} onValueChange={value => console.log(value)} />",
    "usage": {
      "use": [
        "A bounded numeric level such as volume, brightness or playback intensity.",
        "Provide min, max and step when the range is discrete."
      ],
      "avoid": [
        "Values that need precise text entry without an accompanying numeric field.",
        "Multiple independent values; use separate labeled sliders."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Shift+Tab",
        "does": "Moves focus to or away from the native range input."
      },
      {
        "keys": "Arrows, Home, End",
        "does": "Uses the browser’s native range stepping and boundary behavior."
      }
    ],
    "a11y": [
      "The ref reaches the native range input, with min, max, step, name and disabled attributes.",
      "Value and fill are normalized to the same valid step. The invisible native input keeps a 44px target."
    ],
    "aliases": [
      "UISlider",
      "iOS volume slider"
    ],
    "category": "ios",
    "classes": [
      "rs-ios-slider",
      "rs-ios-slider-disabled",
      "rs-ios-slider-track",
      "rs-ios-slider-fill",
      "rs-ios-slider-thumb",
      "rs-ios-slider-input"
    ],
    "css": [
      "components/ios-slider.css"
    ],
    "react": "components/ios-slider.tsx"
  },
  {
    "name": "ios-sheet",
    "title": "iOS sheet",
    "description": "A native modal bottom sheet with a centered title, grabber and deliberate entrance.",
    "registryDependencies": [
      "icons"
    ],
    "snippet": "<dialog class=\"rs-ios-sheet\" aria-labelledby=\"sheet-title\"><div class=\"rs-ios-sheet-handle\" aria-hidden=\"true\"></div><header class=\"rs-ios-sheet-header\"><span></span><h2 class=\"rs-ios-sheet-title\" id=\"sheet-title\">Edit note</h2><button class=\"rs-ios-sheet-close\" type=\"button\" aria-label=\"Close sheet\">×</button></header><div class=\"rs-ios-sheet-body\">Note content</div></dialog>",
    "example": "import { IOSSheet } from \"@noorddev/vlak-react\";\n\n<IOSSheet title=\"Edit note\" open={open} onOpenChange={setOpen} description=\"Changes stay on this device.\"><form id=\"note-editor\">…</form></IOSSheet>",
    "usage": {
      "use": [
        "A focused modal task presented from the bottom edge.",
        "Keep the sheet mounted to preserve form drafts while closed."
      ],
      "avoid": [
        "Claiming the grabber is draggable; it is a visual indicator.",
        "Using a modal for ordinary page navigation or passive status."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Shift+Tab",
        "does": "Uses the native modal focus trap."
      },
      {
        "keys": "Escape",
        "does": "Requests closing unless dismissable is false or onCancel prevents it."
      },
      {
        "keys": "Enter, Space on Close",
        "does": "Closes a dismissable sheet and restores its trigger when still available."
      }
    ],
    "a11y": [
      "The native dialog is named by its title and optionally described by its description.",
      "Focus restores on close and unmount; reduced motion removes the entrance animation. Nondismissable sheets omit the close control."
    ],
    "aliases": [
      "UISheetPresentationController",
      "iOS bottom sheet",
      "iOS modal sheet"
    ],
    "category": "ios",
    "classes": [
      "rs-ios-sheet",
      "rs-ios-sheet-open",
      "rs-ios-sheet-handle",
      "rs-ios-sheet-header",
      "rs-ios-sheet-title",
      "rs-ios-sheet-close",
      "rs-ios-sheet-body",
      "rs-ios-sheet-description"
    ],
    "css": [
      "components/ios-sheet.css"
    ],
    "react": "components/ios-sheet.tsx"
  }
];
