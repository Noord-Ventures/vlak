"use client";

import { Button, Icon, Input } from "@noorddev/vlak-react";
import { useRef } from "react";

/** The iOS search anatomy, backed by a real browser search input. */
export function IOSSearchField({ value, onValueChange, label, placeholder = "Search" }: {
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  placeholder?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  return <div className="mo-ios-search-field">
    <Icon name="search" size={24} />
    <Input ref={input} type="search" className="mo-ios-search" aria-label={label} placeholder={placeholder} value={value} onChange={event => onValueChange(event.target.value)} />
    {value && <Button variant="ghost" className="mo-ios-search-clear" aria-label={`Clear ${label.toLowerCase()}`} onClick={() => { onValueChange(""); input.current?.focus(); }}><Icon name="close" size={16} /></Button>}
  </div>;
}
