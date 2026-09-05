"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string;
  /** Image text. Defaults to `name`, then `initials`; pass "" for a decorative avatar. */
  alt?: string;
  /** Who this is. Names the image, and the initials when there is no image. */
  name?: string;
  /** Shown when there is no image, or when it fails to load. */
  initials?: string;
  size?: "sm" | "md" | "lg";
}

const AvatarRowContext = React.createContext(false);

const styles = stylex.create({
  avatar: {
    width: "2rem",
    height: "2rem",
    borderRadius: "50%",
    backgroundColor: vlak.dividerSubtle,
    color: vlak.ink,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    overflow: "hidden",
    flexShrink: 0,
    userSelect: "none",
  },
  sm: {
    width: "1.5rem",
    height: "1.5rem",
    fontSize: "0.625rem",
  },
  lg: {
    width: "3rem",
    height: "3rem",
    fontSize: "1rem",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  row: {
    display: "flex",
  },
  inRow: {
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: vlak.paper,
    marginInlineStart: {
      default: "-0.5rem",
      ":first-child": 0,
    },
  },
});

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, alt, name, initials, size = "md", className, style, ...props },
  ref,
) {
  const [failedSrc, setFailedSrc] = React.useState<string>();
  const inRow = React.useContext(AvatarRowContext);
  const showImage = src && src !== failedSrc;
  const altText = alt ?? name ?? initials ?? "";
  const sx = rs(["rs-avatar", size === "sm" && "rs-avatar-sm", size === "lg" && "rs-avatar-lg", className, inRow && "rs-avatar-in-row"], styles.avatar, size === "sm" && styles.sm, size === "lg" && styles.lg, inRow && styles.inRow);
  const img = rs(["rs-avatar-image"], styles.image);
  /* Initials stand in for a name only when one is given; otherwise they read as plain text. */
  const named = !showImage && name ? { role: "img" as const, "aria-label": name } : null;
  return (
    <span ref={ref} {...named} {...props} className={sx.className} style={{ ...sx.style, ...style }}>
      {showImage ? (
        <img className={img.className} style={img.style} src={src} alt={altText} onError={() => setFailedSrc(src)} />
      ) : (
        initials
      )}
    </span>
  );
});

/** Overlapping row with paper seams. */
export const AvatarRow = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function AvatarRow(
  { className, style, ...props },
  ref,
) {
  const sx = rs(["rs-avatar-row", className], styles.row);
  return (
    <AvatarRowContext.Provider value={true}>
      <div ref={ref} {...props} className={sx.className} style={{ ...sx.style, ...style }} />
    </AvatarRowContext.Provider>
  );
});
