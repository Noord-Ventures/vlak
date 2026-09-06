import type { Metadata } from "next";
import Link from "next/link";
import { catalogComponents, healthDataContract, healthWorkflows } from "@noorddev/vlak";
import { CodeBlock } from "@/components/code-block";
import { DocsShell } from "@/components/docs-shell";
import { DOOR } from "../../specimen";

export const metadata: Metadata = {
  title: "Health",
  description: "Vlak components for health, wellness, and medical software. Readings, check-ins, routines, and care workflows with explicit data and action states.",
  alternates: { canonical: `${DOOR}/docs/health/` },
};

const example = `import "@noorddev/vlak-react/css";
import { CheckIn, HealthMetric } from "@noorddev/vlak-react";

<CheckIn
  label="How is your energy today?"
  name="energy"
  options={[
    { value: "low", label: "Low" },
    { value: "steady", label: "Steady" },
    { value: "high", label: "High" },
  ]}
/>

<HealthMetric
  label="Resting heart rate"
  value={64}
  unit="bpm"
  source="Connected wearable"
  dateTime="2026-09-06T06:30:00Z"
  timeLabel="6 September, 08:30 CEST"
/>`;

export default function HealthPage() {
  const count = catalogComponents.filter(component => component.category === "health").length;
  return (
    <DocsShell title="Health" summary={`${count} components for health tracking, daily wellbeing, and care workflows.`}>
      <p className="rs-t-body">
        Build a personal health dashboard, a wellness journal, or a care workspace with the same
        paper, ink, and hairlines as the rest of Vlak. Every component has a live specimen,
        a contextual example, and generated documentation for agents.
      </p>
      <p className="rs-t-body"><Link className="rs-link" href="/components#health">Browse the health collection</Link></p>

      {healthWorkflows.map(workflow => (
        <section key={workflow.title}>
          <h2 className="section-label">{workflow.title}</h2>
          <p className="rs-t-body">{workflow.description}</p>
          <ul className="docs-list">
            {workflow.components.map(name => {
              const component = catalogComponents.find(item => item.name === name)!;
              return <li key={name}><Link className="rs-link" href={`/components/${name}`}>{component.title}</Link>. {component.description}</li>;
            })}
          </ul>
        </section>
      ))}

      <h2 className="section-label">Start with a check-in and a reading</h2>
      <CodeBlock code={example} />
      <p className="rs-t-body">
        The values above are fictional demonstration data. Supply the labels, options, and
        measurement context that belong to your product.
      </p>

      <h2 className="section-label">Data and action contracts</h2>
      {healthDataContract.map(rule => <section key={rule.title}><h3 className="docs-sub">{rule.title}</h3><p className="rs-t-body">{rule.description}</p></section>)}

      <h2 className="section-label">Compose with the wider system</h2>
      <p className="rs-t-body">
        Use <Link className="rs-link" href="/components/number-field">Number field</Link> for
        measurement entry, <Link className="rs-link" href="/components/date-range-picker">Date range picker</Link> for
        reporting periods, and <Link className="rs-link" href="/components/scheduler">Scheduler</Link> for
        booking. <Link className="rs-link" href="/components/message-composer">Message composer</Link> and{" "}
        <Link className="rs-link" href="/components/error-summary">Error summary</Link> support
        care conversations and submissions that need attention.
      </p>
      <p className="rs-t-body">
        Agents can read <a className="rs-link" href="/docs/health.md">this guide as Markdown</a>,
        filter the MCP catalogue by <code className="rs-code">health</code>, or search for an
        individual component through the CLI.
      </p>
    </DocsShell>
  );
}
