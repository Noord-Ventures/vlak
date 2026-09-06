# Inspiration studies

These are original interpretive models created for the Vlak gallery prototype. They are not scans, measured reproductions, or archival product models.

- `chair.glb`: a cantilever chair study after Paul Schuitema's Chair 35, with polished tubular chrome and charcoal upholstery. The original Chair 35 used chrome-plated steel, plywood, and wood; the upholstery here is an intentional reinterpretation. [Museum reference](https://www.boijmans.nl/en/collection/artworks/112372/35).
- `pavilion.glb`: a modernist campus study after Max Bill's HfG Ulm, using stepped volumes, ribbon glazing, fine window frames, a terrace, and a raised accommodation block. [Archive reference](https://hfg-archiv.museumulm.de/en/the-hfg-archive/building/).
- `kitchen.glb`: the complete Piet Zwart Bruynzeel kitchen arrangement, with cabinet run, sink, taps, breadboard slide, drawer stack, utensil rack, storage bins, and a shallow room cutaway. Monochrome materials and approximate proportions are interpretive. [Bruynzeel history](https://webwinkel.bruynzeelkeukens.nl/geschiedenis), [Dutch Cultural Heritage context](https://kennis.cultureelerfgoed.nl/index.php/Keukens).
- `chair-poster.webp` and `pavilion-poster.webp`: Blender Cycles studio renders, 1500 × 1200.
- `kitchen-poster.webp`: Blender Cycles studio render, 1700 × 1250.

Models use glTF Y-up with their base at Y=0 and horizontal bounds centered at X=Z=0. Each material is merged into one mesh to reduce draw calls. There are no textures, cameras, or lights in the GLBs. The pavilion's landscape plinth and kitchen's room cutaway are part of their physical models. Exact dimensions and byte counts are recorded in `manifest.json` and `kitchen-manifest.json`.

Rebuild from the repository root with Blender 4.5 or newer:

```sh
blender --background --python apps/www/scripts/build-inspiration-assets.py -- --render
blender --background --python apps/www/scripts/build-inspiration-kitchen.py -- --render
python3 - <<'PY'
from pathlib import Path
from PIL import Image
for name in ('chair', 'pavilion', 'kitchen'):
    image = Image.open(Path('/tmp/vlak-inspiration-renders') / f'{name}.png')
    image.save(Path('apps/www/public/inspiration') / f'{name}-poster.webp', quality=90, method=6)
PY
```

Omit `-- --render` to rebuild only the GLBs. Poster conversion requires Pillow. Poster lighting uses four area lights, AgX, and 80 Cycles samples with denoising. It does not change the exported model materials or add studio objects to the GLBs.
