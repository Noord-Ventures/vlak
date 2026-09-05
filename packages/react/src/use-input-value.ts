"use client";

import * as React from "react";

/** Shared state for compound inputs. Native form reset restores uncontrolled defaults. */
export function useInputValue<T, E extends HTMLElement>(
  value: T | undefined,
  defaultValue: T,
  onValueChange?: (value: T) => void,
  onReset?: () => void,
) {
  const [inner, setInner] = React.useState(defaultValue);
  const element = React.useRef<E>(null);
  const controlled = value !== undefined;
  const reset = React.useRef({ controlled, defaultValue, onReset });
  reset.current = { controlled, defaultValue, onReset };
  React.useEffect(() => {
    const node = element.current;
    const form = node && "form" in node ? (node as unknown as HTMLInputElement).form : node?.closest("form");
    if (!form) return;
    const handleReset = (event: Event) => {
      queueMicrotask(() => {
        if (!event.defaultPrevented) {
          if (!reset.current.controlled) setInner(reset.current.defaultValue);
          reset.current.onReset?.();
        }
      });
    };
    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, []);
  const setValue = (next: T) => {
    if (!controlled) setInner(next);
    onValueChange?.(next);
  };
  return [controlled ? value : inner, setValue, element] as const;
}
