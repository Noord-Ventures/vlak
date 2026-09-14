# Interface starters

Status: accepted architecture. Verification remains a release requirement, not a property inferred from a catalog entry.

## Context

The interface catalog has 30 working studies. A starter should reproduce one study as a standalone Vite and React project, without requiring Next.js, the Vlak repository, website analytics or unpublished package snapshots. The `mobile-os` route is an index of iOS and Android, not another study.

## Decision

Generate every starter from its existing study source. `apps/www/app/starters/catalog.ts` is metadata shared by the exporter, interface gallery, contextual links and verification. It imports only the interface slug type, so Node can read it with type stripping without loading Next or client components.

Interfaces is the single browsing destination. Each study has a preview and download at `/interfaces/#<slug>`; its full page keeps contextual download and source actions. The small Vite and Next.js form examples belong in the installation guide at `/docs/#base-examples`, not another gallery.

The retired `/starters/` path is excluded from search and the sitemap. Both Vercel configurations permanently redirect it to `/interfaces/`, passing through the query and leaving the fragment for the browser to inherit. Other static hosts use a small client redirect that copies `location.search` and `location.hash` without rebuilding them. The exported HTML is noindex, canonical to Interfaces, and includes ordinary links to the gallery and each study when JavaScript is unavailable. There is no static meta refresh, because it would discard campaign queries. On a host without the server redirect, the no-JavaScript fallback remains navigable but cannot carry an unknown query into its links.

| Metadata | Meaning |
| --- | --- |
| `entry`, `component`, `props`, `styles` | Exported React root and any styles normally supplied by the site page |
| `edit`, `note` | First file to change and the actual scope of the example |
| `dependencies`, `devDependencies` | Extra packages, such as Three.js and its types; Vlak versions come from release manifests |
| `assets`, `credits` | Explicit public-relative files and notices, in addition to collected source dependencies |
| `env` | Optional public Vite configuration; `prop` names the component input receiving it |
| `networkNotes` | External services, provider media and limitations that remain after export |

Use the same components for the site and starter. Platform-specific configuration belongs in the outer wrapper: the site supplies its public Mapbox token, while the standalone entry supplies `VITE_MAPBOX_ACCESS_TOKEN`. Keep framework imports out of the shared study root. Follow static and dynamic imports, workers, styles and local assets when collecting files; fail on undeclared packages, missing paths or source escapes.

Separate repositories or hand-maintained copies would make studies and starters drift. Exporting whole Next pages would carry the documentation shell and unrelated site dependencies. A catalog-driven source export avoids both, but adds a packaging contract that must be tested.

## Boundaries

- Sample state is not a backend. Chat, agent, finance, identity, science, care and vehicle examples retain explicit local-data notes.
- Mapbox is optional. A starter with no token must show the existing local map preview. Never include a developer's token or a server credential in an archive.
- Music previews and video embeds remain provider-hosted, not redistributed recordings. Their availability is outside the starter's control. The music player also accepts local audio.
- Model geometry and its attribution travel together. The Braun T3, Evoque and Athena assets have their own CC BY 4.0 notices; the code's MIT license does not replace those notices. Keep credits reachable in a deployed starter too.
- The desktop browser reads bundled guide files. All runtime asset paths must work below a deployment subdirectory, not just at an origin root.
- iOS and Android retain platform system fonts. Website analytics stay out of exported projects.

## Test plan

1. Compare starter slugs with all actual interface slugs. Reject missing, duplicated or unknown entries. Validate named component exports, styles, edit paths, asset paths and credit notices.
2. Generate all 30 archives twice from unchanged inputs and compare bytes. Inspect the archived manifests: exact current Vlak versions, only declared extra dependencies, no workspace references, vendor snapshots, credentials or symlinks.
3. Extract each actual ZIP into an isolated project, install dependencies, typecheck and build. Candidate checks use verified local release tarballs only inside test projects; the downloadable manifests keep their public package pins. Repeat against npm after publication as described in [Releases](releases.md).
4. Serve every production build from a subdirectory. Check startup, console errors, missing assets and at least one meaningful interaction per study. Include light and dark appearance, a narrow viewport and keyboard access to the main action.
5. Exercise the exceptions deliberately: loaded Three.js geometry and unavailable-WebGL fallback, the token-free fleet preview, desktop guide navigation, the CSV worker, local project save/import/export, user-initiated audio and provider playback failure. Keep deterministic local checks separate from network-dependent provider checks.
6. Follow a legacy `/starters/?utm_source=...#ios` link and check that the Interfaces destination keeps both query and fragment. With JavaScript disabled on the exported fallback, confirm that gallery and study links remain usable. Verify that search, navigation and the sitemap expose Interfaces, not a second starter gallery.

Adding a study means adding its export metadata and verification case in the same change. A matching catalog entry alone is not enough to advertise a working download.
