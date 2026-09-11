import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { ogFonts } from "../../og-font";
import { Mark, ogContentType, ogSize } from "../../og-poster";

export const alt = "iPhone Duo interface prototype, with outer and inner Home screens in Vlak";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static";

export default function OpenGraphImage() {
  // Actual live Home captures; refresh with scripts/capture-ios-og.mjs.
  const closed = readFileSync(join(process.cwd(), "public/images/social/ios-home-closed.png"));
  const opened = readFileSync(join(process.cwd(), "public/images/social/ios-home.png"));
  return new ImageResponse(
    <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", overflow: "hidden", background: "#faf8f2", color: "#171717", fontFamily: "Inter" }}>
      <div style={{ position: "absolute", left: 204, top: 0, width: 996, height: 562, background: "#f5f3ed" }} />
      {[204, 408, 612, 816, 1020].map(left => <div key={left} style={{ position: "absolute", left, top: 0, width: 1, height: 630, background: "#e4e1da" }} />)}
      <div style={{ position: "absolute", left: 0, top: 562, width: 1200, height: 1, background: "#dedbd4" }} />
      <div style={{ position: "absolute", left: 40, top: 38, display: "flex" }}><Mark /></div>
      <div style={{ position: "absolute", left: 40, top: 88, display: "flex", fontSize: 18, fontWeight: 400, color: "#84817b", letterSpacing: "-0.018em" }}>Interface prototype</div>
      <div style={{ position: "absolute", left: 40, top: 248, width: 154, display: "flex", fontSize: 58, fontWeight: 600, letterSpacing: "-0.052em", lineHeight: 1.02 }}>iPhone Duo</div>
      <img src={`data:image/png;base64,${closed.toString("base64")}`} alt="Closed Duo Home with a straight left hinge edge" width={316} height={316 * 1436 / 1012} style={{ position: "absolute", left: 224, top: 58 }} />
      <img src={`data:image/png;base64,${opened.toString("base64")}`} alt="Opened Duo Home on the complete inner display" width={600} height={600 * 1418 / 1982} style={{ position: "absolute", left: 560, top: 68 }} />
      <div style={{ position: "absolute", left: 224, top: 526, display: "flex", fontSize: 16, fontWeight: 400, color: "#84817b", letterSpacing: "-0.018em" }}>Closed</div>
      <div style={{ position: "absolute", left: 560, top: 526, display: "flex", fontSize: 16, fontWeight: 400, color: "#84817b", letterSpacing: "-0.018em" }}>Opened</div>
      <div style={{ position: "absolute", left: 40, top: 590, display: "flex", fontSize: 18, fontWeight: 600, letterSpacing: "-0.025em" }}>Vlak</div>
      <div style={{ position: "absolute", right: 40, top: 590, display: "flex", fontSize: 18, fontWeight: 400, color: "#aaa7a0", letterSpacing: "-0.018em" }}>vlak.dev/interfaces/ios</div>
    </div>,
    { ...ogSize, fonts: ogFonts },
  );
}
