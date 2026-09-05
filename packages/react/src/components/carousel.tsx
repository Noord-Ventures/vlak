"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Icon } from "./icon";

export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Name of the carousel region. */
  "aria-label"?: string;
}

const fade =
  "linear-gradient(to right, transparent 0, black 28px, black calc(100% - 36px), transparent 100%)";

const styles = stylex.create({
  carousel: {
    position: "relative",
    width: "100%",
    maxWidth: "100%",
  },
  track: {
    display: "flex",
    gap: vlak.gutter,
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    scrollBehavior: {
      default: "smooth",
      [mq.reduce]: "auto",
    },
    scrollbarWidth: "none",
    "::-webkit-scrollbar": {
      display: "none",
    },
    maskImage: fade,
    paddingTop: 2,
    paddingBottom: 2,
    paddingInline: 0,
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
  nav: {
    display: "flex",
    gap: {
      default: "0.3125rem",
      [mq.phone]: "0.5rem",
    },
    marginTop: {
      default: "0.625rem",
      [mq.phone]: "0.875rem",
    },
  },
  page: {
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
      [mq.forcedColors]: "ButtonText",
    },
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    borderColor: {
      default: vlak.controlBorder,
      [mq.forcedColors]: "ButtonText",
    },
    padding: 0,
    backgroundColor: "transparent",
    fontFamily: "inherit",
    cursor: "pointer",
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
  icon: {
    display: "block",
    color: "inherit",
  },
  slide: {
    flexShrink: 0,
    scrollSnapAlign: "start",
    borderRadius: {
      default: vlak.radiusSm,
      [mq.phone]: vlak.radiusSm,
    },
  },
});

const SlideContext = React.createContext<{ index: number; count: number } | null>(null);

/** One slide: a named group, "n of N" unless you name it yourself. */
export const CarouselSlide = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function CarouselSlide(
  { className, style, "aria-label": ariaLabel, ...props },
  ref,
) {
  const slot = React.useContext(SlideContext);
  const sx = rs(["rs-carousel-slide", className], styles.slide);
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      aria-label={ariaLabel ?? (slot ? `${slot.index + 1} of ${slot.count}` : undefined)}
      {...props}
      className={sx.className}
      style={{ ...sx.style, ...style }}
    />
  );
});

/** Native scroll snap; the buttons nudge. The track is the named, focusable carousel region. */
export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(function Carousel(
  { className, style, children, "aria-label": ariaLabel = "Carousel", ...props },
  ref,
) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const nudge = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (track) track.scrollBy({ left: dir * track.clientWidth * 0.8 });
  };
  const root = rs(["rs-carousel", className], styles.carousel);
  const track = rs(["rs-carousel-track"], styles.track);
  const nav = rs(["rs-carousel-nav"], styles.nav);
  const page = rs(["rs-page", "rs-carousel-page"], styles.page);
  const icon = rs(["rs-carousel-icon"], styles.icon);
  const slides = React.Children.toArray(children);
  return (
    <div ref={ref} {...props} className={root.className} style={{ ...root.style, ...style }}>
      <div
        ref={trackRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        className={track.className}
        style={track.style}
        tabIndex={0}
      >
        {slides.map((child, index) => (
          <SlideContext.Provider key={React.isValidElement(child) && child.key != null ? child.key : index} value={{ index, count: slides.length }}>
            {child}
          </SlideContext.Provider>
        ))}
      </div>
      <div className={nav.className} style={nav.style}>
        <button type="button" className={page.className} style={page.style} aria-label="Previous" onClick={() => nudge(-1)}>
          <Icon name="chevron-left" size={12} className={icon.className} style={icon.style} />
        </button>
        <button type="button" className={page.className} style={page.style} aria-label="Next" onClick={() => nudge(1)}>
          <Icon name="chevron-right" size={12} className={icon.className} style={icon.style} />
        </button>
      </div>
    </div>
  );
});
