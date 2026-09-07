import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { Icon, iconGroups, iconNames, resolveIcon } from "../src/components/icon";

const transport = ["truck", "car", "van", "bicycle"] as const;

describe("Transportation marks", () => {
  it("exposes four distinct public figures in the catalog", () => {
    expect(iconGroups.find(group => group.title === "Transportation")?.names).toEqual(transport);
    for (const name of transport) {
      expect(iconNames.filter(mark => mark === name)).toHaveLength(1);
      expect(resolveIcon(name)).toEqual({ mark: name });
    }
    const { container } = render(transport.map(name => <Icon key={name} name={name} />));
    const figures = [...container.querySelectorAll("svg")].map(svg => [...svg.children].map(child => child.outerHTML).join(""));
    expect(new Set(figures).size).toBe(4);
  });

  it("keeps a shared wheel baseline and hairline side profile at every supported size", () => {
    for (const name of transport) for (const size of [12, 16, 24] as const) {
      const { container, unmount } = render(<Icon name={name} size={size} />);
      const wheels = [...container.querySelectorAll("circle")];
      expect(wheels).toHaveLength(2);
      expect(wheels.map(wheel => wheel.getAttribute("cy"))).toEqual(["11", "11"]);
      expect(Number(wheels[0]!.getAttribute("cx"))).toBeLessThan(Number(wheels[1]!.getAttribute("cx")));
      for (const mark of container.querySelectorAll("path,rect,circle")) {
        expect(mark.getAttribute("fill")).toBe("none");
        expect(mark.getAttribute("stroke-width")).toBe("1");
        expect(mark.getAttribute("stroke-linecap")).toBe("butt");
        expect(mark.getAttribute("stroke-linejoin")).toBe("miter");
        expect(mark.getAttribute("vector-effect")).toBe("non-scaling-stroke");
      }
      unmount();
    }
  });

  it("cuts windows or wheel openings through filled figures without painting a background color", () => {
    for (const name of transport) for (const size of [12, 16, 24] as const) {
      const { container, unmount } = render(<Icon name={name} variant="filled" size={size} />);
      expect(container.querySelector("mask")).toBeTruthy();
      expect(container.querySelectorAll('mask path[fill="black"],mask circle[fill="black"]').length).toBeGreaterThan(0);
      expect(container.querySelectorAll('[fill="var(--bg)"],[fill="var(--paper)"]')).toHaveLength(0);
      unmount();
    }
  });

  it("preserves the opt-in accessible image contract", async () => {
    const { container } = render(<div>{transport.map(name => <Icon key={name} name={name} aria-hidden={false} role="img" aria-label={`${name} vehicle type`} />)}</div>);
    for (const name of transport) expect(screen.getByRole("img", { name: `${name} vehicle type` })).toBeTruthy();
    expect(await axe(container)).toHaveNoViolations();
  });
});
