import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { DocsShell } from "@/components/docs-shell";
import { DOOR } from "../specimen";

export const metadata: Metadata = pageMetadata("/privacy", {
  title: "Privacy",
  description: "How Vlak handles website and MCP request data.",
  alternates: { canonical: `${DOOR}/privacy/` },
});

export default function PrivacyPage() {
  return (
    <DocsShell title="Privacy" summary="How Vlak handles website and MCP request data. Last updated 13 November 2026.">
      <h2 className="section-label">Who operates Vlak</h2>
      <p className="rs-t-body">
        Noord.dev publishes Vlak and operates vlak.dev and its public MCP endpoint. Questions or privacy requests can be sent to{" "}
        <a className="rs-link" href="mailto:hello@noord.vc">hello@noord.vc</a>.
      </p>

      <h2 className="section-label">What Vlak processes</h2>
      <p className="rs-t-body">
        Vlak has no user accounts and does not ask for names, email addresses, payment details, or authentication credentials. The public MCP server processes the tool name and arguments sent in a request so it can return component documentation, props, tokens, or installation instructions. Request bodies are processed in memory and are not written to a Vlak database.
      </p>
      <p className="rs-t-body">
        Vlak runs on Vercel. Like most hosting providers, Vercel receives technical request information such as IP address, request time, host and path, response status, browser or client details, and approximate location derived from IP. Vlak uses this information only to deliver the service, diagnose failures, measure reliability, and prevent abuse.
      </p>

      <h2 className="section-label">Hosted MCP usage</h2>
      <p className="rs-t-body">
        When usage measurement is enabled, the hosted MCP endpoint sends a small operational record to Noord&apos;s private analytics service: the published tool name, request completion time, success or error status, response duration, a random event identifier used to prevent duplicate counting, and whether optional OpenAI client metadata was present. When diagnostics are enabled, the record also includes the deployed Vlak version and a fixed error category, such as invalid arguments, a missing record, or a transport failure. Error messages are not collected. The presence of OpenAI metadata is an unverified hint, not proof of a particular client or an installed plugin.
      </p>
      <p className="rs-t-body">
        These records contain no tool arguments, search text, prompts, results, raw client metadata, IP addresses, user identifiers, or conversation identifiers. They are used for aggregate usage and reliability reporting, not user profiles or confirmed installation counts. Reports cover the most recent 30 days. Older operational records are removed when the service next receives a measurement or generates a report.
      </p>

      <h2 className="section-label">Website analytics</h2>
      <p className="rs-t-body">
        The website uses Vercel Web Analytics. It records aggregate page views and a small set of fixed events such as an installation-command copy or documentation link click. Vlak removes query strings and fragments, rejects unknown paths and event fields, and never sends copied text, form values, or clipboard contents. Vercel Web Analytics does not use third-party cookies; its visitor hash resets after 24 hours and is not used to follow a person across sites.
      </p>
      <p className="rs-t-body">
        Appearance settings are stored only in the browser&apos;s local storage. One session flag prevents duplicate acquisition events. These values are not account identifiers and are not sent to Vlak.
      </p>

      <h2 className="section-label">Sharing and retention</h2>
      <p className="rs-t-body">
        Vlak does not sell personal data. Technical request and website analytics data is processed by Vercel as the hosting and analytics provider. Hosted MCP operational records are stored in Noord&apos;s private analytics database and are available only through its authenticated dashboard. Vlak does not use an advertising network or share MCP request content with other services. Runtime logs are available to Vlak for no more than 30 days, depending on the hosting plan, and are then removed from the accessible log store. The daily website analytics visitor hash expires after 24 hours. Aggregate website analytics may remain available for the reporting period configured by Vercel.
      </p>

      <h2 className="section-label">Your choices</h2>
      <p className="rs-t-body">
        You can use the open-source packages and local stdio MCP server without calling vlak.dev; they do not send these usage measurements. Hosted MCP requests carrying DNT: 1 or Sec-GPC: 1 are excluded from this usage collection. Whether those headers can be set depends on your client. You can block the website analytics script, clear local storage in your browser, or stop using the hosted endpoint. To ask what data may relate to a request, or to request deletion where applicable, email{" "}
        <a className="rs-link" href="mailto:hello@noord.vc">hello@noord.vc</a>. Include the approximate request time and endpoint, but do not send secrets or full prompt content.
      </p>

      <h2 className="section-label">Changes</h2>
      <p className="rs-t-body">
        This page will be updated before Vlak materially changes the data it collects or how it uses that data. Vercel&apos;s own processing is described in its{" "}
        <a className="rs-link" href="https://vercel.com/legal/privacy-notice">privacy notice</a>.
      </p>
    </DocsShell>
  );
}
