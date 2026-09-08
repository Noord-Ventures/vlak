import * as stylex from "@stylexjs/stylex";

const at481 = "@media (min-width: 481px)";
const at816 = "@media (min-width: 816px)";
const at1224 = "@media (min-width: 1224px)";

/**
 * Homepage specimen. Overlay kill (`html:has(.specimen-page)::before`)
 * and named grid-template-areas stay in specimen.css — StyleX cannot
 * target html from a child; CI greps the named areas and clip-path.
 * Column counts must live here: a 1-col StyleX default would collapse
 * the live 2 / 4 / 6 recuts.
 */
export const specimen = stylex.create({
  page: {
    width: "100%",
    minHeight: "100dvh",
    margin: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  field: {
    display: "grid",
    width: "100%",
    minHeight: "100dvh",
    margin: 0,
    borderWidth: 0,
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [at481]: "repeat(2, minmax(0, 1fr))",
      [at816]: "repeat(4, minmax(0, 1fr))",
      [at1224]: "repeat(6, minmax(0, 1fr))",
    },
    gridAutoRows: "minmax(204px, auto)",
    backgroundColor: "var(--divider)",
    padding: 0,
    gap: 1,
    boxShadow: "inset 1px 0 0 var(--grid-line), inset -1px 0 0 var(--grid-line)",
    clipPath: "inset(0)",
  },
  cell: {
    minWidth: 0,
    minHeight: 204,
    padding: 20,
    backgroundColor: "var(--bg)",
    display: "flex",
    flexDirection: "column",
    overflow: "visible",
    borderRadius: 0,
  },
  /** Face / law: 408 module, type on the bottom so it clears the 72 crumb bar. */
  cellEnd: {
    justifyContent: "flex-end",
  },
  cellTall: {
    minHeight: 408,
    justifyContent: "flex-end",
  },
  cellCommand: {
    minHeight: 408,
    justifyContent: "space-between",
    gap: 20,
  },
});
