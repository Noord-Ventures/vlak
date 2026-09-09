"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Collapsible } from "./collapsible";
import { Progress } from "./progress";

export interface TokenUsage { inputTokens?: number; outputTokens?: number; reasoningTokens?: number; cachedInputTokens?: number }
export interface TokenPricing { inputPerMillion?: number; outputPerMillion?: number; reasoningPerMillion?: number; cacheReadPerMillion?: number; currency?: string }
export interface ContextUsageProps extends Omit<React.DetailsHTMLAttributes<HTMLDetailsElement>, "title"> {
  usedTokens: number; maxTokens: number; usage?: TokenUsage; pricing?: TokenPricing;
  model?: string; label?: string; defaultOpen?: boolean;
}
const styles = stylex.create({
  root: { width: "100%", minWidth: 0, color: vlak.ink },
  body: { display: "grid", gap: "0.75rem" },
  metadata: { margin: 0, fontSize: vlak.controlLabel, color: vlak.gray, lineHeight: 1.45 },
  list: { margin: 0, display: "grid", gap: "0.5rem", fontSize: vlak.controlFs, fontVariantNumeric: "tabular-nums", lineHeight: 1.45 },
  row: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "0.5rem 1rem" },
  value: { margin: 0, color: vlak.ink },
});
const valid = (value: number | undefined): value is number => value !== undefined && Number.isFinite(value) && value >= 0;
const amount = (value: number | undefined) => valid(value) ? value.toLocaleString("en-US") : "Unavailable";

/** Context occupancy and caller-supplied token usage/pricing. No model catalog or prices are fetched. */
export const ContextUsage = React.forwardRef<HTMLDetailsElement, ContextUsageProps>(function ContextUsage({ usedTokens, maxTokens, usage, pricing, model, label = "Context usage", defaultOpen = false, className, style, ...props }, ref) {
  const known = valid(usedTokens) && valid(maxTokens) && maxTokens > 0;
  const percentage = known ? Math.round(usedTokens / maxTokens * 100) : undefined;
  const cached = usage?.cachedInputTokens;
  const reasoning = usage?.reasoningTokens;
  const input = usage?.inputTokens;
  const output = usage?.outputTokens;
  // Cached input is a subset of input; reasoning is a subset of output. Optional separate rates replace their parent rates.
  const buckets = [
    { count: input, rate: pricing?.inputPerMillion, subset: cached, subsetRate: pricing?.cacheReadPerMillion },
    { count: output, rate: pricing?.outputPerMillion, subset: reasoning, subsetRate: pricing?.reasoningPerMillion },
  ];
  let cost: number | undefined;
  if (pricing && buckets.every(bucket => valid(bucket.count) && (bucket.rate === undefined || valid(bucket.rate)) && (bucket.subsetRate === undefined || valid(bucket.subsetRate)) && (bucket.count === 0 || valid(bucket.rate)) && (bucket.subset === undefined || (valid(bucket.subset) && bucket.subset <= bucket.count)))) {
    cost = buckets.reduce((sum, bucket) => {
      const count = bucket.count!; const subset = valid(bucket.subset) && valid(bucket.subsetRate) ? bucket.subset : 0;
      return sum + ((count - subset) * (bucket.rate ?? 0) + subset * (bucket.subsetRate ?? 0)) / 1_000_000;
    }, 0);
    if (!Number.isFinite(cost)) cost = undefined;
  }
  const money = cost === undefined ? "Unavailable" : `${cost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${pricing?.currency?.trim() || "USD"}`;
  const root = rs(["rs-context-usage", className], styles.root);
  const body = rs(["rs-context-usage-body"], styles.body);
  const metadata = rs(["rs-context-usage-metadata"], styles.metadata);
  const list = rs(["rs-context-usage-list"], styles.list);
  const row = rs(["rs-context-usage-row"], styles.row);
  const value = rs(["rs-context-usage-value"], styles.value);
  const stats = [{ label: "Input tokens", value: amount(input) }, { label: "Output tokens", value: amount(output) }, { label: "Reasoning tokens", value: amount(reasoning) }, { label: "Cached input tokens", value: amount(cached) }];
  return <Collapsible {...props} ref={ref} title={`${label}${percentage === undefined ? "" : ` · ${percentage}%`}`} defaultOpen={defaultOpen} className={root.className} style={{ ...root.style, ...style }}>
    <div {...body}>{model && <p {...metadata}>{model}</p>}{known ? <Progress value={usedTokens} max={maxTokens} label={`${amount(usedTokens)} of ${amount(maxTokens)} tokens`} /> : <p {...metadata}>Context limit unavailable.</p>}
      {known && usedTokens > maxTokens && <p {...metadata}>The supplied usage exceeds this context limit.</p>}
      {usage && <dl {...list}>{stats.map(item => <div {...row} key={item.label}><dt>{item.label}</dt><dd {...value}>{item.value}</dd></div>)}</dl>}
      {pricing && <div {...row}><span {...metadata}>Estimated cost from supplied rates</span><span {...value}>{money}</span></div>}
    </div>
  </Collapsible>;
});
