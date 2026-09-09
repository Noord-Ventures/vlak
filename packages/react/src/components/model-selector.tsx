"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Combobox } from "./combobox";

export interface ModelOption {
  id: string; name: string; provider?: string; description?: string;
  capabilities?: readonly string[]; contextWindow?: number; priceLabel?: string;
  icon?: React.ReactNode; disabled?: boolean;
}
export interface ModelSelectorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  models: readonly ModelOption[]; value?: string; defaultValue?: string;
  onValueChange?: (modelId: string) => void; label?: string; disabled?: boolean;
}
const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", width: "100%", minWidth: 0, color: vlak.ink },
  label: { fontSize: vlak.controlFs, fontWeight: 500, lineHeight: 1.45 },
  option: { display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 },
  icon: { display: "inline-flex", alignItems: "center", width: "1.25rem", height: "1.25rem", flexShrink: 0 },
  text: { display: "grid", gap: "0.125rem", minWidth: 0 },
  metadata: { fontSize: vlak.controlLabel, color: vlak.gray, lineHeight: 1.45 },
  detail: { display: "grid", gap: "0.5rem", padding: "0.75rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: { default: vlak.divider, [mq.forcedColors]: "CanvasText" }, borderRadius: vlak.radiusSm },
  description: { margin: 0, fontSize: vlak.controlFs, lineHeight: 1.45 },
});

/** Search and select models from an application-supplied catalog, without provider lookups. */
export const ModelSelector = React.forwardRef<HTMLDivElement, ModelSelectorProps>(function ModelSelector({ models, value, defaultValue = "", onValueChange, label = "Model", disabled = false, className, style, ...props }, ref) {
  const [inner, setInner] = React.useState(defaultValue); const current = value ?? inner;
  const selected = models.find(model => model.id === current); const id = React.useId();
  const root = rs(["rs-model-selector", className], styles.root);
  const heading = rs(["rs-model-selector-label"], styles.label);
  const option = rs(["rs-model-selector-option"], styles.option);
  const icon = rs(["rs-model-selector-icon"], styles.icon);
  const text = rs(["rs-model-selector-text"], styles.text);
  const metadata = rs(["rs-model-selector-metadata"], styles.metadata);
  const detail = rs(["rs-model-selector-detail"], styles.detail);
  const description = rs(["rs-model-selector-description"], styles.description);
  return <div ref={ref} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <span {...heading} id={`${id}-label`}>{label}</span>
    <Combobox aria-labelledby={`${id}-label`} value={current} disabled={disabled} placeholder="Search models…" emptyLabel="No models match" onValueChange={next => { if (value === undefined) setInner(next); onValueChange?.(next); }} options={models.map(model => ({ value: model.id, disabled: model.disabled, searchText: [model.name, model.provider, model.description, ...(model.capabilities ?? [])].filter(Boolean).join(" "), label: <span {...option}>{model.icon && <span {...icon} aria-hidden="true">{model.icon}</span>}<span {...text}><span>{model.name}</span><span {...metadata}>{[model.provider, ...(model.capabilities ?? [])].filter(Boolean).join(" · ")}</span></span></span> }))} />
    {selected && <div {...detail}><span {...heading}>{selected.name}</span>{selected.description && <p {...description}>{selected.description}</p>}<span {...metadata}>{[selected.provider, ...(selected.capabilities ?? []), selected.contextWindow != null && Number.isFinite(selected.contextWindow) && selected.contextWindow > 0 ? `${selected.contextWindow.toLocaleString("en-US")} token context` : undefined, selected.priceLabel].filter(Boolean).join(" · ")}</span></div>}
    {(!models.length || (current && !selected)) && <span {...metadata} role="status">{models.length ? "The selected model is unavailable. Choose another model." : "No models supplied."}</span>}
  </div>;
});
