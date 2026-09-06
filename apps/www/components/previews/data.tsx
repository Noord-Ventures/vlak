"use client";

import { useId, type ComponentType } from "react";
import {
  ActivityTimeline,
  CodeBlock,
  ConnectionStatus,
  DescriptionList,
  DiffViewer,
  ErrorSummary,
  Form,
  Input,
  JSONViewer,
  Metric,
  NotificationCenter,
  TaskProgress,
} from "@noorddev/vlak-react";

function ErrorSummaryPreview() {
  const emailId = useId();
  return (
    <Form onSubmit={(event) => event.preventDefault()}>
      <ErrorSummary title="Check this field" errors={[{ id: emailId, message: "Enter your email address" }]} />
      <Input id={emailId} label="Email" type="email" aria-invalid="true" />
    </Form>
  );
}

export const dataPreviews: Record<string, ComponentType> = {
  "description-list": () => (
    <DescriptionList items={[
      { id: "name", label: "Name", value: "Untitled" },
      { id: "status", label: "Status", value: "Ready" },
    ]} />
  ),
  metric: () => <Metric label="Estimated range" value={386} unit="km" />,
  "activity-timeline": () => (
    <ActivityTimeline events={[
      { id: "published", title: "Published", dateTime: "2026-09-06T09:00:00Z", timeLabel: "6 September, 09:00" },
    ]} />
  ),
  "code-block": () => <CodeBlock code="const total = 42;" language="JavaScript" />,
  "json-viewer": () => <JSONViewer label="Sample data preview" data={{ name: "Untitled", version: 1 }} />,
  "diff-viewer": () => <DiffViewer label="Code changes preview" before="const total = 24;" after="const total = 42;" />,
  "error-summary": ErrorSummaryPreview,
  "notification-center": () => (
    <NotificationCenter label="Notifications preview" defaultValue={[
      { id: "export", title: "Export ready" },
    ]} />
  ),
  "task-progress": () => <TaskProgress label="Export preview" state="running" value={40} />,
  "connection-status": () => <ConnectionStatus state="connected" />,
};
