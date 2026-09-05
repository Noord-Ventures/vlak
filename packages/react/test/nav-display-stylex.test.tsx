import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/components/icon", () => ({
  Icon: () => null,
}));
import { Breadcrumbs } from "../src/components/breadcrumbs";
import { CrumbBar } from "../src/components/crumb-bar";
import { Tab, TabList, Tabs } from "../src/components/tabs";
import { Pagination } from "../src/components/pagination";
import { Stepper } from "../src/components/stepper";
import { Sidebar, SidebarItem, SidebarNav } from "../src/components/sidebar";
import { NavigationMenu } from "../src/components/navigation-menu";
import { Accordion, AccordionItem } from "../src/components/accordion";
import { Collapsible } from "../src/components/collapsible";
import { Carousel } from "../src/components/carousel";
import { Split } from "../src/components/resizable";
import { Calendar } from "../src/components/calendar";
import { DataTable } from "../src/components/data-table";
import { Toggle, ToggleGroup } from "../src/components/toggle";
import { ThemeToggle } from "../src/components/theme-toggle";
import { Nest, NestInner, concentricInner } from "../src/components/concentric-radius";
import { AspectRatio } from "../src/components/aspect-ratio";

afterEach(cleanup);

describe("StyleX nav/data/display leaves", () => {
  it("keeps tab classes and marks the active tab", () => {
    render(
      <Tabs defaultValue="a">
        <TabList>
          <Tab value="a">One</Tab>
          <Tab value="b">Two</Tab>
        </TabList>
      </Tabs>,
    );
    expect(screen.getByRole("tablist").className).toContain("rs-tabs");
    expect(screen.getByRole("tab", { name: "One" }).className).toContain("rs-tab");
    expect(screen.getByRole("tab", { name: "One" }).className).toContain("rs-tab-active");
    expect(screen.getByRole("tab", { name: "Two" }).className).toContain("rs-tab");
    expect(screen.getByRole("tab", { name: "Two" }).className).not.toContain("rs-tab-active");
  });

  it("keeps breadcrumb trail classes", () => {
    render(<Breadcrumbs items={[{ label: "Studio", href: "/" }, { label: "Vlak" }]} />);
    expect(screen.getByRole("navigation").className).toContain("rs-crumbs");
    expect(screen.getByRole("link", { name: "Studio" }).className).toContain("rs-crumbs-link");
    expect(screen.getByText("Vlak").className).toContain("rs-crumbs-here");
    expect(screen.getByText("/").className).toContain("rs-crumbs-sep");
  });

  it("solidifies the crumb bar on scroll", () => {
    const { container } = render(
      <CrumbBar trail={[{ label: "Vlak", href: "/" }, { label: "Components" }]} />,
    );
    const bar = container.querySelector(".rs-crumb-bar")!;
    expect(bar.className).toContain("rs-crumb-bar");
    expect(bar.className).not.toContain("rs-crumb-bar-scrolled");
    Object.defineProperty(window, "scrollY", { value: 300, configurable: true });
    fireEvent.scroll(window);
    expect(bar.className).toContain("rs-crumb-bar-scrolled");
    expect(screen.getByText("Components").className).toContain("rs-crumbs-here");
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  });

  it("marks the current page", () => {
    render(<Pagination page={5} count={20} />);
    expect(screen.getByRole("navigation").className).toContain("rs-pages");
    expect(screen.getByRole("button", { name: "5" }).className).toContain("rs-page-on");
  });

  it("joins stepper hairlines to the dots", () => {
    const { container } = render(
      <Stepper steps={[{ name: "Brief" }, { name: "Design" }, { name: "Build" }]} current={1} />,
    );
    expect(container.querySelector(".rs-steps")).toBeTruthy();
    const dots = container.querySelectorAll(".rs-step-dot");
    expect(dots[0]?.className).toContain("rs-step-done");
    expect(dots[1]?.className).toContain("rs-step-active");
    const steps = container.querySelectorAll(".rs-step");
    expect(steps[0]?.querySelector(".rs-step-line")).toBeTruthy();
    expect(steps[2]?.querySelector(".rs-step-line")).toBeNull();
  });

  it("keeps sidebar rail classes", () => {
    const { container } = render(
      <Sidebar>
        <SidebarNav>
          <SidebarItem href="/" current>
            Home
          </SidebarItem>
          <SidebarItem href="/work">Work</SidebarItem>
        </SidebarNav>
      </Sidebar>,
    );
    expect(container.querySelector(".rs-sidebar")?.className).toContain("rs-sidebar");
    expect(container.querySelector(".rs-sidebar-nav")?.className).toContain("rs-sidebar-nav");
    expect(screen.getByRole("link", { name: "Home" }).className).toContain("rs-sidebar-item");
  });

  it("styles navigation links on the node", () => {
    render(
      <NavigationMenu
        items={[
          { label: "Work", href: "/work", current: true },
          { label: "About", href: "/about" },
        ]}
      />,
    );
    expect(screen.getByRole("navigation").className).toContain("rs-nav");
    expect(screen.getByRole("link", { name: "Work" }).getAttribute("aria-current")).toBe("page");
  });

  it("renders accordion and collapsible details", () => {
    const { container } = render(
      <Accordion>
        <AccordionItem title="Brief">Copy</AccordionItem>
      </Accordion>,
    );
    expect(container.querySelector(".rs-acc")?.className).toContain("rs-acc");
    expect(container.querySelector(".rs-acc-item")?.className).toContain("rs-acc-item");
    render(<Collapsible title="More">Body</Collapsible>);
    expect(container.ownerDocument.querySelector(".rs-disclosure")?.className).toContain("rs-disclosure");
  });

  it("renders carousel chrome and page buttons", () => {
    const { container } = render(
      <Carousel>
        <div>A</div>
        <div>B</div>
      </Carousel>,
    );
    expect(container.querySelector(".rs-carousel")?.className).toContain("rs-carousel");
    expect(container.querySelector(".rs-carousel-track")?.className).toContain("rs-carousel-track");
    expect(screen.getByRole("button", { name: "Previous" }).className).toContain("rs-page");
  });

  it("renders a split handle", () => {
    const { container } = render(
      <Split>
        <p>A</p>
        <p>B</p>
      </Split>,
    );
    expect(container.querySelector(".rs-split")?.className).toContain("rs-split");
    expect(screen.getByRole("separator").className).toContain("rs-split-handle");
  });

  it("keeps calendar day classes and the accessible day grid", () => {
    const onSelect = vi.fn();
    const { container } = render(<Calendar value={new Date(2026, 8, 3)} onSelect={onSelect} />);
    expect(container.querySelector(".rs-cal")?.className).toContain("rs-cal");
    expect(container.querySelector(".rs-cal-grid")?.className).toContain("rs-cal-grid");
    expect(container.querySelector(".rs-cal-day-selected")?.className).toContain("rs-cal-day");
  });

  it("renders a sortable data table", () => {
    render(
      <DataTable
        columns={[{ key: "name", header: "Name", sortable: true }]}
        rows={[{ name: "Vlak" }, { name: "Studio" }]}
      />,
    );
    expect(document.querySelector(".rs-table")?.className).toContain("rs-table");
    expect(screen.getByRole("button", { name: /Name/ }).className).toContain("rs-datatable-sort");
  });

  it("toggles pressed state", () => {
    render(<Toggle>Bold</Toggle>);
    const btn = screen.getByRole("button", { name: "Bold" });
    expect(btn.className).toContain("rs-toggle");
    expect(btn.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-pressed")).toBe("true");
  });

  it("renders a toggle group", () => {
    render(<ToggleGroup options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} defaultValue="a" />);
    expect(screen.getByRole("group").className).toContain("rs-toggle-group");
    expect(screen.getByRole("button", { name: "A" }).className).toContain("rs-toggle");
    expect(screen.getByRole("button", { name: "A" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("renders the theme toggle mark", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: "Switch to dark scheme" }).className).toContain("rs-theme-toggle");
  });

  it("sets concentric custom properties and does not reassign --rs-out on the inner frame", () => {
    const { container } = render(
      <Nest radius={28} pad={16}>
        <Nest pad={8}>
          <NestInner>Board</NestInner>
        </Nest>
      </Nest>,
    );
    const nests = container.querySelectorAll(".rs-nest");
    expect(nests).toHaveLength(2);
    expect((nests[0] as HTMLElement).style.getPropertyValue("--rs-out")).toBe("28px");
    expect((nests[0] as HTMLElement).style.getPropertyValue("--rs-gap")).toBe("16px");
    expect((nests[1] as HTMLElement).style.getPropertyValue("--rs-out")).toBe("12px");
    const inner = container.querySelector(".rs-nest-in") as HTMLElement;
    expect(inner.style.getPropertyValue("--rs-out")).toBe("");
    expect(inner.textContent).toBe("Board");
    expect(concentricInner(28, 16)).toBe(12);
  });

  it("keeps the aspect-ratio class", () => {
    const { container } = render(<AspectRatio ratio={16 / 9} />);
    expect(container.firstElementChild?.className).toContain("rs-ratio");
  });
});
