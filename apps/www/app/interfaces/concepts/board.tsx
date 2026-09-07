"use client";

import * as React from "react";
import { Button, Card, CardBody, CardLabel, CardTitle, Icon } from "@noorddev/vlak-react";
import { AthenaScene } from "./athena-scene";

type FrontierSection = "Models" | "Research" | "Company";
const frontierContent: Record<FrontierSection, [string, string, string][]> = {
  Models: [["Model", "Athena 2", "Reason across research, technical documents, and code."], ["Context", "512k tokens", "Keep source material and working notes in one conversation."], ["Deployment", "Your environment", "A hosted service or a private deployment."]],
  Research: [["System card", "Evaluate first", "Test a model against the questions your work depends on."], ["Method", "Show the evidence", "Inspect references, compare answers, and retain the source material."], ["Scope", "Known limitations", "Model answers still need review, especially when evidence is incomplete."]],
  Company: [["Our work", "Built together", "A fictional research lab studying useful reasoning systems."], ["Focus", "Applied research", "Tools for the people working through difficult, open-ended questions."], ["This example", "A design study", "Explore the page structure, typography, and components with Vlak."]],
};

function Frontier() {
  const [section, setSection] = React.useState<FrontierSection>("Models");
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLElement>(null);
  function reveal(value: FrontierSection) {
    setSection(value);
    setMenuOpen(false);
    requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      if (menuRef.current?.getClientRects().length) contentRef.current?.focus({ preventScroll: true });
    });
  }
  return <div className="cx cx-frontier" data-menu-open={menuOpen} onKeyDown={(event) => { if (event.key === "Escape" && menuOpen) { setMenuOpen(false); menuRef.current?.focus(); } }}>
    <header><b>Athena Labs</b><Button ref={menuRef} className="cx-frontier-menu-toggle" variant="ghost" aria-expanded={menuOpen} aria-controls="cx-company-navigation" aria-label={menuOpen ? "Close company menu" : "Open company menu"} onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? "close" : "menu"} size={16}/></Button><nav id="cx-company-navigation" aria-label="Company sections">{(["Models", "Research", "Company"] as const).map(value => <Button variant="ghost" key={value} aria-pressed={section === value} className={section === value ? "on" : ""} onClick={() => reveal(value)}>{value}<span className="cx-mobile-only" aria-hidden="true">→</span></Button>)}</nav><Button className="cx-frontier-header-action" size="sm" onClick={() => reveal("Models")}>Explore models</Button></header>
    <div className="cx-workspace">
      <div className="cx-frontier-graphic"><AthenaScene /></div>
      <p>Introducing Athena 2</p><h2>Reasoning models for research and engineering.</h2><p className="cx-frontier-intro">Work through complex questions with your documents, data, and code in view.</p><div><Button onClick={() => reveal("Models")}>Explore Athena 2</Button><button type="button" className="cx-text-link" onClick={() => reveal("Research")}>Read the system card <span aria-hidden="true">→</span></button></div>
    </div>
    <section ref={contentRef} tabIndex={-1} aria-label={section}>{frontierContent[section].map(([label, title, body]) => <Card key={label}><CardLabel>{label}</CardLabel><CardTitle>{title}</CardTitle><CardBody>{body}</CardBody></Card>)}</section>
    <footer><span>Athena Labs is a fictional company</span><span>Interface study · Vlak</span></footer>
  </div>;
}

export function ConceptBoard({ kind }: { kind: "frontier" }) {
  return kind === "frontier" ? <Frontier /> : null;
}
