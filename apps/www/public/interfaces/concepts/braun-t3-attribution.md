# Braun T3 model attribution

The local `braun-t3-monochrome.glb` is adapted from [Radio T3](https://sketchfab.com/3d-models/radio-t3-aad3d54384904cfc9b3df8791d254c5c) by [ludwigangulodi](https://sketchfab.com/ludwigangulodi), licensed under [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).

The original download is preserved separately. Unused texture coordinates were removed, and fitting 32-bit indices were repacked as 16-bit indices. All 32,027 triangles, 28,180 stored position/normal vertices, 3 meshes and scene transforms are retained exactly. There is 1 source material and no images or textures. The adapted file is 871,796bytes, down from 1,289,424bytes. No geometric simplification was performed.

Vlak supplies paper-colored faces, screen-space feature contours and a narrow silhouette hull at runtime. The grille, tuning dial and raised markers are supplied geometry. Preview images are direct screenshots of that renderer. These modifications do not imply endorsement by the model creator or manufacturer.

The product's design credit is separate from the model creator's credit. [MoMA identifies](https://www.moma.org/collection/works/4134) Dieter Rams and Hochschule für Gestaltung, Ulm as the designers of the 1958 T3 pocket radio, manufactured by Braun AG. Source model units have not been verified as physical measurements.

Original SHA-256: `de3dae8133db12ce207eb42398cdaffc3bf8a533367656153d35e4221f1eefe3`.

Adapted SHA-256: `f0977ca4bdb85091181fa36a0fa00842dcdff4535560aaf2755ab118b32d2573`.

Reproduce the binary repacking with `python3 apps/www/scripts/prepare-t3-model.py <original-download.glb> <adapted-output.glb> <inspection-report.json>`. Inspect its bounds and geometry before using a different source revision.
