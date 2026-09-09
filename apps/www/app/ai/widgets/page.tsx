import Link from "next/link";
import { AiShell } from "@/components/ai-shell";
import { CodeBlock } from "@/components/code-block";
import { CalendarWidget, EmbeddedCalendarWidget, ProjectWidget } from "@/components/ai-widgets";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata("/ai/widgets", {
  title: "Widgets",
  description: "A shared design for application and third-party widgets, with provider attribution, content, actions, and data states.",
}, { searchTitle: "Widgets for AI interfaces · Vlak" });

const example = `import { Widget, Toggle } from "@noorddev/vlak-react";

<Widget
  title={record.title}
  provider={integration.name}
  status={status}
  errorMessage="The provider could not load this record."
  onRetry={reload}
  actions={<Toggle variant="subtle" pressed={selected}
    onPressedChange={setSelected}>Select this time</Toggle>}
  footer={record.updatedLabel}
>
  <ProviderContent record={record} />
</Widget>`;

export default function WidgetsPage() {
  return <AiShell title="Widgets" summary="One shared surface for structured content, inside a conversation or anywhere in your product.">
    <p className="rs-t-body">Use the same frame for your own features and third-party integrations. Use React content when your application renders the interface, or WidgetEmbed when the provider supplies an embedded page. The shared frame gives both a consistent title, source, and supporting context.</p>
    <section aria-labelledby="internal-widget" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 24 }}>
      <h2 className="section-label" id="internal-widget" style={{ margin: 0 }}>Application content</h2>
      <ProjectWidget />
      <p className="rs-t-body" style={{ margin: 0 }}>Compose local features from the same library controls used throughout your product. This checklist places Vlak checkboxes inside Widget and records changes in this example.</p>
    </section>
    <section aria-labelledby="provider-widget" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 24 }}>
      <h2 className="section-label" id="provider-widget" style={{ margin: 0 }}>Provider content</h2>
      <CalendarWidget />
      <p className="rs-t-body" style={{ margin: 0 }}>Identify the provider and render its records with DescriptionList, forms, or other library components. A subtle Toggle makes the selected time visible below the content. The adapter owns authentication, fetching, and external actions; this example uses supplied calendar data without connecting an account.</p>
    </section>
    <section aria-labelledby="embedded-widget" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 24 }}>
      <h2 className="section-label" id="embedded-widget" style={{ margin: 0 }}>Embedded content</h2>
      <EmbeddedCalendarWidget />
      <p className="rs-t-body" style={{ margin: 0 }}>Use WidgetEmbed for a provider's embeddable page. This example is a separate local document with native time controls. It uses an empty sandbox because it needs no scripts or permissions.</p>
      <CodeBlock code={'import { Widget, WidgetEmbed } from "@noorddev/vlak-react";\n\n<Widget title="Available times" provider="Calendar">\n  <WidgetEmbed title="Choose a meeting time"\n    src={providerEmbedUrl} height={320} />\n</Widget>'} />
      <p className="rs-t-body">The embed defaults to lazy loading, no referrer, and a sandbox that permits scripts and forms. Your application chooses the provider URL and any additional permissions. Give each frame a descriptive title and an explicit height; the surrounding widget stays fluid.</p>
      <p className="rs-t-body">Cross-origin content owns its internal styles and focus order. Apply provider theme options where available. Vlak styles the outer frame and surrounding controls; it does not resize a remote document automatically or exchange messages with it.</p>
    </section>
    <section aria-labelledby="widget-anatomy">
      <h2 className="section-label" id="widget-anatomy">A common structure</h2>
      <ul className="docs-list">
        <li><strong>Header.</strong> A clear title, provider attribution, and optional short metadata.</li>
        <li><strong>Content.</strong> React children for records, forms, lists, charts, or third-party components. Use Vlak tokens and controls to keep the presentation consistent.</li>
        <li><strong>Actions.</strong> Explicit controls below the content. Use <Link className="rs-link" href="/components/button/">Button</Link> with <code>variant="subtle"</code> for supporting actions, and confirm consequential changes with <Link className="rs-link" href="/ai/confirmation/">Confirmation</Link>.</li>
        <li><strong>Footer.</strong> Source context, update time, or the result of an action.</li>
      </ul>
    </section>
    <section aria-labelledby="widget-states">
      <h2 className="section-label" id="widget-states">States and behavior</h2>
      <p className="rs-t-body">Every widget supports ready, loading, empty, and error states. The frame stays in place while the content changes. Retry waits for your callback and keeps failures readable. A successful request becomes ready only when your application supplies that state.</p>
      <p className="rs-t-body">The <Link className="rs-link" href="/ai/widget/">interactive widget example</Link> uses a ButtonGroup with subtle buttons to explore those states, with one selected state at a time. Its controls form two columns on phones and keep 44px targets.</p>
      <p className="rs-t-body">Keep the widget fluid within its container. Use 1px borders, subtle 4px corners, the existing typography, and 44px interactive targets. Name each control and preserve focus when data updates.</p>
    </section>
    <section aria-labelledby="widget-integration">
      <h2 className="section-label" id="widget-integration">Connect a provider</h2>
      <CodeBlock code={example} />
      <p className="rs-t-body">In this example, record, integration, status, reload, selected, setSelected, and ProviderContent come from your application. Pass a trusted React component through the content slot, and translate provider states into the widget states. Tokens are CSS custom properties, so provider components can use the same type, colors, spacing, and focus styles.</p>
      <p className="rs-t-body">Widget accepts React content; WidgetEmbed hosts an application-selected iframe. Connection, authentication, and provider permissions belong to your application. See the <Link className="rs-link" href="/ai/widget/">Widget reference</Link> for props and interactive state examples.</p>
    </section>
  </AiShell>;
}
