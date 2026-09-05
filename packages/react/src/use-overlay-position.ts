"use client";

import * as React from "react";

/** Keep lightweight overlays inside the visual viewport. The native top layer avoids clipping. */
export function useOverlayPosition(
  open: boolean,
  panel: React.RefObject<HTMLElement | null>,
  anchor: React.RefObject<HTMLElement | null>,
  point?: { x: number; y: number } | null,
  placement: "bottom" | "inline-end" = "bottom",
) {
  const [position, setPosition] = React.useState<React.CSSProperties>({ visibility: "hidden" });
  React.useLayoutEffect(() => {
    const element = panel.current;
    if (!open || !element) return;
    const native = typeof element.showPopover === "function";
    if (native) {
      element.setAttribute("popover", "manual");
      if (!element.matches(":popover-open")) element.showPopover();
    }
    const place = () => {
      const viewport = window.visualViewport;
      const leftEdge = (viewport?.offsetLeft ?? 0) + 8;
      const topEdge = (viewport?.offsetTop ?? 0) + 8;
      const viewportWidth = viewport?.width ?? window.innerWidth;
      const viewportHeight = viewport?.height ?? window.innerHeight;
      const rightEdge = leftEdge + viewportWidth - 16;
      const bottomEdge = topEdge + viewportHeight - 16;
      const target = anchor.current?.getBoundingClientRect();
      const paint = getComputedStyle(element);
      const borderX = (Number.parseFloat(paint.borderLeftWidth) || 0) + (Number.parseFloat(paint.borderRightWidth) || 0);
      const borderY = (Number.parseFloat(paint.borderTopWidth) || 0) + (Number.parseFloat(paint.borderBottomWidth) || 0);
      const width = Math.min(Math.max(element.scrollWidth + borderX, target?.width ?? 0), viewportWidth - 16);
      const height = Math.min(element.scrollHeight + borderY, viewportHeight - 16);
      let left = point?.x ?? target?.left ?? leftEdge;
      let top = point?.y ?? (target ? target.bottom + 6 : topEdge);
      if (placement === "inline-end" && target) {
        const rtl = getComputedStyle(anchor.current!).direction === "rtl";
        left = rtl ? target.left - width - 4 : target.right + 4;
        if (left + width > rightEdge) left = target.left - width - 4;
        if (left < leftEdge) left = target.right + 4;
        top = target.top;
      }
      if (top + height > bottomEdge) {
        top = placement === "inline-end" ? bottomEdge - height : point ? point.y - height : target ? target.top - height - 6 : bottomEdge - height;
      }
      left = Math.max(leftEdge, Math.min(left, rightEdge - width));
      top = Math.max(topEdge, Math.min(top, bottomEdge - height));
      const next: React.CSSProperties = {
        position: "fixed", inset: "auto", left, top, margin: 0,
        minWidth: Math.min(target?.width ?? 0, viewportWidth - 16),
        maxWidth: viewportWidth - 16, maxHeight: viewportHeight - 16,
        width, overflow: "auto", visibility: "visible",
      };
      setPosition((previous) => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
    };
    place();
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(place);
    observer?.observe(element);
    if (anchor.current) observer?.observe(anchor.current);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    window.visualViewport?.addEventListener("resize", place);
    window.visualViewport?.addEventListener("scroll", place);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      window.visualViewport?.removeEventListener("resize", place);
      window.visualViewport?.removeEventListener("scroll", place);
    };
  }, [open, panel, anchor, point?.x, point?.y, placement]);
  return position;
}
