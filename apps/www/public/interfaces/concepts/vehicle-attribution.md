# Vehicle model

EV Controls renders a simplified three-dimensional line drawing of **2022 Land Rover Range Rover Evoque** by **tonielpro520**.

- Model: https://sketchfab.com/3d-models/2022-land-rover-range-rover-evoque-034600db0cc94d64a7f3ccb19c7799fa
- Creator: https://sketchfab.com/tonielpro520
- License: Creative Commons Attribution 4.0, https://creativecommons.org/licenses/by/4.0/
- Public metadata: https://api.sketchfab.com/v3/models/034600db0cc94d64a7f3ccb19c7799fa
- Official GLB downloaded through Sketchfab on 7 September 2026
- Runtime geometry asset: `evoque-monochrome.glb`, 4,819,464 bytes
- Local geometry: 204,453 triangles, 147,374 position/normal vertices, 66 meshes, 21 source materials
- Source listing: 204,461 triangles, 114,716 vertices; the converted GLB has the counts above

The runtime GLB removes texture and UV data and welds identical position/normal vertices without simplifying its geometry. Its source attribution remains in the GLB metadata.

The live EV drawing retains the licensed model’s full geometry and proportions. An offline preparation script extracts selected original body boundaries, panel creases and front-facing wheel ridges, then simplifies their points. Paper-colored surfaces hide rear lines; only the paint and tires receive silhouette outlines. Fine trim, badges, grille mesh and interior outlines are omitted. The same source model rotates continuously between the side, driving and battery views. `evoque-feature-lines.json` records the derived contours; `prepare-evoque-features.mjs --check` verifies their reproducibility.

The electric system, rotating wheels, headlight effects, battery assembly and passing streetscape are illustrative additions, not engineering representations of the source vehicle.

Creator and license links appear under Components used on the EV study page. This adaptation does not imply endorsement by the creator or vehicle manufacturer. The separate 3D Workspace now displays a Braun T3 with its own attribution.

The current EV gallery and fallback use `evoque-line-side-light-v4.png` and `evoque-line-side-dark-v4.png`, captured without retouching from the live Three.js renderer. The earlier vehicle previews remain archived. `vehicle-model-preview.jpg` is the unmodified official model thumbnail under the same license. Source: https://media.sketchfab.com/models/034600db0cc94d64a7f3ccb19c7799fa/thumbnails/7679db459c6c45cbaaf84ade01f253da/6825b332342d44899626583015da3ab8.jpeg
