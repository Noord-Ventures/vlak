import type { VlakComponent } from "./schema";

export const navigationAdditions: VlakComponent[] = [
  {
    "name": "tree-view",
    "title": "Tree view",
    "description": "Navigates a hierarchy with expansion, single selection, and roving focus.",
    "category": "navigation",
    "classes": [
      "rs-tree-view",
      "rs-tree-view-group",
      "rs-tree-view-item",
      "rs-tree-view-selected",
      "rs-tree-view-disabled",
      "rs-tree-view-spacer",
      "rs-tree-view-disclosure",
      "rs-tree-view-label"
    ],
    "css": [
      "components/tree-view.css"
    ],
    "react": "components/tree-view.tsx",
    "registryDependencies": [
      "icons"
    ],
    "snippet": "<ul class=\"rs-tree-view\" role=\"tree\" aria-label=\"Studies\"><li role=\"none\"><div class=\"rs-tree-view-item rs-tree-view-selected\" role=\"treeitem\" aria-selected=\"true\" aria-level=\"1\" tabindex=\"0\">Drive</div></li></ul>",
    "example": "import { TreeView } from \"@noorddev/vlak-react\";\n\n<TreeView label=\"Studies\" defaultExpanded={[\"studies\"]} defaultValue=\"drive\" nodes={[{ id: \"studies\", label: \"Studies\", children: [{ id: \"drive\", label: \"Drive\" }, { id: \"orbit\", label: \"Orbit\" }] }, { id: \"archive\", label: \"Archive\" }]} />",
    "usage": {
      "use": [
        "File trees, nested assets, and hierarchical selection."
      ],
      "avoid": [
        "A flat list of destination links; use Sidebar."
      ]
    },
    "keyboard": [
      {
        "keys": "Arrows, Home, End, Enter, Space, letters",
        "does": "Arrows navigate and expand/collapse; Enter or Space selects; typing finds a visible label."
      }
    ],
    "a11y": [
      "One tree item is in the Tab sequence. Level, position, selected, expanded, and disabled state are explicit."
    ],
    "aliases": [
      "TreeView"
    ]
  },
  {
    "name": "toolbar",
    "title": "Toolbar",
    "description": "Groups actions behind one Tab stop with arrow-key navigation.",
    "category": "actions",
    "classes": [
      "rs-toolbar",
      "rs-toolbar-vertical",
      "rs-toolbar-pressed"
    ],
    "css": [
      "components/toolbar.css"
    ],
    "react": "components/toolbar.tsx",
    "registryDependencies": [
      "button",
      "icons"
    ],
    "snippet": "<div class=\"rs-toolbar\" role=\"toolbar\" aria-label=\"Editing\"><button class=\"rs-btn-ghost\" tabindex=\"0\">Copy</button><button class=\"rs-btn-ghost\" tabindex=\"-1\">Undo</button></div>",
    "example": "import { Toolbar } from \"@noorddev/vlak-react\";\n\n<Toolbar label=\"Editing\" actions={[{ id: \"copy\", label: \"Copy\", icon: \"copy\", onAction: () => {} }, { id: \"undo\", label: \"Undo\", icon: \"undo\", onAction: () => {} }]} />",
    "usage": {
      "use": [
        "Editor commands and collections of related actions."
      ],
      "avoid": [
        "A simple joined visual group with independent Tab stops; use ButtonGroup."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, arrows, Home, End, Enter, Space",
        "does": "Tab enters once; arrows and Home/End move between enabled actions; Enter/Space activates."
      }
    ],
    "a11y": [
      "Exposes a named toolbar with orientation and pressed state. Disabled actions are skipped during roving navigation."
    ],
    "aliases": [
      "Toolbar"
    ]
  },
  {
    "name": "bottom-navigation",
    "title": "Bottom navigation",
    "description": "Presents mobile destinations with current state and safe-area spacing.",
    "category": "navigation",
    "classes": [
      "rs-bottom-navigation",
      "rs-bottom-navigation-list",
      "rs-bottom-navigation-link",
      "rs-bottom-navigation-current"
    ],
    "css": [
      "components/bottom-navigation.css"
    ],
    "react": "components/bottom-navigation.tsx",
    "registryDependencies": [
      "icons"
    ],
    "snippet": "<nav class=\"rs-bottom-navigation\" aria-label=\"Primary navigation\"><ul class=\"rs-bottom-navigation-list\"><li><a class=\"rs-bottom-navigation-link rs-bottom-navigation-current\" href=\"/\" aria-current=\"page\">Home</a></li><li><a class=\"rs-bottom-navigation-link\" href=\"/docs/\">Docs</a></li></ul></nav>",
    "example": "import { BottomNavigation } from \"@noorddev/vlak-react\";\n\n<BottomNavigation current=\"interfaces\" items={[{ id: \"components\", label: \"Components\", href: \"/components/\", icon: \"grid\" }, { id: \"interfaces\", label: \"Interfaces\", href: \"/interfaces/\", icon: \"layout\" }, { id: \"docs\", label: \"Docs\", href: \"/docs/\", icon: \"file-text\" }]} />",
    "usage": {
      "use": [
        "Three to five primary destinations in a mobile product."
      ],
      "avoid": [
        "Action commands or large collections of destinations."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Enter",
        "does": "Tab moves through native links; Enter follows the destination."
      }
    ],
    "a11y": [
      "A named navigation landmark and aria-current page indicate the active destination. Count badges are readable text."
    ],
    "aliases": [
      "BottomNavigation"
    ]
  },
  {
    "name": "overflow-list",
    "title": "Overflow list",
    "description": "Keeps priority actions visible and moves excess actions into a menu.",
    "category": "actions",
    "classes": [
      "rs-overflow-list",
      "rs-overflow-list-measure",
      "rs-overflow-list-sample",
      "rs-overflow-list-more"
    ],
    "css": [
      "components/overflow-list.css"
    ],
    "react": "components/overflow-list.tsx",
    "registryDependencies": [
      "button",
      "dropdown-menu"
    ],
    "snippet": "<div class=\"rs-overflow-list\" role=\"group\" aria-label=\"Actions\"><button class=\"rs-btn-ghost\">Copy</button><div class=\"rs-overflow-list-more\"><button class=\"rs-btn-ghost\" aria-haspopup=\"menu\">More actions</button></div></div>",
    "example": "import { OverflowList } from \"@noorddev/vlak-react\";\n\n<OverflowList maxVisible={2} items={[{ id: \"copy\", label: \"Copy\", onAction: () => {} }, { id: \"duplicate\", label: \"Duplicate\", onAction: () => {} }, { id: \"archive\", label: \"Archive\", onAction: () => {} }]} />",
    "usage": {
      "use": [
        "Responsive action rows where order also establishes priority."
      ],
      "avoid": [
        "Hiding critical navigation or a form's only submit action."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Enter, Space, arrows, Escape",
        "does": "Native visible buttons activate normally. The overflow uses DropdownMenu keyboard navigation and Escape."
      }
    ],
    "a11y": [
      "Overflow actions remain in a named menu. Hidden measurement text is excluded from accessibility."
    ],
    "aliases": [
      "OverflowList"
    ]
  },
  {
    "name": "filter-bar",
    "title": "Filter bar",
    "description": "Shows active filters with individual removal, reset, and a result count.",
    "category": "patterns",
    "classes": [
      "rs-filter-bar",
      "rs-filter-bar-count"
    ],
    "css": [
      "components/filter-bar.css"
    ],
    "react": "components/filter-bar.tsx",
    "registryDependencies": [
      "button",
      "icons"
    ],
    "snippet": "<div class=\"rs-filter-bar\" role=\"group\" aria-label=\"Active filters\"><button class=\"rs-btn-ghost\" aria-label=\"Remove Alkmaar filter\">Alkmaar ×</button><span class=\"rs-filter-bar-count\" role=\"status\">12 results</span></div>",
    "example": "import { FilterBar } from \"@noorddev/vlak-react\";\n\n<FilterBar defaultValue={[{ id: \"city\", label: \"Alkmaar\" }, { id: \"status\", label: \"Published\" }]} resultCount={12} />",
    "usage": {
      "use": [
        "Search results and data views with multiple active filters."
      ],
      "avoid": [
        "Editing complex logic directly; use QueryBuilder."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Enter, Space",
        "does": "Tab reaches remove/reset actions; Enter or Space applies changes and returns focus to the group."
      }
    ],
    "a11y": [
      "Removal buttons name their filters. Result count is a polite status; children can supply labeled filter editors."
    ],
    "aliases": [
      "FilterBar"
    ]
  },
  {
    "name": "query-builder",
    "title": "Query builder",
    "description": "Builds nested filter conditions from fields, operators, and values.",
    "category": "patterns",
    "classes": [
      "rs-query-builder",
      "rs-query-builder-group",
      "rs-query-builder-legend",
      "rs-query-builder-rule",
      "rs-query-builder-actions",
      "rs-query-builder-summary"
    ],
    "css": [
      "components/query-builder.css"
    ],
    "react": "components/query-builder.tsx",
    "registryDependencies": [
      "button",
      "input",
      "native-select"
    ],
    "snippet": "<div class=\"rs-query-builder\"><fieldset class=\"rs-query-builder-group\"><legend class=\"rs-query-builder-legend\">Filter conditions</legend><p class=\"rs-query-builder-summary\">Name contains \"Drive\"</p></fieldset></div>",
    "example": "import { QueryBuilder } from \"@noorddev/vlak-react\";\n\n<QueryBuilder fields={[{ id: \"name\", label: \"Name\" }, { id: \"range\", label: \"Range\", type: \"number\" }]} defaultValue={{ id: \"root\", combinator: \"and\", rules: [{ id: \"rule\", field: \"name\", operator: \"contains\", value: \"Drive\" }] }} />",
    "usage": {
      "use": [
        "User-defined filters and conditional rule sets."
      ],
      "avoid": [
        "Executing SQL or trusting the summary as a database query."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Enter, Space, native select keys",
        "does": "Native fields handle entry and selection; buttons add or remove rules/groups."
      }
    ],
    "a11y": [
      "Fieldsets name nested groups. Every editor has a label and a human-readable expression summary is available."
    ],
    "aliases": [
      "QueryBuilder"
    ]
  },
  {
    "name": "sortable-list",
    "title": "Sortable list",
    "description": "Reorders items with drag handles, move buttons, and keyboard shortcuts.",
    "category": "content",
    "classes": [
      "rs-sortable-list",
      "rs-sortable-list-item",
      "rs-sortable-list-content",
      "rs-sortable-list-actions",
      "rs-sortable-list-status"
    ],
    "css": [
      "components/sortable-list.css"
    ],
    "react": "components/sortable-list.tsx",
    "registryDependencies": [
      "button",
      "icons"
    ],
    "snippet": "<ol class=\"rs-sortable-list\" aria-label=\"Reorder items\"><li class=\"rs-sortable-list-item\"><div class=\"rs-sortable-list-content\">Research</div><div class=\"rs-sortable-list-actions\"><button class=\"rs-btn-ghost\" aria-label=\"Move Research down\">Move down</button></div></li></ol>",
    "example": "import { SortableList } from \"@noorddev/vlak-react\";\n\n<SortableList defaultValue={[{ id: \"research\", label: \"Research\" }, { id: \"design\", label: \"Design\" }, { id: \"build\", label: \"Build\" }]} />",
    "usage": {
      "use": [
        "Ordering tasks, workflow steps, and priority lists."
      ],
      "avoid": [
        "Cross-column status changes alone; use KanbanBoard."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Enter, Space, Alt+Arrow up/down",
        "does": "Move buttons work with Enter/Space; Alt with Up/Down on a handle changes its position."
      }
    ],
    "a11y": [
      "Each move action names the item; position changes are announced and focus stays with the moved item."
    ],
    "aliases": [
      "SortableList"
    ]
  },
  {
    "name": "virtual-list",
    "title": "Virtual list",
    "description": "Windows large fixed-height collections while preserving focused rows.",
    "category": "content",
    "classes": [
      "rs-virtual-list",
      "rs-virtual-list-canvas",
      "rs-virtual-list-item",
      "rs-virtual-list-empty"
    ],
    "css": [
      "components/virtual-list.css"
    ],
    "react": "components/virtual-list.tsx",
    "registryDependencies": [],
    "snippet": "<div class=\"rs-virtual-list\" role=\"list\" aria-label=\"Records\" style=\"height:264px\"><div class=\"rs-virtual-list-canvas\" role=\"none\" style=\"height:44px\"><div class=\"rs-virtual-list-item\" role=\"listitem\" tabindex=\"0\" aria-posinset=\"1\" aria-setsize=\"1\" style=\"height:44px\">Record 1</div></div></div>",
    "example": "import { VirtualList } from \"@noorddev/vlak-react\";\n\n<VirtualList label=\"Records\" height={264} items={Array.from({ length: 200 }, (_, index) => ({ id: String(index), label: `Record ${index + 1}` }))} />",
    "usage": {
      "use": [
        "Large collections where fixed-height rows are an acceptable constraint."
      ],
      "avoid": [
        "Short lists or variable-height content without a fixed row contract."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Arrow up/down, Home, End",
        "does": "A row enters the Tab sequence; arrows and Home/End scroll and focus rows. Nested controls keep their own keys."
      }
    ],
    "a11y": [
      "List items expose total size and position. Focused rows are retained when outside the visible window."
    ],
    "aliases": [
      "VirtualList"
    ]
  },
  {
    "name": "master-detail",
    "title": "Master detail",
    "description": "Links selection to a detail panel with a mobile back path.",
    "category": "patterns",
    "classes": [
      "rs-master-detail",
      "rs-master-detail-list",
      "rs-master-detail-list-hidden",
      "rs-master-detail-panel",
      "rs-master-detail-panel-hidden",
      "rs-master-detail-title",
      "rs-master-detail-description",
      "rs-master-detail-back",
      "rs-master-detail-button",
      "rs-master-detail-selected"
    ],
    "css": [
      "components/master-detail.css"
    ],
    "react": "components/master-detail.tsx",
    "registryDependencies": [
      "button",
      "icons"
    ],
    "snippet": "<div class=\"rs-master-detail\"><div class=\"rs-master-detail-list\" role=\"group\" aria-label=\"Studies\"><button class=\"rs-master-detail-button rs-master-detail-selected\" aria-pressed=\"true\">Drive</button></div><section class=\"rs-master-detail-panel\" aria-label=\"Drive details\"><h2 class=\"rs-master-detail-title\">Drive</h2><p>Vehicle controls</p></section></div>",
    "example": "import { MasterDetail } from \"@noorddev/vlak-react\";\n\n<MasterDetail label=\"Studies\" items={[{ id: \"drive\", label: \"Drive\", description: \"Vehicle controls\", detail: <p>Range, energy, and media in one shared grid.</p> }, { id: \"orbit\", label: \"Orbit\", description: \"Observation network\", detail: <p>Track assets and their current passes.</p> }]} />",
    "usage": {
      "use": [
        "Inboxes, asset browsers, and list/detail workspaces."
      ],
      "avoid": [
        "Independent panels without a selection relationship; use Split."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Enter, Space",
        "does": "Select an item with its button; focus moves to the detail heading. Mobile Back restores focus to its list item."
      }
    ],
    "a11y": [
      "Native selected buttons and a named detail region. Mobile layout preserves an explicit return path."
    ],
    "aliases": [
      "MasterDetail"
    ]
  },
  {
    "name": "property-grid",
    "title": "Property grid",
    "description": "Aligns editable labels, values, units, and hints in an inspector.",
    "category": "patterns",
    "classes": [
      "rs-property-grid",
      "rs-property-grid-row",
      "rs-property-grid-label",
      "rs-property-grid-control",
      "rs-property-grid-note"
    ],
    "css": [
      "components/property-grid.css"
    ],
    "react": "components/property-grid.tsx",
    "registryDependencies": [
      "input",
      "native-select",
      "switch"
    ],
    "snippet": "<div class=\"rs-property-grid\" role=\"group\" aria-label=\"Properties\"><div class=\"rs-property-grid-row\"><label class=\"rs-property-grid-label\" for=\"property-name\">Name</label><div class=\"rs-property-grid-control\"><input class=\"rs-input\" id=\"property-name\" value=\"Drive\" /></div></div></div>",
    "example": "import { PropertyGrid } from \"@noorddev/vlak-react\";\n\n<PropertyGrid defaultValue={{ name: \"Drive\", range: 386, enabled: true }} fields={[{ id: \"name\", label: \"Name\" }, { id: \"range\", label: \"Range\", type: \"number\", unit: \"km\", min: 0 }, { id: \"enabled\", label: \"Connected\", type: \"switch\" }]} />",
    "usage": {
      "use": [
        "Inspector panels and dense settings with mixed field types."
      ],
      "avoid": [
        "Read-only facts; use DescriptionList."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, native field keys, Space",
        "does": "Native text/number/select fields keep their editing keys; Space toggles a switch."
      }
    ],
    "a11y": [
      "Each row labels its actual control and associates its hint. Native numeric constraints remain available to forms."
    ],
    "aliases": [
      "PropertyGrid"
    ]
  }
];
