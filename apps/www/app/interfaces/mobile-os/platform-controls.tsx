"use client";

import * as React from "react";

type SwitchProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

/** Native input behavior, with independent UIKit and Material track geometry. */
export const PlatformSwitch = React.forwardRef<HTMLInputElement, SwitchProps>(function PlatformSwitch({ checked, onCheckedChange, className = "", ...props }, ref) {
  return <label className={`mo-native-switch ${className}`}>
    <input {...props} ref={ref} type="checkbox" role="switch" checked={checked} aria-checked={checked} onChange={event => onCheckedChange(event.target.checked)} />
    <span className="mo-native-switch-track" aria-hidden="true"><span className="mo-native-switch-thumb" /></span>
  </label>;
});

type RangeProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> & {
  value: number;
  min?: number;
  max?: number;
  onValueChange: (value: number) => void;
  orientation?: "horizontal" | "vertical";
};

/** Vertical controls use native vertical range geometry, never a rotated hitbox. */
export const PlatformRange = React.forwardRef<HTMLInputElement, RangeProps>(function PlatformRange({ value, min = 0, max = 100, onValueChange, orientation = "horizontal", className = "", style, ...props }, ref) {
  const vertical = orientation === "vertical" || props["aria-orientation"] === "vertical";
  return <input {...props} ref={ref} className={`mo-native-range ${className}`} type="range" value={value} min={min} max={max}
    aria-orientation={vertical ? "vertical" : "horizontal"} data-orientation={vertical ? "vertical" : "horizontal"}
    style={{ "--mo-range-fill": `${Math.max(0, Math.min(100, (value - min) / (max - min || 1) * 100))}%`, ...style } as React.CSSProperties}
    onChange={event => onValueChange(event.target.valueAsNumber)} />;
});
