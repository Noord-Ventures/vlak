import { describe, expect, it } from "vitest";
import { workflowStylesheet } from "../scripts/workflow-styles.mjs";

describe("packaged workflow styles", () => {
  it("includes real engine layout and focus rules inside an explicit lower layer", () => {
    const css = workflowStylesheet();
    expect(css).toContain("@layer vlak.engine, vlak.tokens, vlak.base, vlak.type, vlak.components");
    expect(css).toContain("@layer vlak.engine {");
    expect(css).toContain(".react-flow__edge-path");
    expect(css).toContain("--xy-edge-stroke-selected");
    expect(css).toContain(".react-flow__handle");
    expect(css).not.toContain("@import");
    expect(css).not.toContain("@media layer(");
    expect(css).toContain("MIT License");
    expect(css).toContain("Copyright (c) 2019-2025 webkid GmbH");
    expect(css).toContain("Permission is hereby granted");
    expect(css).toContain(".react-flow__attribution a");
    expect(css).toContain("color: var(--xy-attribution-color, #999)");
  });
});
