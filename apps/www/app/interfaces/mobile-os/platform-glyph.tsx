import type { SVGProps } from "react";

export type PlatformGlyphName =
  | "wifi"
  | "wifi-off"
  | "bluetooth"
  | "airplane"
  | "cellular"
  | "battery"
  | "orientation-lock"
  | "orientation-unlock";

export type PlatformGlyphProps = Omit<SVGProps<SVGSVGElement>, "name" | "children"> & {
  name: PlatformGlyphName;
  size?: number;
};

/** Original system-control drawings, with semantic shapes rather than app symbols.
 * These are not SF Symbols or Material icon assets. The containing control names
 * the action; the drawing is decorative unless the caller supplies aria-hidden.
 */
export function PlatformGlyph({ name, size = 24, className, "aria-hidden": ariaHidden = true, ...props }: PlatformGlyphProps) {
  return (
    <svg
      {...props}
      className={["rs-icon", "mo-platform-glyph", className].filter(Boolean).join(" ")}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden={ariaHidden}
      focusable="false"
    >
      {name === "wifi" && <g fill="currentColor">
        <path d="M1.4 7.8a15.4 15.4 0 0 1 21.2 0l-1.9 2a12.7 12.7 0 0 0-17.4 0Z" />
        <path d="M5 11.6a10.1 10.1 0 0 1 14 0l-1.9 2a7.4 7.4 0 0 0-10.2 0Z" />
        <path d="M8.7 15.5a4.8 4.8 0 0 1 6.6 0L12 19Z" />
      </g>}
      {name === "wifi-off" && <g fill="currentColor">
        <path d="M10 3.6a15.4 15.4 0 0 1 12.6 4.2l-1.9 2a12.7 12.7 0 0 0-8.1-3.4ZM1.4 7.8a15.3 15.3 0 0 1 3-2.2l2 2a12.5 12.5 0 0 0-3.1 2.2Z" />
        <path d="M5 11.6a10.1 10.1 0 0 1 4.6-2.4l2.5 2.5a7.4 7.4 0 0 0-5.2 1.9ZM8.7 15.5a4.8 4.8 0 0 1 6.6 0L12 19Z" />
        <path d="m3.3 2.1 18.6 18.6-1.6 1.6L1.7 3.7Z" />
      </g>}
      {name === "bluetooth" && <path d="m7.5 7.2 9.3 9.1-4.7 4.2v-17l4.7 4.2-9.3 9.1" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />}
      {name === "airplane" && <path d="M12 1.8c.8 0 1.3.8 1.3 1.8v5.2l8.5 5.4v2.1l-8.5-2.8v5l3 2v1.7L12 20.8l-4.3 1.4v-1.7l3-2v-5l-8.5 2.8v-2.1l8.5-5.4V3.6c0-1 .5-1.8 1.3-1.8Z" fill="currentColor" />}
      {name === "cellular" && <>
        <g stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
          <path d="M5.3 3.8a9.4 9.4 0 0 0 0 13.4m13.4-13.4a9.4 9.4 0 0 1 0 13.4M8 6.5a5.6 5.6 0 0 0 0 8m8-8a5.6 5.6 0 0 1 0 8" />
          <path d="M12 12.2v9" />
        </g>
        <circle cx="12" cy="10.5" r="2.1" fill="currentColor" />
      </>}
      {name === "battery" && <>
        <rect x="1.6" y="6.7" width="18.7" height="10.6" rx="2.3" stroke="currentColor" strokeWidth="1.7" />
        <rect x="4" y="9.1" width="11.7" height="5.8" rx=".9" fill="currentColor" />
        <path d="M22 9.4c1 .4 1.5 1.3 1.5 2.6s-.5 2.2-1.5 2.6Z" fill="currentColor" />
      </>}
      {(name === "orientation-lock" || name === "orientation-unlock") && <>
        <path d="M6.2 4.5a9.3 9.3 0 1 1-3.3 9.8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        <path d="m6.7 1.2-.3 5.5-5.2-2.1Z" fill="currentColor" />
        {name === "orientation-lock"
          ? <path d="M9.5 11.4V9.5a2.5 2.5 0 0 1 5 0v1.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          : <path d="M9.5 11.4V9.5a2.5 2.5 0 0 1 4.8-1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />}
        <rect x="8.1" y="10.8" width="7.8" height="6.5" rx="1.4" fill="currentColor" />
      </>}
    </svg>
  );
}
