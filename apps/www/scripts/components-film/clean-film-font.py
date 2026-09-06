"""Create the film's Inter geometry source with simple, nonoverlapping contours.

Install prerequisites in an isolated environment: pip install fonttools skia-pathops
Run: python apps/www/scripts/components-film/clean-film-font.py

The source font includes intentional self-overlap in V, M and other glyphs.
Browser text rasterizers handle its winding rule, while Three.js Earcut expects
simple polygons. This Boolean union retains Inter's outline and metrics while
making those contours suitable for real extruded 3D typography.
Font license: packages/core/css/fonts/inter/OFL.txt (SIL Open Font License).
"""

from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.ttLib.removeOverlaps import removeOverlaps


def main():
    here = Path(__file__).resolve().parent
    source = here.parents[1] / "app" / "Inter-580.ttf"
    destination = here / "Inter-580-clean.ttf"
    font = TTFont(source, recalcTimestamp=False)
    metrics = dict(font["hmtx"].metrics)
    removeOverlaps(font, removeHinting=True, ignoreErrors=False)
    assert dict(font["hmtx"].metrics) == metrics, "Font metrics must stay unchanged"
    font.save(destination, reorderTables=False)
    print(f"Saved {destination} ({destination.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
