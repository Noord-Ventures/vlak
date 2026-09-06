"use client";

import * as React from "react";
import { Button, Icon } from "@noorddev/vlak-react";

type Mode = { value: string; label: string; icon: React.ComponentProps<typeof Icon>["name"] };

/** Focused mobile workspaces keep the same controls and state as the desktop. */
export function MobileStudyNav({ label, value, onValueChange, options }: { label: string; value: string; onValueChange: (value: string) => void; options: Mode[] }) {
  return <div className="cx-mobile-nav" role="navigation" aria-label={label}>
    {options.map((option) => <Button key={option.value} variant="ghost" data-mobile-mode={option.value} aria-pressed={value === option.value} onClick={() => onValueChange(option.value)}><Icon name={option.icon} size={16}/><span>{option.label}</span></Button>)}
  </div>;
}

export function focusMobileMode(root: HTMLElement | null, value: string) {
  requestAnimationFrame(() => {
    const button = root?.querySelector<HTMLButtonElement>(`[data-mobile-mode="${value}"]`);
    if (button?.getClientRects().length) button.focus({ preventScroll: true });
  });
}
