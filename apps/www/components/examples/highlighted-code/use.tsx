"use client";

import { useState } from "react";
import { Button } from "@noorddev/vlak-react";
import { HighlightedCode } from "@noorddev/vlak-react/components/highlighted-code";
import { UseField } from "../use-frame";

export function Use() {
  const [ready, setReady] = useState(false);
  const source = `// Keep the original source available for review.\nconst review = {\n  owner: "Legal",\n  status: "${ready ? "ready" : "draft"}",\n};\n\nexport default review;`;
  return <UseField name="highlighted-code"><h3 className="rs-use-type">Readable source</h3><div className="rs-use-body"><div className="rs-use-stack">
    <HighlightedCode code={source} language="typescript" filename="review.ts" lineNumbers />
    <div className="rs-use-row"><Button variant="subtle" onClick={() => setReady((value) => !value)}>{ready ? "Use draft state" : "Use ready state"}</Button></div>
    <p className="rs-use-kicker">Copy and download use the displayed source. Highlighting updates when an equal-length value changes.</p>
  </div></div></UseField>;
}
