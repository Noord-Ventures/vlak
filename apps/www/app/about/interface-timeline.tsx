import { timelineEras } from "./timeline-data";
import { TimelineVignette } from "./timeline-vignettes";
import "./interface-timeline.css";

/** A server-rendered chronology. Native disclosures keep the sources readable without JavaScript. */
export function InterfaceTimeline() {
  const count = timelineEras.reduce((total, era) => total + era.events.length, 0);
  return <section id="interface-lineage" className="interface-lineage" aria-labelledby="lineage-title">
    <header className="lineage-header">
      <div className="lineage-register"><span>Design lineage</span><span>{count} milestones · 6 chapters</span></div>
      <div className="lineage-heading"><h2 id="lineage-title">From the page<br />to the agent</h2><div><p className="lineage-range">1917<span aria-hidden="true">—</span>2026</p><p>A selected history of how we arrange information and act through machines.</p></div></div>
    </header>
    <ol className="lineage-eras" aria-label="Chapters in interface history">
      {timelineEras.map((era, index) => <li className="lineage-era" key={era.id}>
        <div className="lineage-era-meta"><span>{String(index + 1).padStart(2, "0")}</span><span>{era.period}</span></div>
        <div className="lineage-illustration"><TimelineVignette kind={era.kind} /></div>
        <div className="lineage-era-heading"><h3>{era.title}</h3><p>{era.subtitle}</p></div>
        <ol className="lineage-events" aria-label={`${era.title} milestones`}>
          {era.events.map(event => <li key={event.id}>
            <details className="lineage-event" name="interface-history">
              <summary><span className="lineage-year">{event.year}</span><span className="lineage-event-name">{event.title}</span><span className="lineage-expand" aria-hidden="true">+</span></summary>
              <div className="lineage-detail"><p>{event.description}</p><a href={event.source.url} className="rs-link">{event.source.label}<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 9 9 3M3 3h6v6" fill="none" stroke="currentColor" /></svg></a></div>
            </details>
          </li>)}
        </ol>
      </li>)}
    </ol>
    <footer className="lineage-footer"><p>Movements overlap. Inventions meet. New forms of interaction inherit old questions.</p><p>Open a milestone to read its context and source.</p></footer>
  </section>;
}
