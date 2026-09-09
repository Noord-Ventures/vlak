import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContextUsage } from "../src/components/context-usage";
import { resolveContextPricing, type ContextPricingCatalog } from "../src/components/context-pricing";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const catalog: ContextPricingCatalog = {
  studio: { id: "studio", models: { chat: { id: "chat", name: "Studio chat", limit: { context: 32_000 }, cost: { input: 2, output: 6, cache_read: 0.5 } } } },
  reseller: { models: { chat: { id: "chat", name: "Resold chat", limit: { context: 16_000 }, cost: { input: 4, output: 8 } } } },
  demo: { models: { "demo/free": { name: "Free demo", limit: { context: 2048 }, cost: { input: 0, output: 0 } } } },
};

describe("resolveContextPricing", () => {
  it("resolves qualified ids and unique providerless names from supplied catalogs without fetching", () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("No network"));
    expect(resolveContextPricing("studio:chat", catalog)).toMatchObject({ modelId: "studio/chat", model: "Studio chat", maxTokens: 32_000, pricing: { inputPerMillion: 2, outputPerMillion: 6, cacheReadPerMillion: 0.5, currency: "USD" } });
    expect(resolveContextPricing("free", catalog)?.pricing?.inputPerMillion).toBe(0);
    expect(resolveContextPricing("demo/free", catalog)?.maxTokens).toBe(2048);
    expect(resolveContextPricing("reseller/chat", catalog)?.pricing?.inputPerMillion).toBe(4);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("leaves unknown or ambiguous ids unresolved and never reads prototype properties", () => {
    for (const id of ["chat", "unknown/chat", "", "constructor", "__proto__"]) expect(resolveContextPricing(id, catalog)).toBeUndefined();
    expect(resolveContextPricing("studio/chat", {})).toBeUndefined();
  });
  it("preserves missing/invalid rates and context limits instead of inventing zeros", () => {
    const result = resolveContextPricing("demo/chat", { demo: { models: { chat: { limit: { context: NaN, input: 8000 }, cost: { input: -1, output: Infinity } } } } });
    expect(result?.maxTokens).toBeUndefined(); expect(result?.pricing?.inputPerMillion).toBeUndefined(); expect(result?.pricing?.outputPerMillion).toBeUndefined();
    expect(resolveContextPricing("demo/chat", { demo: { models: { chat: { cost: { input: 1, output: 2, cache_read: -1 } } } } })?.pricing).toEqual({});
  });
  it("selects context tiers from the actual input count, preserving exact boundaries and unknown counts", () => {
    const tiered: ContextPricingCatalog = { demo: { models: { chat: { cost: { input: 1, output: 2, tiers: [{ tier: { size: 200_000 }, input: 2, output: 4 }, { tier: { size: 400_000 }, input: 3, output: 6 }] } } } } };
    expect(resolveContextPricing("demo/chat", tiered)?.pricing).toEqual({});
    expect(resolveContextPricing("demo/chat", tiered, { inputTokens: 200_000 })?.pricing?.inputPerMillion).toBe(1);
    expect(resolveContextPricing("demo/chat", tiered, { inputTokens: 200_001 })?.pricing?.inputPerMillion).toBe(2);
    expect(resolveContextPricing("demo/chat", tiered, { inputTokens: 500_000 })?.pricing?.inputPerMillion).toBe(3);
    const legacy = { demo: { models: { chat: { cost: { input: 1, output: 2, context_over_200k: { input: 2, output: 4 } } } } } };
    expect(resolveContextPricing("demo/chat", legacy, { inputTokens: 200_001 })?.pricing?.outputPerMillion).toBe(4);
  });
});

describe("ContextUsage catalog convenience", () => {
  it("uses supplied model rates/limits, preserves native attributes and updates when the catalog changes", () => {
    const ref = React.createRef<HTMLDetailsElement>();
    const { rerender } = render(<ContextUsage ref={ref} defaultOpen usedTokens={8000} modelId="studio/chat" catalog={catalog} usage={{ inputTokens: 1000, outputTokens: 500, cachedInputTokens: 200 }} data-context="catalog" />);
    expect(ref.current?.dataset.context).toBe("catalog"); expect(ref.current?.hasAttribute("catalog")).toBe(false);
    expect(screen.getByText("Context usage · 25%")).toBeTruthy(); expect(screen.getByText("0.0047 USD")).toBeTruthy(); expect(screen.getByText("Studio chat")).toBeTruthy();
    rerender(<ContextUsage defaultOpen usedTokens={8000} modelId="reseller/chat" catalog={catalog} usage={{ inputTokens: 1000, outputTokens: 500 }} />);
    expect(screen.getByText("Context usage · 50%")).toBeTruthy(); expect(screen.getByText("0.008 USD")).toBeTruthy();
  });
  it("lets explicit values override catalog metadata and keeps missing counts unavailable", () => {
    const { rerender } = render(<ContextUsage defaultOpen usedTokens={1000} maxTokens={4000} model="Custom contract" modelId="studio/chat" catalog={catalog} usage={{ inputTokens: 1000, outputTokens: 0 }} pricing={{ inputPerMillion: 1 }} />);
    expect(screen.getByText("Context usage · 25%")).toBeTruthy(); expect(screen.getByText("Custom contract")).toBeTruthy(); expect(screen.getByText("0.001 USD")).toBeTruthy();
    rerender(<ContextUsage defaultOpen usedTokens={1000} modelId="studio/chat" catalog={catalog} usage={{ inputTokens: 1000, outputTokens: 0 }} />);
    expect(screen.queryByText(/USD/)).toBeNull(); // A known discounted rate with unknown cached usage is not a zero-cache estimate.
    rerender(<ContextUsage defaultOpen usedTokens={1000} modelId="missing" catalog={catalog} usage={{}} />);
    expect(screen.getByText("Context limit unavailable.")).toBeTruthy(); expect(screen.queryByText(/USD/)).toBeNull();
  });
});
