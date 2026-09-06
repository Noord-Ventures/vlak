# Inspiration prototype

All 22 About reference works have a physical 3D interpretation in the collection, embedded after Design lineage within the existing field grid. This replaces the static reference gallery. `/inspiration/` retains the standalone prototype. Both use the same Three.js scene and original Blender studies alongside the site’s existing reference images.

`<Gallery embedded />` omits the standalone page header and introduction, uses the About palette and type scale, and follows the site’s appearance setting. Its studio initializes only when the field approaches the viewport. The scene and controls are shared with the standalone version.

## Interaction

- Drag horizontally to browse; release velocity projects at most one additional item. Previous/next wrap around the collection.
- Choose **Turn object** to rotate the active work with inertia. Buttons provide the same rotation without dragging. Scale and reset work on every object.
- The filmstrip supports arrow keys, Home, and End. Its square cells share hairlines and follow About's 1/2/4/6-column grid. A Vlak Select provides direct selection and type-ahead across all 22 works. Normal vertical scrolling remains available on touchscreens and trackpads.
- The site's appearance setting changes the actual environment, key/fill/rim lighting, and floor. There is no separate lighting toggle.
- Continuous rotation is opt-in and disabled for reduced motion. Reduced motion retains direct manipulation and immediate navigation.
- Failed models or WebGL initialization leave a useful still image, navigation, source information, and a retry that preserves the selected work.

## Rendering and assets

`scene.ts` loads on demand, uses one WebGL renderer, a locally generated room environment, PBR materials, filtered shadows, and inexpensive contact shadows. It sleeps once motion settles, while offscreen, and when the document is hidden. Pixel ratio is capped at 1.75 desktop and 1.5 phone. Models, textures, observers, listeners, render targets, and GPU resources are disposed on unmount.

The chair, pavilion, and complete Bruynzeel kitchen GLBs total about 1.22 MiB, contain 22 material meshes, and need no external texture or decoder. They are original interpretations, not measured reproductions of the historical objects. In particular, the chair study uses upholstered surfaces where the original used plywood and wood. The kitchen includes the complete cabinet arrangement, hollow sink, taps, drawers, chrome pulls, breadboard slide, open shelf, utensil rack, glass bins, and room cutaway. Source information and rebuild instructions are in `public/inspiration/README.md` and the Blender scripts.

`collection.ts` supplies metadata, local reference images, source links, and each work's physical format. `objects.ts` builds seven bound books or brochures, eight framed posters, three signs (including a recessed memorial wall fragment), and a silver coin. Books have spines and page edges; the coin has a milled rim and shallow surface relief. Undocumented reverse surfaces are plain, and display supports are contemporary interpretations. Sign artwork is rectified through mesh UVs from its photographed panel. The scene loads at most three assets concurrently and prioritizes the selected work and its neighbors.

All controls and captions use `@noorddev/vlak-react`: Button, ButtonGroup, Toggle, Slider, Select, Icon, Card, Badge, Label, and Link. Captions reuse About's typography with muted dates/location, a large designer name, and work details. Their source is the same `facts.ts` data via server-supplied `reference-captions.ts`. Thumbnail Toggle layout props remove standalone borders and radii so the containing grid supplies shared seams; selected fill and focus remain Vlak's.

## Verification

```sh
pnpm --filter www typecheck
pnpm exec biome check apps/www/app/inspiration
node --experimental-strip-types --test apps/www/scripts/test-inspiration-dynamics.mjs
INSPIRATION_URL=http://localhost:3100/inspiration/ node apps/www/scripts/e2e-inspiration.mjs
ABOUT_URL=http://localhost:3101/about/ node apps/www/scripts/e2e-about-inspiration.mjs
```

The browser suite uses installed Chrome by default; `PLAYWRIGHT_EXECUTABLE_PATH` can select another Chromium executable. It checks all 22 works, coverage of every About reference, Vlak controls, cyclic navigation and focus, keyboard selection of the kitchen, pointer browse/turn, rotation and lighting pixel changes, scale/reset, phone layout and target sizes, axe accessibility, reduced motion, and WebGL failure/retry.
