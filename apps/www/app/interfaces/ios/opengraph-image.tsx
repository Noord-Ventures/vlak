import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { ogFonts } from "../../og-font";
import { Mark, ogContentType, ogSize } from "../../og-poster";

export const alt = "iOS interface study, the unfolded iPhone Duo Home screen in Vlak";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static";

export default function OpenGraphImage() {
  // Actual live Home capture; refresh with scripts/capture-ios-og.mjs.
  const home = readFileSync(join(process.cwd(), "public/images/social/ios-home.png"));
  return new ImageResponse(
    <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", overflow: "hidden", background: "#faf8f2", color: "#171717", fontFamily: "Inter" }}>
      <div style={{ position: "absolute", left: 408, top: 0, width: 792, height: 562, background: "#f5f3ed" }} />
      {[204, 408, 612, 816, 1020].map(left => <div key={left} style={{ position: "absolute", left, top: 0, width: 1, height: 630, background: "#e4e1da" }} />)}
      <div style={{ position: "absolute", left: 0, top: 562, width: 1200, height: 1, background: "#dedbd4" }} />
      <div style={{ position: "absolute", left: 40, top: 38, display: "flex" }}><Mark /></div>
      <div style={{ position: "absolute", left: 224, top: 88, display: "flex", fontSize: 18, fontWeight: 400, color: "#84817b", letterSpacing: "-0.018em" }}>Interface study</div>
      <div style={{ position: "absolute", left: 224, top: 272, display: "flex", fontSize: 76, fontWeight: 600, letterSpacing: "-0.052em", lineHeight: 1.02 }}>iOS</div>
      <img src={`data:image/png;base64,${home.toString("base64")}`} alt="The live iPhone Duo Home interface" width={732} height={524} style={{ position: "absolute", left: 428, top: 20 }} />
      <div style={{ position: "absolute", left: 224, top: 590, display: "flex", fontSize: 18, fontWeight: 600, letterSpacing: "-0.025em" }}>Vlak</div>
      <div style={{ position: "absolute", right: 40, top: 590, display: "flex", fontSize: 18, fontWeight: 400, color: "#aaa7a0", letterSpacing: "-0.018em" }}>vlak.dev/interfaces/ios</div>
    </div>,
    { ...ogSize, fonts: ogFonts },
  );
}
