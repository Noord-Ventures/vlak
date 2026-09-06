"use client";

import * as React from "react";
import { Button, Card, Icon, ToggleGroup } from "@noorddev/vlak-react";

type Job = { id: string; name: string; city: string; weeks: number; state: string; note: string; sheet: string };
type Props = {
  range: "week" | "month";
  onRangeChange: (range: "week" | "month") => void;
  data: { sheets: number; proofs: number; press: number; series: number[] };
  jobs: Job[];
};

export function MobileDashboard({ range, onRangeChange, data, jobs }: Props) {
  const [tab, setTab] = React.useState("overview");
  const [detail, setDetail] = React.useState<Job | null>(null);
  const [reviewed, setReviewed] = React.useState<string[]>([]);
  const heading = React.useRef<HTMLHeadingElement>(null);
  const jobButtons = React.useRef(new Map<string, HTMLButtonElement>());
  const visible = tab === "invoices" ? jobs.filter((job) => job.state === "Invoice") : jobs;
  function open(job: Job) {
    setDetail(job);
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }
  function back() {
    setDetail(null);
    requestAnimationFrame(() => { if (detail) jobButtons.current.get(detail.id)?.focus({ preventScroll: true }); });
  }
  function row(job: Job) {
    return <button ref={(element) => { if (element) jobButtons.current.set(job.id, element); else jobButtons.current.delete(job.id); }} className="sc-dash-mobile-job" key={job.id} type="button" onClick={() => open(job)}><span><strong>{job.name}</strong><span>{job.city} · {job.weeks} weeks</span></span><span className="sc-dash-mobile-state">{job.state}<Icon name="chevron-right" size={16} /></span></button>;
  }
  return <section className="sc-dash-mobile" aria-label="Mobile production workspace" data-detail={Boolean(detail)}>
    <header className="sc-dash-mobile-header">
      {detail ? <Button variant="ghost" size="sm" onClick={back}><Icon name="arrow-left" size={16} />Back</Button> : <span className="sc-dash-mobile-workspace"><Icon name="printer" size={16} />Production</span>}
      <span>{detail ? "Job details" : tab === "overview" ? "Overview" : tab === "jobs" ? "Jobs" : "Invoices"}</span>
    </header>
    <div className="sc-dash-mobile-scroll">
      {detail ? <div className="sc-dash-mobile-detail">
        <p className="sc-dash-mobile-eyebrow">{detail.state} · {detail.city}</p>
        <h2 ref={heading} tabIndex={-1}>{detail.name}</h2>
        <p className="sc-dash-mobile-lead">{detail.note}</p>
        <Card className="sc-dash-mobile-brief"><h3>Production brief</h3><p>{detail.sheet}</p></Card>
        <dl className="sc-dash-mobile-facts"><div><dt>Location</dt><dd>{detail.city}</dd></div><div><dt>Lead time</dt><dd>{detail.weeks} weeks</dd></div><div><dt>Status</dt><dd>{detail.state}</dd></div></dl>
        <div className="sc-dash-mobile-review"><p role="status">{reviewed.includes(detail.id) ? "Review noted for this demo." : "Check the brief before the next production step."}</p><Button variant={reviewed.includes(detail.id) ? "ghost" : "primary"} onClick={() => setReviewed((current) => current.includes(detail.id) ? current.filter((id) => id !== detail.id) : [...current, detail.id])}><Icon name="check" size={16} />{reviewed.includes(detail.id) ? "Undo review" : "Mark reviewed"}</Button></div>
      </div> : tab === "overview" ? <>
        <div className="sc-dash-mobile-intro"><p className="sc-dash-mobile-eyebrow">Production at a glance</p><h2>Keep the floor moving</h2><ToggleGroup aria-label="Production range" value={range} onValueChange={(value) => onRangeChange(value as "week" | "month")} options={[{ value: "week", label: "This week" }, { value: "month", label: "This month" }]} /></div>
        <Card className="sc-dash-mobile-output"><span>Sheets printed</span><strong>{data.sheets}</strong><div className="sc-dash-mobile-bars" role="img" aria-label={`Daily output for this ${range}`} >{data.series.map((value, index) => <i key={index} style={{ height: `${(value / Math.max(...data.series)) * 100}%` }} />)}</div><span>{range === "week" ? "Monday to Sunday" : "Last seven production days"}</span></Card>
        <div className="sc-dash-mobile-metrics"><Card><span>Proofs to review</span><strong>{data.proofs}</strong></Card><Card><span>Jobs on press</span><strong>{data.press}</strong></Card></div>
        <div className="sc-dash-mobile-section"><h3>Needs attention</h3><span>2 jobs</span></div>
        {jobs.filter((job) => job.state === "Proof" || job.state === "Brief").map(row)}
        <div className="sc-dash-mobile-more"><Button variant="ghost" onClick={() => setTab("jobs")}>View all jobs<Icon name="arrow-right" size={16} /></Button></div>
      </> : <>
        <div className="sc-dash-mobile-intro"><p className="sc-dash-mobile-eyebrow">{tab === "invoices" ? "Payments" : "Production queue"}</p><h2>{tab === "invoices" ? "Open invoices" : "All jobs"}</h2><p>{tab === "invoices" ? "Review what is due and open the invoice details." : "Choose a job to read its brief and current status."}</p></div>
        {visible.map(row)}
      </>}
    </div>
    <nav className="sc-dash-mobile-nav" aria-label="Production sections">{[{ id: "overview", label: "Overview", icon: "layout" as const }, { id: "jobs", label: "Jobs", icon: "list" as const }, { id: "invoices", label: "Invoices", icon: "receipt" as const }].map((item) => <Button key={item.id} variant="ghost" aria-current={tab === item.id ? "page" : undefined} onClick={() => { setTab(item.id); setDetail(null); }}><Icon name={item.icon} size={16} /><span>{item.label}</span></Button>)}</nav>
  </section>;
}
