import { ImageResponse } from "next/og";
import { ogFonts } from "./og-font";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const modules = [204, 408, 612, 816, 1020];

export function Mark() {
  return (
    <svg width="34" height="34" viewBox="0 0 822 822" fill="currentColor" aria-hidden="true">
      <g transform="translate(0 822) scale(1 -1)">
        <path d="m411.128.67 128.714 128.713L334.5 334.726 129.158 540.068.405 411.315 411.128.669Z" />
        <path d="M539.429 128.97 411.09.63 282.751 128.97v564.691l128.661 127.928 128.017-127.928V128.97Z" />
        <path d="m500.812 347.858 128.752-128.752 192.21 192.209-128.752 128.753-96.105-96.105-96.105-96.105Z" />
      </g>
    </svg>
  );
}

export function createOgPoster({ label, headline, path = "" }: { label: string; headline: readonly string[]; path?: string }) {
  return new ImageResponse(
    <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", overflow: "hidden", background: "#faf8f2", color: "#171717", fontFamily: "Inter" }}>
      {modules.map((left) => <div key={left} style={{ position: "absolute", left, top: 0, width: 1, height: 630, background: "#e4e1da" }} />)}
      <div style={{ position: "absolute", left: 0, top: 475, width: 1200, height: 1, background: "#dedbd4" }} />

      <div style={{ position: "absolute", left: 40, top: 38, display: "flex" }}><Mark /></div>
      {label ? <div style={{ position: "absolute", left: 224, top: 88, display: "flex", fontSize: 18, fontWeight: 400, color: "#84817b", letterSpacing: "-0.018em" }}>{label}</div> : null}

      <div style={{ position: "absolute", left: 224, top: 278, width: 792, display: "flex", flexDirection: "column" }}>
        {headline.map((line) => <span key={line} style={{ display: "flex", whiteSpace: "nowrap", fontSize: 62, fontWeight: 600, letterSpacing: "-0.052em", lineHeight: 1.02 }}>{line}</span>)}
      </div>

      <div style={{ position: "absolute", left: 224, top: 531, display: "flex", fontSize: 18, fontWeight: 600, letterSpacing: "-0.025em" }}>Vlak</div>
      <div style={{ position: "absolute", right: 100, top: 531, display: "flex", fontSize: 18, fontWeight: 400, color: "#aaa7a0", letterSpacing: "-0.018em" }}>vlak.dev{path}</div>
    </div>,
    { ...ogSize, fonts: ogFonts },
  );
}
