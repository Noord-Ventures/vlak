export type UpdateEntry = {
  id: string;
  title: string;
  publishedAt: string;
  kind: "Package release" | "Site and source";
  summary: string;
  changes: readonly string[];
  links: readonly { href: string; label: string }[];
  source: { href: string; label: string };
};

/**
 * Shared by /updates/ and /rss.xml. Add newest entries first. Keep IDs and
 * publishedAt stable so feed readers do not announce an old entry twice.
 * Source updates use their commit timestamp; package releases use npm's
 * publication timestamp. A site/source entry never implies an npm release.
 */
export const updateEntries: readonly UpdateEntry[] = [
  {
    id: "native-mobile-components",
    title: "iOS and Android components",
    publishedAt: "2026-09-11T00:24:56+02:00",
    kind: "Site and source",
    summary: "Platform-specific controls and phone prototypes for exploring mobile product behavior.",
    changes: [
      "iOS and Android navigation, search, lists, sheets, and controls are available in the component reference and repository source.",
      "The iOS study includes a folding device with outer and inner screens. Both phone studies keep platform conventions and system fonts within Vlak's visual rules.",
      "Keyboard, focus, and interaction checks accompany the new controls. This source update does not represent a new npm package version.",
    ],
    links: [
      { href: "/interfaces/ios/", label: "Try the foldable prototype" },
      { href: "/interfaces/android/", label: "Try Android" },
      { href: "/components/ios-navigation-bar/", label: "iOS navigation" },
      { href: "/components/android-navigation/", label: "Android navigation" },
    ],
    source: {
      href: "https://github.com/Noord-Ventures/vlak/commit/23d6910ef81d88fb99c3b9ecaad93bac89102f9c",
      label: "Source change",
    },
  },
  {
    id: "agent-plugin",
    title: "Vlak for coding agents",
    publishedAt: "2026-09-09T00:41:27+02:00",
    kind: "Site and source",
    summary: "A portable agent plugin pairs the component reference with guidance for building in Vlak.",
    changes: [
      "The plugin combines the MCP server and a use-vlak skill, with manifests for compatible coding tools.",
      "Generated documentation supplies shared tokens, component examples, and installation paths to the site, registry, CLI, and agents.",
      "Installation instructions describe the available connection paths. Directory approval is separate from installing the plugin directly.",
    ],
    links: [{ href: "/docs/agents/", label: "Connect a coding agent" }],
    source: {
      href: "https://github.com/Noord-Ventures/vlak/commit/f2ec0b4fd0342f8d7bce739c224a71d1c5dba916",
      label: "Source change",
    },
  },
  {
    id: "v0-4-0",
    title: "Vlak 0.4.0",
    publishedAt: "2026-09-04T18:05:12.512Z",
    kind: "Package release",
    summary: "React components, generated CSS, and source installation share one set of styles.",
    changes: [
      "The React package ships compiled component styles and one stylesheet. Consumers can also use plain CSS or install component source.",
      "Component documentation includes examples, props, keyboard behavior, and accessibility notes. The registry and machine-readable documentation carry the same reference.",
      "Use the changelog for compatibility and migration details. Later website examples can use repository features that are newer than this package release.",
    ],
    links: [
      { href: "/docs/", label: "Install Vlak" },
      { href: "https://github.com/Noord-Ventures/vlak/blob/main/CHANGELOG.md", label: "Read the changelog" },
    ],
    source: { href: "https://www.npmjs.com/package/@noorddev/vlak-react/v/0.4.0", label: "Published package" },
  },
];
