import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { ReferenceTile } from "../../../apps/www/app/inspiration/reference-tile";
import { studies } from "../../../apps/www/app/inspiration/collection";

// The imported Next source preserves JSX; this package's test transform uses the classic runtime for it.
beforeEach(() => vi.stubGlobal("React", React));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const study = studies[0]!;
const caption = { name: "Paul Schuitema", years: "1897–1973", place: "Rotterdam", mark: "Chair no. 35, 1934. A construction kept visible." };

describe("Reference carousel tiles", () => {
  it("keeps the full caption in one flat tile without duplicating the work title", async () => {
    const { container } = render(<ReferenceTile study={study} caption={caption} index={0} selected={false} onSelect={() => {}} />);
    const tile = screen.getByRole("button", { name: "1. Chair no. 35, Paul Schuitema" });
    expect(tile.id).toBe("study-select-0");
    expect(tile.getAttribute("data-work-id")).toBe(study.id);
    for (const content of [caption.name, "1897–1973 · Rotterdam", "Chair no. 35, 1934", study.description, "A construction kept visible.", "Spatial study", study.material, study.kind]) {
      expect(tile.contains(screen.getByText(content))).toBe(true);
    }
    expect(screen.getAllByText("Chair no. 35, 1934")).toHaveLength(1);
    expect(tile.querySelector("h1, h2, h3, p, a, input, button")).toBeNull();
    expect(Number.parseFloat(tile.style.borderRadius)).toBe(0);
    expect(Number.parseFloat(tile.style.borderWidth)).toBe(0);
    for (const text of tile.querySelectorAll<HTMLElement>(".rs-card-label, .reference-tile-copy")) expect(text.style.color).toBe("inherit");
    expect((await axe(container, { rules: { "color-contrast": { enabled: false } } })).violations).toEqual([]);
  });

  it("keeps selection controlled and preserves keyboard activation and focus ids", async () => {
    const onSelect = vi.fn();
    const { rerender } = render(<ReferenceTile study={study} caption={caption} index={3} selected={false} onSelect={onSelect} />);
    const tile = screen.getByRole("button");
    tile.focus();
    await userEvent.keyboard(" ");
    expect(onSelect).toHaveBeenCalledWith(3);
    expect(tile.getAttribute("aria-pressed")).toBe("false");
    rerender(<ReferenceTile study={study} caption={caption} index={3} selected onSelect={onSelect} />);
    expect(tile.getAttribute("aria-pressed")).toBe("true");
    expect(document.activeElement).toBe(tile);
    expect(tile.id).toBe("study-select-3");
    expect(tile.getAttribute("aria-describedby")).toBe("study-details-3");
  });

  it("supports archive works without About captions and preserves poster fallback", () => {
    const archive = studies[1]!;
    const { container, rerender } = render(<ReferenceTile study={archive} index={1} selected={false} onSelect={() => {}} />);
    expect(screen.getByText(archive.artist)).toBeTruthy();
    expect(screen.getByText(`${archive.title}, ${archive.year}`)).toBeTruthy();
    expect(screen.getByText("From the archive")).toBeTruthy();
    expect(container.querySelector(".reference-tile-dates")).toBeNull();
    rerender(<ReferenceTile study={study} index={0} selected={false} onSelect={() => {}} />);
    const image = container.querySelector("img")!;
    expect(image.getAttribute("src")).toBe(study.poster);
    fireEvent.error(image);
    expect(image.getAttribute("src")).toBe(study.image);
  });

  it("does not repeat alternate caption titles or years as a second work label", () => {
    const alternateCaption = { ...caption, mark: "Chair 35, alternate edition. Alternate caption." };
    const { container } = render(<ReferenceTile study={study} caption={alternateCaption} index={0} selected={false} onSelect={() => {}} />);
    expect(screen.getAllByText(`${study.title}, ${study.year}`)).toHaveLength(1);
    expect(container.querySelector(".reference-tile-caption-note")).toBeNull();
  });
});
