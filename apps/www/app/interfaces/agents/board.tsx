"use client";

import * as React from "react";
import { Button, Card, Icon, Input, Progress, Textarea, ToggleGroup } from "@noorddev/vlak-react";
import { agentStatusLabels, initialAgentTasks, type AgentStatus, type AgentTask } from "./data";

type QueueFilter = "all" | "active" | "review";

function matchesFilter(task: AgentTask, filter: QueueFilter) {
  return filter === "all" || (filter === "active" ? task.status === "running" || task.status === "paused" : task.status === "review");
}

function Status({ status }: { status: AgentStatus }) {
  return <span className="am-status" data-status={status}><span className="am-status-mark" aria-hidden="true">{status === "complete" ? <Icon name="check" size={12} /> : null}</span>{agentStatusLabels[status]}</span>;
}

export function AgentsBoard() {
  const [tasks, setTasks] = React.useState<AgentTask[]>(initialAgentTasks);
  const [selectedId, setSelectedId] = React.useState<string | null>("013");
  const [filter, setFilter] = React.useState<QueueFilter>("all");
  const [view, setView] = React.useState("activity");
  const [mobileDetail, setMobileDetail] = React.useState(false);
  const [composing, setComposing] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [brief, setBrief] = React.useState("");
  const [announcement, setAnnouncement] = React.useState("");
  const detailTitle = React.useRef<HTMLHeadingElement>(null);
  const queueButtons = React.useRef(new Map<string, HTMLButtonElement>());
  const newTaskButton = React.useRef<HTMLButtonElement>(null);
  const selected = tasks.find((task) => task.id === selectedId);
  const visible = tasks.filter((task) => matchesFilter(task, filter));
  const active = tasks.filter((task) => task.status === "running").length;
  const reviews = tasks.filter((task) => task.status === "review").length;
  const queued = tasks.filter((task) => task.status === "queued").length;

  function selectTask(task: AgentTask) {
    setSelectedId(task.id);
    setComposing(false);
    setMobileDetail(true);
    setView("activity");
    requestAnimationFrame(() => detailTitle.current?.focus({ preventScroll: true }));
  }

  function changeStatus(status: AgentStatus) {
    if (!selected) return;
    const action = status === "paused" ? "Paused. The agent will keep its current context." : status === "complete" ? "Review approved. The task is complete." : "The agent is working on this task.";
    setTasks((current) => current.map((task) => task.id === selected.id ? {
      ...task,
      status,
      progress: status === "complete" ? 100 : status === "running" && task.progress === 0 ? 8 : task.progress,
      activity: [{ time: "Now", text: action }, ...task.activity],
    } : task));
    setAnnouncement(`${selected.title}: ${action}`);
    if (status === "complete") requestAnimationFrame(() => detailTitle.current?.focus({ preventScroll: true }));
  }

  function changeFilter(value: string) {
    const next = value as QueueFilter;
    setFilter(next);
    setMobileDetail(false);
    setComposing(false);
    if (!selected || !matchesFilter(selected, next)) setSelectedId(tasks.find((task) => matchesFilter(task, next))?.id ?? null);
  }

  function closeDetail() {
    setMobileDetail(false);
    setComposing(false);
    requestAnimationFrame(() => (selectedId ? queueButtons.current.get(selectedId) ?? newTaskButton.current : newTaskButton.current)?.focus({ preventScroll: true }));
  }

  function queueTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !brief.trim()) return;
    const id = String(Math.max(...tasks.map((task) => Number(task.id))) + 1).padStart(3, "0");
    const task: AgentTask = {
      id, title: title.trim(), brief: brief.trim(), agent: "Builder agent", status: "queued", progress: 0,
      scope: "Workspace files",
      activity: [{ time: "Now", text: "Task queued with your brief. Ready to start." }],
      output: [],
    };
    setTasks((current) => [task, ...current]);
    setSelectedId(id);
    setFilter("all");
    setComposing(false);
    setView("activity");
    setTitle("");
    setBrief("");
    setAnnouncement(`${task.title} was added to the queue.`);
    requestAnimationFrame(() => detailTitle.current?.focus({ preventScroll: true }));
  }

  return (
    <section className="am" data-mobile-detail={mobileDetail} data-mobile-screen={composing ? "compose" : mobileDetail ? "detail" : "queue"} aria-label="Agent workspace">
      <header className="am-header">
        <div className="am-workspace"><span className="am-workspace-mark"><Icon name="layers" size={16} /></span><div><strong>Website release</strong><span className="am-desktop-context">Shared workspace</span><span className="am-mobile-context">{active} working · {reviews} to review</span></div></div>
        <Button variant="ghost" size="sm" ref={newTaskButton} className="am-new-task" onClick={() => { setComposing(true); setMobileDetail(true); }}><Icon name="plus" size={16} /><span>New task</span></Button>
      </header>

      <div className="am-summary" aria-label="Queue summary">
        <Card className="am-summary-card"><span><span className="am-running-dot" />Active agents</span><strong>{String(active).padStart(2, "0")}</strong></Card>
        <Card className="am-summary-card"><span>Needs review</span><strong>{String(reviews).padStart(2, "0")}</strong></Card>
        <Card className="am-summary-card"><span>In queue</span><strong>{String(queued).padStart(2, "0")}</strong></Card>
      </div>

      <div className="am-body">
        <aside className="am-queue" aria-label="Task queue">
          <div className="am-queue-controls"><ToggleGroup className="am-filter" aria-label="Filter tasks" value={filter} onValueChange={changeFilter} options={[{ value: "all", label: "All tasks" }, { value: "active", label: "Active" }, { value: "review", label: "Review" }]} /></div>
          <div className="am-queue-list">
            {visible.map((task) => <button key={task.id} ref={(element) => { if (element) queueButtons.current.set(task.id, element); else queueButtons.current.delete(task.id); }} type="button" className="am-task" aria-current={selectedId === task.id && !composing ? "true" : undefined} onClick={() => selectTask(task)}>
              <span className="am-task-meta"><span>{task.agent}</span><span className="am-task-number">{task.id}</span></span>
              <strong>{task.title}</strong>
              <span className="am-task-foot"><Status status={task.status} />{task.status === "running" ? <span className="am-task-percent">{task.progress}%</span> : <Icon name="chevron-right" size={12} />}</span>
            </button>)}
            {visible.length === 0 ? <div className="am-empty"><Icon name="check" size={24} /><h3>{filter === "review" ? "Nothing waiting for review" : "No active tasks"}</h3><p>{filter === "review" ? "Tasks will appear here when an agent needs your decision." : "Start a queued task to put an agent to work."}</p><Button variant="ghost" size="sm" onClick={() => changeFilter("all")}>View all tasks</Button></div> : null}
          </div>
          <div className="am-queue-count">{visible.length} {visible.length === 1 ? "task" : "tasks"}<span className="am-desktop-context">{tasks.filter((task) => task.status === "complete").length} complete</span><span className="am-mobile-context">Local demo</span></div>
        </aside>

        <section className="am-detail" aria-label={composing ? "New task" : "Task detail"}>
          {composing ? <form className="am-compose" onSubmit={queueTask}>
            <div className="am-compose-heading"><h2>Give an agent a task</h2><Button variant="ghost" size="sm" className="am-icon-button" aria-label="Cancel new task" onClick={closeDetail}><Icon name="x" size={16} /></Button></div>
            <div className="am-compose-fields">
            <p>Describe the outcome and any boundaries. The builder agent will keep its work in this workspace.</p>
            <Input label="Task name" autoFocus required maxLength={80} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Improve the search experience" />
            <Textarea label="Brief" required rows={3} maxLength={1200} value={brief} onChange={(event) => setBrief(event.target.value)} placeholder="What should change, and how will we know it is ready?" />
            <div className="am-compose-assignee"><span className="am-agent-avatar"><Icon name="code" size={16} /></span><span><strong>Builder agent</strong><small>Assigned when you queue this task</small></span></div>
            </div>
            <div className="am-compose-actions"><Button type="submit" size="sm" disabled={!title.trim() || !brief.trim()}>Queue task<Icon name="arrow-right" size={16} /></Button><Button variant="ghost" size="sm" onClick={closeDetail}>Cancel</Button></div>
          </form> : selected ? <>
            <div className="am-detail-head">
              <div className="am-detail-topline"><Button variant="ghost" size="sm" className="am-back" onClick={closeDetail}><Icon name="arrow-left" size={16} />Tasks</Button><span className="am-detail-id">Task {selected.id}</span><Status status={selected.status} /></div>
              <h2 ref={detailTitle} tabIndex={-1}>{selected.title}</h2>
              <div className="am-agent-line"><span className="am-agent-avatar"><Icon name={selected.status === "review" ? "user-check" : "code"} size={16} /></span><span>{selected.agent}</span><span className="am-agent-scope">{selected.scope}</span></div>
            </div>
            <div className="am-detail-scroll" key={selected.id}>
              <p className="am-brief">{selected.brief}</p>
              <div className="am-view-controls"><ToggleGroup className="am-view-filter" aria-label="Task information" value={view} onValueChange={setView} options={[{ value: "activity", label: "Activity" }, { value: "output", label: <>Output <span className="am-output-count">{selected.output.length}</span></> }]} />{selected.status === "running" || selected.status === "paused" ? <span className="am-progress-label">{selected.progress}% of plan</span> : null}</div>
              {view === "activity" ? <ol className="am-activity" aria-label="Task activity">{selected.activity.map((item, index) => <li key={`${item.time}-${index}`}><span className="am-activity-marker" aria-hidden="true">{index === 0 && selected.status === "running" ? <span /> : <Icon name="check" size={12} />}</span><div><p>{item.text}</p><time>{item.time}</time></div></li>)}</ol> : <div className="am-outputs" aria-label="Task output">{selected.output.length > 0 ? <><div className="am-output-heading"><Icon name="files" size={16} /><span>{selected.output.length} {selected.output.length === 1 ? "file" : "files"} prepared</span><span>Preview</span></div>{selected.output.map((output) => <Card className="am-output-file" key={output.file}><Icon name="file-text" size={16} /><div><strong>{output.file}</strong><p>{output.description}</p></div></Card>)}</> : <div className="am-output-empty"><Icon name="file" size={24} /><p>No output yet. Files will appear here after the agent starts working.</p></div>}</div>}
            </div>
            <div className="am-detail-actions">
              {selected.status === "review" ? <><div><strong>Ready for your review</strong><span>{selected.output.length} files · 18 checks passed</span></div><Button size="sm" onClick={() => changeStatus("complete")}><Icon name="check" size={16} />Approve review</Button></> : selected.status === "complete" ? <><div><strong>Work accepted</strong><span>This task is complete.</span></div><span className="am-complete-mark"><Icon name="check" size={16} /></span></> : <><div className="am-run-progress"><Progress value={selected.progress} label={selected.status === "queued" ? "Ready to start" : selected.status === "paused" ? "Context saved" : "Run progress"} /></div><Button variant="ghost" size="sm" onClick={() => changeStatus(selected.status === "running" ? "paused" : "running")}><Icon name={selected.status === "running" ? "pause" : "play"} size={16} />{selected.status === "running" ? "Pause" : selected.status === "paused" ? "Resume" : "Start task"}</Button></>}
            </div>
          </> : <div className="am-empty am-detail-empty"><Icon name="layers" size={24} /><h2>Your workspace is clear</h2><p>Select a task to see its progress, output, and next decision.</p></div>}
        </section>
      </div>

      <footer className="am-footer"><span><Icon name="terminal" size={12} />Local demo</span><span>Changes stay in this tab</span></footer>
      <div className="am-mobile-nav" role="group" aria-label="Filter tasks">
        <Button variant="ghost" aria-label="All tasks" aria-pressed={filter === "all"} onClick={() => changeFilter("all")}><Icon name="list" size={16} /><span>Tasks</span></Button>
        <Button variant="ghost" aria-pressed={filter === "active"} onClick={() => changeFilter("active")}><Icon name="activity" size={16} /><span>Active</span></Button>
        <Button variant="ghost" aria-label="Review" aria-pressed={filter === "review"} onClick={() => changeFilter("review")}><Icon name="user-check" size={16} /><span>Review{reviews ? ` · ${reviews}` : ""}</span></Button>
      </div>
      <span className="am-announcement" role="status" aria-live="polite">{announcement}</span>
    </section>
  );
}
