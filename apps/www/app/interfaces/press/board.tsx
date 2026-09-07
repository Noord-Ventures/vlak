"use client";

import * as React from "react";
import { Badge, Button, Card, Icon, Input, Select, Textarea, ToggleGroup } from "@noorddev/vlak-react";

const jobs = [
  { id: "14", name: "Autumn posters", client: "Kunsthuis Alkmaar", city: "Alkmaar", stage: "On press", due: "2026-09-11", dueLabel: "11 Sep", quantity: 200, format: "A2 / 170 gsm uncoated", brief: "Two hundred posters for the autumn programme. Check the crop marks and keep the supplied warm-black ink profile.", next: "Collection booked for Friday at 16:00.", initials: "KA" },
  { id: "b", name: "Exhibition guide", client: "Atelier Delft", city: "Delft", stage: "Proof", due: "2026-09-10", dueLabel: "10 Sep", quantity: 300, format: "A5 / 16 pages / folded", brief: "A compact exhibition guide. Check the venue address and opening times against the supplied copy before the print run.", next: "Client proof review is due Thursday at 15:00.", initials: "AD" },
  { id: "lock", name: "Winter programme", client: "Studio Utrecht", city: "Utrecht", stage: "Brief", due: "2026-09-23", dueLabel: "23 Sep", quantity: 500, format: "A4 / 24 pages / stitched", brief: "Programme design and a matching poster series. Keep the supplied event hierarchy consistent across print and digital layouts.", next: "Waiting for the final event schedule.", initials: "SU" },
  { id: "25", name: "Gallery invitations", client: "Galerie West", city: "Haarlem", stage: "Ready", due: "2026-09-04", dueLabel: "04 Sep", quantity: 120, format: "A6 / 300 gsm card", brief: "One hundred and twenty opening invitations, printed front and back. The supplied proof and paper stock have been recorded.", next: "Packed for collection in the sample record.", initials: "GW" },
];
const invoices = [
  { id: "11", name: "Autumn production", client: "Kunsthuis Alkmaar", due: "2026-09-11", dueLabel: "11 Sep", total: 680, state: "Open", job: "14", lines: [{ label: "Print production", amount: 520 }, { label: "Finishing and packing", amount: 160 }] },
  { id: "09", name: "September invoice", client: "Atelier Delft", due: "2026-09-14", dueLabel: "14 Sep", total: 2400, state: "Open", job: "b", lines: [{ label: "Design and typesetting", amount: 1500 }, { label: "Print production", amount: 900 }] },
  { id: "08", name: "Gallery invitation run", client: "Galerie West", due: "2026-09-04", dueLabel: "04 Sep", total: 420, state: "Paid", job: "25", lines: [{ label: "Invitation production", amount: 420 }] },
];
const periods = {
  week: { label: "07–13 Sep 2026", from: "2026-09-07", to: "2026-09-13", samples: [12, 18, 15, 26, 24, 11, 9], labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
  month: { label: "01–30 Sep 2026", from: "2026-09-01", to: "2026-09-30", samples: [28, 34, 31, 42, 38, 41], labels: ["01–05", "06–10", "11–15", "16–20", "21–25", "26–30"] },
};
type Page = "overview" | "jobs" | "invoices";
type Detail = { kind: "job" | "invoice"; id: string };
const money = (amount: number) => new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
const tabs = [{ id: "overview", label: "Overview", icon: "layout" }, { id: "jobs", label: "Jobs", icon: "printer" }, { id: "invoices", label: "Invoices", icon: "receipt" }] as const;

export function Board() {
  const [page, setPage] = React.useState<Page>("overview");
  const [range, setRange] = React.useState<keyof typeof periods>("week");
  const [query, setQuery] = React.useState("");
  const [stage, setStage] = React.useState("all");
  const [detail, setDetail] = React.useState<Detail | null>(null);
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const [reviews, setReviews] = React.useState<Record<string, string>>({});
  const [notice, setNotice] = React.useState("");
  const heading = React.useRef<HTMLHeadingElement>(null);
  const detailHeading = React.useRef<HTMLHeadingElement>(null);
  const triggers = React.useRef(new Map<string, HTMLButtonElement>());
  const period = periods[range];
  const inPeriod = (due: string) => due >= period.from && due <= period.to;
  const periodJobs = jobs.filter(job => inPeriod(job.due));
  const periodInvoices = invoices.filter(invoice => inPeriod(invoice.due));
  const visibleJobs = periodJobs.filter(job => (stage === "all" || job.stage === stage) && `${job.name} ${job.client}`.toLowerCase().includes(query.trim().toLowerCase()));
  const selectedJob = detail?.kind === "job" ? jobs.find(job => job.id === detail.id) : undefined;
  const selectedInvoice = detail?.kind === "invoice" ? invoices.find(invoice => invoice.id === detail.id) : undefined;
  const record = selectedJob ?? selectedInvoice;
  const key = detail ? `${detail.kind}:${detail.id}` : "";
  const reviewed = Object.hasOwn(reviews, key);
  const needsReview = periodJobs.filter(job => (job.stage === "Proof" || job.stage === "Brief") && !Object.hasOwn(reviews, `job:${job.id}`));
  const openBalance = periodInvoices.filter(invoice => invoice.state === "Open").reduce((sum, invoice) => sum + invoice.total, 0);

  function open(next: Detail) {
    setDetail(next);
    requestAnimationFrame(() => detailHeading.current?.focus({ preventScroll: true }));
  }
  function close() {
    const previous = detail;
    setDetail(null);
    requestAnimationFrame(() => { const target = previous ? triggers.current.get(`${previous.kind}:${previous.id}`) : undefined; (target ?? heading.current)?.focus({ preventScroll: true }); });
  }
  function navigate(next: Page) { setPage(next); setDetail(null); }
  function markReviewed() {
    if (!detail || !record) return;
    if (reviewed) {
      setReviews(current => { const next = { ...current }; delete next[key]; return next; });
      setNotice(`${record.name}: local review removed.`);
    } else {
      setReviews(current => ({ ...current, [key]: notes[key] ?? "" }));
      setNotice(`${record.name}: review recorded in this tab.`);
    }
  }
  const jobRow = (job: (typeof jobs)[number]) => <Button key={job.id} variant="ghost" className="pd-job" aria-pressed={detail?.kind === "job" && detail.id === job.id} onClick={() => open({ kind: "job", id: job.id })} ref={node => { if (node) triggers.current.set(`job:${job.id}`, node); else triggers.current.delete(`job:${job.id}`); }}>
    <span className="pd-monogram" aria-hidden="true">{job.initials}</span><span className="pd-job-title"><strong>{job.name}</strong><small>{job.client}</small></span><span className="pd-job-state">{Object.hasOwn(reviews, `job:${job.id}`) ? <><Icon name="check" size={12} />Reviewed</> : job.stage}</span><span className="pd-job-date">{job.dueLabel}<Icon name="chevron-right" size={16} /></span>
  </Button>;

  return <div className="pd-frame"><section className="pd" data-page={page} data-detail={Boolean(detail)} aria-label="Print production desk">
    <header className="pd-header"><div className="pd-brand"><Icon name="printer" size={24} /><div><strong>Studio Noord</strong><span>Production desk / sample records</span></div></div><span className="pd-header-context"><span />Local workspace</span><span className="pd-header-date">September 2026</span></header>
    <div className="pd-body">
      <aside className="pd-rail"><div className="pd-rail-label">Workspace</div><nav aria-label="Production navigation">{tabs.map(tab => <Button key={tab.id} variant="ghost" className="pd-nav-item" aria-current={page === tab.id ? "page" : undefined} onClick={() => navigate(tab.id)}><Icon name={tab.icon} size={16} /><span>{tab.label}</span>{tab.id === "jobs" && <small>{periodJobs.length}</small>}</Button>)}</nav><div className="pd-rail-note"><Icon name="file-text" size={16} /><strong>September plan</strong><p>Due dates filter the work shown in each view.</p><span>{period.label}</span></div><div className="pd-rail-foot"><span className="pd-avatar">SN</span><span>Studio team<small>Local example</small></span></div></aside>
      <section className="pd-main" aria-label="Production work">
        <div className="pd-view-head"><div><span className="pd-eyebrow">{page === "overview" ? "The production floor" : page === "jobs" ? "Work in progress" : "Accounts"}</span><h2 ref={heading} tabIndex={-1}>{tabs.find(tab => tab.id === page)!.label}</h2></div><ToggleGroup className="pd-range" aria-label="Production range" value={range} onValueChange={value => { setRange(value as keyof typeof periods); setDetail(null); }} options={[{ value: "week", label: "Week" }, { value: "month", label: "Month" }]} /></div>
        <div className="pd-period"><Icon name="calendar" size={12} /><span>{period.label}</span><span>{page === "invoices" ? "Invoice due dates" : "Job due dates"}</span></div>
        <div className="pd-content">
          {page === "overview" ? <>
            <div className="pd-metrics">{[{ label: "Sheets recorded", value: period.samples.reduce((sum, value) => sum + value, 0), icon: "layers" }, { label: "Active jobs", value: periodJobs.length, icon: "printer" }, { label: "Needs review", value: needsReview.length, icon: "eye" }].map(metric => <Card className="pd-metric" key={metric.label}><p><Icon name={metric.icon as "layers" | "printer" | "eye"} size={16} />{metric.label}</p><strong>{metric.value}</strong><span>{metric.label === "Sheets recorded" ? "Supplied production totals" : metric.label === "Active jobs" ? "Due in the selected period" : "Proofs and briefs to check"}</span></Card>)}</div>
            <div className="pd-chart-panel"><div className="pd-section-head"><h3>Recorded output</h3><span>{range === "week" ? "Daily samples" : "Five-day totals"}</span></div><div className="pd-chart" role="img" aria-label={`${period.label}, sheets recorded: ${period.samples.map((value, index) => `${period.labels[index]} ${value}`).join(", ")}`}>{period.samples.map((value, index) => <div key={period.labels[index]} style={{ ["--pd-bar" as string]: `${value / Math.max(...period.samples) * 100}%` }}><span>{value}</span><i /><small>{period.labels[index]}</small></div>)}</div></div>
            <div className="pd-section-head"><h3>Production queue</h3><Button size="sm" variant="ghost" onClick={() => navigate("jobs")}>All jobs<Icon name="arrow-right" size={16} /></Button></div><div className="pd-job-list">{periodJobs.map(jobRow)}</div>
          </> : page === "jobs" ? <>
            <div className="pd-filters"><Input plain aria-label="Search jobs" placeholder="Search jobs or clients" value={query} onChange={event => setQuery(event.target.value)} /><Select aria-label="Job stage" fullWidth value={stage} onValueChange={setStage} options={[{ value: "all", label: "All stages" }, ...["Brief", "Proof", "On press", "Ready"].map(value => ({ value, label: value }))]} /></div>
            <div className="pd-section-head"><h3>{visibleJobs.length} {visibleJobs.length === 1 ? "job" : "jobs"}</h3><span>By supplied due date</span></div><div className="pd-job-list">{visibleJobs.map(jobRow)}</div>{!visibleJobs.length && <Card className="pd-empty"><Icon name="search" size={24} /><h3>No matching jobs</h3><p>Try another stage, search term, or date range.</p><Button variant="ghost" onClick={() => { setQuery(""); setStage("all"); }}>Clear search and stage</Button></Card>}
          </> : <>
            <Card className="pd-balance"><span className="pd-eyebrow">Open balance in this period</span><strong>{money(openBalance)}</strong><p>Supplied invoice totals. Payment status is part of the sample record.</p></Card>
            <div className="pd-section-head"><h3>Invoice register</h3><span>{periodInvoices.length} records</span></div><div className="pd-invoices">{periodInvoices.map(invoice => <Button key={invoice.id} variant="ghost" className="pd-invoice" aria-pressed={detail?.kind === "invoice" && detail.id === invoice.id} onClick={() => open({ kind: "invoice", id: invoice.id })} ref={node => { if (node) triggers.current.set(`invoice:${invoice.id}`, node); else triggers.current.delete(`invoice:${invoice.id}`); }}><Icon name="receipt" size={24} /><span><strong>{invoice.name}</strong><small>{invoice.client} · Due {invoice.dueLabel}</small></span><span><strong>{money(invoice.total)}</strong><small>{Object.hasOwn(reviews, `invoice:${invoice.id}`) ? "Reviewed locally" : invoice.state}</small></span><Icon name="chevron-right" size={16} /></Button>)}</div>
          </>}
        </div>
      </section>
      {detail && record && <section className="pd-detail" aria-label="Selected production record"><div className="pd-detail-head"><Button variant="ghost" aria-label="Back to work" onClick={close}><Icon name="arrow-left" size={16} /></Button><span>{detail.kind === "job" ? "Job" : "Invoice"} / {detail.id.padStart(2, "0")}</span></div><div className="pd-detail-scroll"><span className="pd-eyebrow">{record.client}</span><h2 ref={detailHeading} tabIndex={-1}>{record.name}</h2><Badge>{selectedJob?.stage ?? selectedInvoice?.state}</Badge>{selectedJob ? <><p className="pd-detail-lead">{selectedJob.next}</p><Card className="pd-brief"><h3>Production brief</h3><p>{selectedJob.brief}</p></Card><dl className="pd-facts"><div><dt>Due</dt><dd>{selectedJob.dueLabel} 2026</dd></div><div><dt>Format</dt><dd>{selectedJob.format}</dd></div><div><dt>Quantity</dt><dd>{selectedJob.quantity} copies</dd></div><div><dt>Location</dt><dd>{selectedJob.city}</dd></div></dl></> : selectedInvoice && <><p className="pd-detail-lead">Due {selectedInvoice.dueLabel} 2026. The recorded status is {selectedInvoice.state.toLowerCase()}.</p><div className="pd-invoice-lines">{selectedInvoice.lines.map(line => <div key={line.label}><span>{line.label}</span><strong>{money(line.amount)}</strong></div>)}<div className="pd-invoice-total"><span>Supplied total</span><strong>{money(selectedInvoice.total)}</strong></div></div><p className="pd-copy">These supplied amounts are illustrative. Local review does not change the invoice's payment status.</p><Button variant="ghost" onClick={() => { setRange("month"); setPage("jobs"); setQuery(""); setStage("all"); open({ kind: "job", id: selectedInvoice.job }); }}>Open linked job<Icon name="arrow-right" size={16} /></Button></>}
        <Textarea label="Review note" placeholder="Add a note for this local record" value={notes[key] ?? ""} onChange={event => setNotes(current => ({ ...current, [key]: event.target.value }))} rows={3} /><p className="pd-copy">{reviewed ? `Recorded note: ${reviews[key] || "No note supplied."}` : "Review notes stay in this tab. No production or payment action is sent."}</p></div><div className="pd-detail-action"><span>{reviewed ? "Reviewed locally" : "Ready for review"}</span><Button variant={reviewed ? "ghost" : "primary"} onClick={markReviewed}><Icon name="check" size={16} />{reviewed ? "Undo review" : "Mark reviewed"}</Button></div></section>}
    </div>
    <footer className="pd-footer"><span><Icon name="terminal" size={12} />Local records · no production connection</span><span>{Object.keys(reviews).length} reviewed in this tab</span></footer>
    <nav className="pd-mobile-nav" aria-label="Production sections">{tabs.map(tab => <Button key={tab.id} variant="ghost" aria-current={page === tab.id ? "page" : undefined} onClick={() => navigate(tab.id)}><Icon name={tab.icon} size={16} /><span>{tab.label}</span></Button>)}</nav>
    <span className="pd-announcement" role="status">{notice}</span>
  </section></div>;
}
