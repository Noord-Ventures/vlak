import Link from "next/link";
import { AiShell } from "@/components/ai-shell";
import { CodeBlock } from "@/components/code-block";
import { StructuredData, breadcrumbData } from "@/components/structured-data";
import { aiPageGroups } from "@/lib/ai-catalog";
import { pageMetadata } from "@/lib/page-metadata";
import { HOST, INSTALL } from "../specimen";
import { AiDemo } from "./demo";

export const metadata = pageMetadata("/ai", {
  title: "AI components",
  description: "Build AI interfaces with Vlak. React components for chat, streamed responses, work summaries, message actions, tool calls, approvals, and widgets.",
});

const example = `import "@noorddev/vlak-react/css";
import { Chat, MessageComposer, Reasoning, Response, ResponseActions } from "@noorddev/vlak-react";

<Chat title="Project conversation"
  composer={<MessageComposer compact maxRows={6} sendOnEnter onSend={sendMessage}
    generating={status === "streaming"} onStop={stop} />}>
  <Response from="user">Review the launch brief.</Response>
  <Response status={status}
    actions={status === "complete" ? <ResponseActions text={text} /> : undefined}>
    <Reasoning variant="inline" title="Reviewed the launch brief" status="complete">
      <p>Checked the supplied scope, owners, and sources.</p>
    </Reasoning>
    {renderResponse(text)}
  </Response>
</Chat>`;

export default function AiPage() {
  return (
    <AiShell wide title="AI components" summary="Conversations, rich responses, tools, voice, and workflows. Built with the same paper, ink, and controls as the rest of Vlak.">
      <StructuredData value={breadcrumbData([
        { name: "Vlak", url: `${HOST}/` },
        { name: "AI", url: `${HOST}/ai/` },
      ])} />
      <p className="rs-t-body ai-overview-reading">Compose an assistant from React components, then connect your model and data. Each piece works on its own or as part of a conversation.</p>

      <section className="ai-overview-demo" aria-labelledby="try-it">
        <h2 id="try-it" className="section-label" style={{ marginBottom: 12 }}>Try the components</h2>
        <AiDemo />
      </section>

      <section className="ai-overview-reading" aria-labelledby="reference-app">
        <h2 id="reference-app" className="section-label">Connect a live model</h2>
        <p className="rs-t-body">The <a className="rs-link" href="https://github.com/Noord-Ventures/vlak/tree/main/apps/assistant">assistant reference app</a> connects these components to the AI SDK and OpenAI. It includes saved conversations, attachments, editing, regeneration, tool approvals, and React and iframe widgets.</p>
        <p className="rs-t-body">Run it locally with your server credentials. The <a className="rs-link" href="/docs/ai.md#runnable-reference-app">integration guide</a> explains the setup and the boundary between reusable UI and application code.</p>
      </section>

      <section className="ai-overview-reading" aria-labelledby="components">
        <h2 id="components" className="section-label">Explore the components</h2>
        {aiPageGroups.map(group => <div className="ai-catalog-group" key={group.title}><h3 className="section-label">{group.title}</h3><ul className="ai-component-list">
          {group.pages.map(page => (
            <li key={page.href}>
              <Link href={`${page.href}/`}>
                <strong>{page.title}</strong>
                <span>{page.description}</span>
              </Link>
            </li>
          ))}
        </ul></div>)}
      </section>

      <section className="ai-overview-reading" aria-labelledby="integration">
        <h2 id="integration" className="section-label">Build a conversation</h2>
        <CodeBlock code={INSTALL} />
        <CodeBlock code={example} />
        <p className="rs-t-body">Supply the response content and its status from your application. In this example, renderResponse, sendMessage, stop, text, and status come from your model integration. The compact composer grows from one line to six, outside the scrolling history. Response actions provide copy, narration, feedback, and share controls.</p>
        <p className="rs-t-body">Use the optional <Link className="rs-link" href="/ai/response-markdown/">Response Markdown</Link> renderer for streamed text, highlighted code, math, and diagrams. The <a className="rs-link" href="/docs/ai.md">integration guide</a> includes a complete composition, an AI SDK recipe, and mappings for response and tool states.</p>
      </section>

      <section className="ai-overview-reading" aria-labelledby="more-pieces">
        <h2 id="more-pieces" className="section-label">Compose with Vlak</h2>
        <p className="rs-t-body">Add <Link className="rs-link" href="/components/message-composer/">Message composer</Link> for prompts and attachments, <Link className="rs-link" href="/components/references/">References</Link> for citations, and <Link className="rs-link" href="/components/code-block/">Code block</Link> for code. <Link className="rs-link" href="/ai/chat/">Chat</Link> provides the frame and scrolling history used above. Follow the <Link className="rs-link" href="/ai/widgets/">widget patterns</Link> for application data and third-party integrations.</p>
      </section>
    </AiShell>
  );
}
