import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Icon } from "./icon";

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  /** Current 1-based page. */
  page: number;
  count: number;
  onPageChange?: (page: number) => void;
  /** Pages kept visible around the current one. */
  siblings?: number;
}

const styles = stylex.create({
  pages: {
    display: "flex",
    alignItems: "center",
    gap: {
      default: "0.3125rem",
      [mq.phone]: "0.5rem",
    },
    flexWrap: {
      default: null,
      [mq.phone]: "wrap",
    },
  },
  page: {
    transition: {
      default: vlak.transition,
      [mq.reduce]: "none",
    },
    boxSizing: "border-box",
    width: {
      default: vlak.hit,
      [mq.phone]: vlak.hit,
    },
    height: {
      default: vlak.hit,
      [mq.phone]: vlak.hit,
    },
    minWidth: {
      default: null,
      [mq.phone]: vlak.hit,
    },
    minHeight: {
      default: null,
      [mq.phone]: vlak.hit,
    },
    borderRadius: {
      default: vlak.radiusSm,
      [mq.phone]: vlak.radiusSm,
    },
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: {
      default: "0.8125rem",
      [mq.phone]: vlak.controlFs,
    },
    color: {
      default: vlak.gray,
      [mq.forcedColors]: {
        default: "ButtonText",
        ":disabled": "GrayText",
      },
    },
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    borderColor: {
      default: vlak.controlBorder,
      ":hover": vlak.controlFill,
      [mq.forcedColors]: {
        default: "ButtonText",
        ":disabled": "GrayText",
      },
    },
    padding: 0,
    backgroundColor: {
      default: "transparent",
      ":hover": vlak.controlFill,
      [mq.forcedColors]: "ButtonFace",
    },
    fontFamily: "inherit",
    cursor: {
      default: "pointer",
      ":disabled": "not-allowed",
    },
    opacity: {
      default: 1,
      ":disabled": 0.4,
      [mq.forcedColors]: {
        default: 1,
        ":disabled": 1,
      },
    },
    outlineWidth: {
      default: null,
      ":focus-visible": 2,
    },
    outlineStyle: {
      default: null,
      ":focus-visible": "solid",
    },
    outlineColor: {
      default: null,
      ":focus-visible": vlak.ink,
    },
    outlineOffset: {
      default: null,
      ":focus-visible": 2,
    },
  },
  on: {
    backgroundColor: {
      default: vlak.ink,
      [mq.forcedColors]: "Highlight",
    },
    color: {
      default: vlak.paper,
      [mq.forcedColors]: "HighlightText",
    },
    fontWeight: 600,
    borderColor: {
      default: "transparent",
      [mq.forcedColors]: "Highlight",
    },
    forcedColorAdjust: "none",
  },
  gap: {
    borderColor: "transparent",
    cursor: "default",
  },
  icon: {
    display: "block",
    color: "inherit",
  },
});

function pageItems(page: number, count: number, siblings: number): Array<number | "gap"> {
  const wanted = new Set<number>([1, count]);
  for (let p = page - siblings; p <= page + siblings; p++) {
    if (p >= 1 && p <= count) wanted.add(p);
  }
  const sorted = [...wanted].sort((a, b) => a - b);
  const items: Array<number | "gap"> = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev === 2) items.push(prev + 1);
    else if (prev && p - prev > 2) items.push("gap");
    items.push(p);
    prev = p;
  }
  return items;
}

export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(function Pagination({
  page,
  count,
  onPageChange,
  siblings = 1,
  className,
  style,
  ...props
}, ref) {
  const nav = rs(["rs-pages", className], styles.pages);
  const icon = rs(["rs-pages-icon"], styles.icon);
  return (
    <nav ref={ref} aria-label="Pagination" {...props} className={nav.className} style={{ ...nav.style, ...style }}>
      <PageButton aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)}>
        <Icon name="chevron-left" size={12} className={icon.className} style={icon.style} />
      </PageButton>
      {pageItems(page, count, siblings).map((item, index) => {
        if (item === "gap") {
          const gap = rs(["rs-page", "rs-page-gap"], styles.page, styles.gap);
          return (
            <span key={`gap-${index}`} className={gap.className} style={gap.style} aria-hidden="true">
              …
            </span>
          );
        }
        return (
          <PageButton
            key={item}
            current={item === page}
            aria-current={item === page ? "page" : undefined}
            onClick={() => onPageChange?.(item)}
          >
            {item}
          </PageButton>
        );
      })}
      <PageButton aria-label="Next page" disabled={page >= count} onClick={() => onPageChange?.(page + 1)}>
        <Icon name="chevron-right" size={12} className={icon.className} style={icon.style} />
      </PageButton>
    </nav>
  );
});

function PageButton({
  current,
  className,
  style,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { current?: boolean }) {
  const sx = rs(["rs-page", current && "rs-page-on", className], styles.page, current && styles.on);
  return <button type="button" {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
}
