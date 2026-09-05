import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import type { ButtonProps } from "./button";

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

const styles = stylex.create({
  group: {
    boxSizing: "border-box",
    display: {
      default: "inline-flex",
      [mq.phone]: "flex",
    },
    alignItems: "stretch",
    minHeight: `calc(${vlak.hit} + 2 * ${vlak.hairline})`,
    width: {
      default: null,
      [mq.phone]: "100%",
    },
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    borderColor: vlak.divider,
    borderRadius: {
      default: vlak.radiusSm,
      [mq.phone]: vlak.radiusSm,
    },
    backgroundColor: vlak.divider,
    gap: vlak.hairline,
    overflow: "hidden",
  },
});

/** Flush joined actions. One hairline between. Group owns the outer stroke. */
export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { className, style, children, ...props },
  ref,
) {
  const sx = rs(["rs-btn-group", className], styles.group);
  return (
    <div ref={ref} role="group" {...props} className={sx.className} style={{ ...sx.style, ...style }}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<ButtonProps>, { grouped: true })
          : child,
      )}
    </div>
  );
});
