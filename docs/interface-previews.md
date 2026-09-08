# Full-screen interface previews

Every interface has a Preview fullscreen action. It expands the existing application into the browser viewport and adds a compact Vlak share bar. The app remains mounted; canvas objects, unsaved text, selections and local playback state survive entering and leaving preview.

The share bar copies a stable same-origin address at `/i/<interface>/`. These static routes render the same interface page modules and open directly into preview. Copying and social links work without an account or external shortener. Native browser sharing is offered when available. If clipboard access fails, the bar exposes a selected address for manual copying. Social actions open composition pages only after the user chooses one.

Preview is a viewport layout rather than a browser Fullscreen API session. Native dialogs, popovers and existing application portals remain available. Escape closes an app overlay before leaving preview. Exiting restores the originating control and page position; page controls outside preview are inert while it is open.

Short routes point their canonical metadata to the full study and use noindex, follow. Their Open Graph URLs retain the short address, and they do not enter the sitemap. This keeps one indexed study per interface while allowing direct preview links to be shared.

`interface-preview-e2e.mjs` checks preview geometry, app state, direct routes, copy and share behavior, keyboard return paths and accessibility. `check-discovery.mjs` verifies every exported study has a matching first-paint preview route with the correct canonical and sharing metadata.
