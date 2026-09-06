"use client";

import * as React from "react";
import { Card, Icon, ToggleGroup } from "@noorddev/vlak-react";
import { Brand } from "../mark";
import { MobileDashboard } from "./mobile";
import { interfaceBySlug } from "../catalog";
import { InspectorClose } from "../inspector-close";

const WHAT = interfaceBySlug("press")!.what;

const WEEK = { sheets: 38, proofs: 12, press: 4, series: [12, 18, 15, 26, 24, 11, 9] };
const MONTH = { sheets: 142, proofs: 41, press: 9, series: [28, 34, 31, 42, 38, 22, 19] };

const JOBS = [
  { id: "14", name: "Autumn posters", city: "Alkmaar", weeks: 4, state: "On press", line: "On press · Alkmaar", note: "Printing 200 copies. The first batch passed quality control at 09:00.", sheet: "A2 posters on 170 gsm uncoated stock. Final quantity: 200. Collection booked for Friday at 16:00." },
  { id: "b", name: "Exhibition guide", city: "Delft", weeks: 4, state: "Proof", line: "Proof · Delft", note: "Revised proof sent. Client approval is due Thursday at 15:00.", sheet: "A5 folded programme, 16 pages. Check the venue address and opening times before releasing the print run." },
  { id: "09", name: "September invoice", city: "Haarlem", weeks: 2, state: "Invoice", line: "Invoice · Haarlem", note: "Invoice sent on 1 September. Payment is due within 14 days.", sheet: "Invoice 09 covers design and production for the September programme. Total: €2,400 excluding VAT." },
  { id: "lock", name: "Winter programme", city: "Utrecht", weeks: 3, state: "Brief", line: "Brief · Utrecht", note: "Scope approved. Waiting for the final event schedule to start layouts.", sheet: "Programme design, poster series, and digital assets. First presentation scheduled for next Wednesday." },
];

function Line({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const w = 560;
  const h = 120;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => `${i * step},${h - (v / max) * (h - 16)}`).join(" ");
  return (
    <svg className="sc-dash-chart" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Sheets over the range">
      <polyline fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" points={pts} />
    </svg>
  );
}

export function Board() {
  const [range, setRange] = React.useState<"week" | "month">("week");
  const [page, setPage] = React.useState("overview");
  const [job, setJob] = React.useState("14");
  const [sheet, setSheet] = React.useState(false);
  const [metricFresh, setMetricFresh] = React.useState(false);
  const data = range === "week" ? WEEK : MONTH;
  const selected = JOBS.find((item) => item.id === job) ?? JOBS[0]!;
  const visibleJobs = page === "invoices" ? JOBS.filter((item) => item.state === "Invoice") : JOBS;

  return (
    <section className="if-board sc-dash" data-page={page} aria-label={WHAT} style={{ ["--if-spot" as string]: "#E30613" }}>
      <aside className="sc-dash-rail" aria-label="Floor">
        <div className="sc-dash-brand">
          <Brand slug="press" />
          <p className="sc-dash-voice">Production overview</p>
        </div>
        <p className="sc-dash-label if-ico-row">
          <Icon name="layout" size={12} />
          Floor
        </p>
        {[
          { id: "overview", label: "Overview", meta: "Today", icon: "layout" as const },
          { id: "jobs", label: "Jobs", meta: "4", icon: "list" as const },
          { id: "invoices", label: "Invoices", meta: "1", icon: "receipt" as const },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            className="sc-dash-nav"
            aria-current={page === item.id}
            onClick={() => {
              setPage(item.id);
              setSheet(false);
            }}
          >
            <span className="if-ico-row">
              <Icon name={item.icon} size={16} />
              {item.label}
            </span>
            <em>{item.meta}</em>
          </button>
        ))}
      </aside>

      <section className="sc-dash-main">
        <div className="sc-dash-head">
          <h2 className="if-ico-row">
            <Icon name={page === "overview" ? "layout" : page === "jobs" ? "list" : "receipt"} size={16} />
            {page === "overview" ? "Overview" : page === "jobs" ? "Jobs" : "Invoices"}
          </h2>
          <ToggleGroup
            className="sc-dash-range"
            aria-label="Range"
            value={range}
            options={[
              { value: "week", label: <><Icon name="calendar" size={12} />Week</> },
              { value: "month", label: <><Icon name="history" size={12} />Month</> },
            ]}
            onValueChange={(value) => {
              setRange(value as "week" | "month");
              setMetricFresh(true);
            }}
          />
        </div>

        <div className="sc-dash-metrics">
          <Card className="sc-dash-metric">
            <p className="if-ico-row"><Icon name="layers" size={12} /> <span className="sc-dash-metric-long">Sheets this {range}</span><span className="sc-dash-metric-short">Sheets</span></p>
            <strong key={range} className={metricFresh ? "sc-fresh" : undefined}>{data.sheets}</strong>
          </Card>
          <Card className="sc-dash-metric">
            <p className="if-ico-row"><Icon name="file-text" size={12} /> Proofs</p>
            <strong key={range} className={metricFresh ? "sc-fresh" : undefined}>{data.proofs}</strong>
          </Card>
          <Card className="sc-dash-metric">
            <p className="if-ico-row"><Icon name="printer" size={12} /> On press</p>
            <strong key={range} className={`sc-dash-spot${metricFresh ? " sc-fresh" : ""}`}>{data.press}</strong>
          </Card>
        </div>

        <div className="sc-dash-split">
          <Card className="sc-dash-card">
            <h2 className="if-ico-row"><Icon name="trending-up" size={12} /> Throughput</h2>
            <Line values={data.series} />
          </Card>
          <Card className="sc-dash-card sc-dash-jobs">
            <h2 className="if-ico-row">
              <Icon name={page === "invoices" ? "receipt" : "list"} size={12} />
              {page === "invoices" ? "Open invoices" : "Jobs"}
            </h2>
            {visibleJobs.map((item) => (
              <button
                key={item.id}
                type="button"
                className="sc-dash-job"
                aria-current={job === item.id}
                onClick={() => {
                  setJob(item.id);
                  setSheet(true);
                }}
              >
                <span className="if-ico-row">
                  <Icon
                    name={item.state === "On press" ? "printer" : item.state === "Proof" ? "eye" : item.state === "Invoice" ? "receipt" : "edit"}
                    size={16}
                  />
                  <span>
                    {item.name}
                    <br />
                    <small className="sc-dash-job-long">{item.city} · {item.weeks} weeks</small>
                    <small className="sc-dash-job-short">{item.line}</small>
                  </span>
                </span>
                <span>{item.state}</span>
              </button>
            ))}
            <div key={job} className="sc-dash-detail sc-fresh">
              <p>{selected.note}</p>
              <button type="button" onClick={() => setSheet(true)}>
                <Icon name="file" size={12} />
                Open sheet
              </button>
            </div>
          </Card>
        </div>
      </section>

      <nav className="if-thumb" aria-label={WHAT}>
        {[
          { id: "overview", label: "Overview", icon: "layout" as const },
          { id: "jobs", label: "Jobs", icon: "list" as const },
          { id: "invoices", label: "Invoices", icon: "receipt" as const },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={page === item.id}
            onClick={() => {
              setPage(item.id);
              setSheet(false);
            }}
          >
            <Icon name={item.icon} size={16} />
            {item.label}
          </button>
        ))}
      </nav>

      <aside className={`if-inspect${sheet ? " is-open" : ""}`} aria-label="Sheet">
        {sheet ? <InspectorClose onClick={() => setSheet(false)} /> : null}
        <div className="sc-dash-inspect">
          {sheet ? (
            <div key={job} className="sc-fresh">
              <h2 className="if-ico-row">
                <Icon name="file-text" size={16} />
                {selected.name}
              </h2>
              <p>{selected.sheet}</p>
              <p className="if-ico-row">
                <Icon name="map-pin" size={12} />
                {selected.city}
              </p>
              <p className="if-ico-row">
                <Icon name="calendar" size={12} />
                {selected.weeks} weeks
              </p>
              <p className="if-ico-row">
                <Icon
                  name={selected.state === "On press" ? "printer" : selected.state === "Proof" ? "eye" : selected.state === "Invoice" ? "receipt" : "edit"}
                  size={12}
                />
                {selected.state}
              </p>
            </div>
          ) : null}
        </div>
      </aside>
      <MobileDashboard range={range} onRangeChange={(value) => setRange(value)} data={data} jobs={JOBS} />
    </section>
  );
}
