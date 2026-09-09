import type { TokenPricing } from "./context-usage";

/** Tokenlens/models.dev catalog rates are USD per one million tokens. */
export interface ContextModelCost {
  input?: number; output?: number; reasoning?: number; cache_read?: number;
}
export interface ContextModelPricing {
  id?: string; name?: string;
  cost?: ContextModelCost & {
    tiers?: readonly (ContextModelCost & { tier: { type?: "context"; size: number } })[];
    context_over_200k?: ContextModelCost;
  };
  limit?: { context?: number; input?: number; output?: number };
}
/** Structurally accepts a supplied Tokenlens or models.dev provider catalog. */
export type ContextPricingCatalog = Readonly<Record<string, { id?: string; models: Readonly<Record<string, ContextModelPricing>> }>>;
export interface ResolvedContextPricing { modelId: string; model: string; maxTokens?: number; pricing?: TokenPricing }
export interface ContextPricingOptions { inputTokens?: number }

const valid = (value: number | undefined): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0;
const normalizedId = (value: string) => value.trim().replace(/^([^/:]+):/, "$1/");

function rates(model: ContextModelPricing, inputTokens: number | undefined): TokenPricing | undefined {
  const cost = model.cost;
  if (!cost) return undefined;
  let selected: ContextModelCost = cost;
  const tiers = cost.tiers?.length ? cost.tiers : cost.context_over_200k ? [{ ...cost.context_over_200k, tier: { size: 200_000 } }] : [];
  if (tiers.length) {
    // Choosing a tier requires the actual input count, not output or estimated context occupancy.
    if (!valid(inputTokens) || tiers.some(entry => !valid(entry.tier.size) || (entry.tier.type !== undefined && entry.tier.type !== "context"))) return {};
    const thresholds = new Set(tiers.map(entry => entry.tier.size));
    if (thresholds.size !== tiers.length) return {};
    const tier = [...tiers].sort((a, b) => b.tier.size - a.tier.size).find(entry => inputTokens > entry.tier.size);
    if (tier) selected = tier;
  }
  if ([selected.input, selected.output, selected.reasoning, selected.cache_read].some(value => value !== undefined && !valid(value))) return {};
  return {
    inputPerMillion: valid(selected.input) ? selected.input : undefined,
    outputPerMillion: valid(selected.output) ? selected.output : undefined,
    reasoningPerMillion: valid(selected.reasoning) ? selected.reasoning : undefined,
    cacheReadPerMillion: valid(selected.cache_read) ? selected.cache_read : undefined,
    currency: "USD",
  };
}

/**
 * Resolve cached catalog metadata without fetching, timers, or a bundled pricing snapshot.
 * Qualified provider/model ids select the provider's prices; providerless ids must be unique.
 * Catalogs may be obtained with Tokenlens or models.dev in application/server code.
 */
export function resolveContextPricing(modelId: string, catalog: ContextPricingCatalog, options: ContextPricingOptions = {}): ResolvedContextPricing | undefined {
  const requested = normalizedId(modelId);
  if (!requested) return undefined;
  const matches: { modelId: string; model: ContextModelPricing }[] = [];
  for (const [providerKey, provider] of Object.entries(catalog)) {
    const providerIds = [providerKey, provider.id].filter((id): id is string => Boolean(id));
    for (const [modelKey, model] of Object.entries(provider.models)) {
      const localIds = [modelKey, model.id].filter((id): id is string => Boolean(id)).map(normalizedId);
      const aliases = new Set(localIds.flatMap(id => providerIds.map(providerId => id.startsWith(`${providerId}/`) ? id : `${providerId}/${id}`)));
      // A providerless lookup can be convenient, but cannot silently choose reseller pricing.
      const providerless = !requested.includes("/") && localIds.some(id => id === requested || providerIds.some(providerId => id === `${providerId}/${requested}`));
      if (aliases.has(requested) || providerless) {
        const providerId = provider.id || providerKey;
        const localId = normalizedId(model.id || modelKey);
        matches.push({ modelId: localId.startsWith(`${providerId}/`) ? localId : `${providerId}/${localId}`, model });
      }
    }
  }
  if (matches.length !== 1) return undefined;
  const found = matches[0]!;
  const limit = found.model.limit?.context;
  return { modelId: found.modelId, model: found.model.name?.trim() || found.modelId, maxTokens: valid(limit) && limit > 0 ? limit : undefined, pricing: rates(found.model, options.inputTokens) };
}
