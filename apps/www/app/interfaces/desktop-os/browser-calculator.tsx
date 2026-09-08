"use client";
import * as React from "react";
import { calculate } from "./calculator";
import { Button, Icon, Input } from "@noorddev/vlak-react";

const pages = [
  { address: "vlak:home", title: "Start here", path: "" },
  { address: "vlak:guide", title: "Getting started", path: "/docs/guide.md" },
  { address: "vlak:tokens", title: "Design tokens", path: "/docs/tokens.md" },
  { address: "vlak:design", title: "The design brief", path: "/design.md" },
];
export function BrowserApp() {
  const [history, setHistory] = React.useState(["vlak:home"]);
  const [index, setIndex] = React.useState(0);
  const [address, setAddress] = React.useState("vlak:home");
  const [text, setText] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [reload, setReload] = React.useState(0);
  const current = pages.find(page => page.address === history[index]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: reload is the explicit browser reload action
  React.useEffect(() => {
    setAddress(history[index]!); setError("");
    if (!current?.path) { setLoading(false); setText(""); return; }
    const controller = new AbortController(); setLoading(true);
    fetch(current.path, { signal: controller.signal }).then(response => {
      if (!response.ok) throw new Error("The guide could not be loaded."); return response.text();
    }).then(setText).catch(reason => { if (!controller.signal.aborted) setError(reason.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [current?.path, history, index, reload]);
  const navigate = (next: string) => { setHistory(previous => [...previous.slice(0, index + 1), next]); setIndex(index + 1); };
  const visit = () => {
    const internal = pages.find(page => page.address === address.trim() || page.path === address.trim());
    if (internal) { navigate(internal.address); return; }
    try {
      const url = new URL(address.includes("://") ? address : `https://${address}`);
      if (!["https:", "http:"].includes(url.protocol) || !url.hostname.includes(".")) throw new Error();
      window.open(url.href, "_blank", "noopener,noreferrer");
      setError("Website opened in your browser.");
    } catch { setError("Choose a guide or enter a web address."); }
  };
  return <div className="dos-app dos-browser">
    <form className="dos-app-toolbar" onSubmit={event => { event.preventDefault(); visit(); }}>
      <Button variant="ghost" aria-label="Back" disabled={!index} onClick={() => setIndex(value => value - 1)}><Icon name="arrow-left" size={16} /></Button>
      <Button variant="ghost" aria-label="Forward" disabled={index === history.length - 1} onClick={() => setIndex(value => value + 1)}><Icon name="arrow-right" size={16} /></Button>
      <Button variant="ghost" aria-label="Reload page" onClick={() => setReload(value => value + 1)}><Icon name="refresh" size={16} /></Button>
      <Input plain aria-label="Web address" value={address} onChange={event => setAddress(event.target.value)} onFocus={event => event.target.select()} />
      <Button type="submit">Go</Button>
    </form>
    <nav className="dos-browser-bookmarks" aria-label="Bookmarks">{pages.map(page => <Button key={page.address} variant="ghost" onClick={() => navigate(page.address)}>{page.title}</Button>)}</nav>
    {error && <p role="status" className="dos-app-status">{error}</p>}
    <article className="dos-browser-document" tabIndex={0} aria-label={current?.title ?? "Web page"}>
      {loading ? <p role="status">Loading guide…</p> : current?.path ? <pre>{text}</pre> : <><p className="dos-app-muted">Vlak field guide</p><h2>Room to make things.</h2><p>Read the guides, explore the design tokens, or keep the design brief nearby while you work.</p><p>These guides load from Vlak. Other websites open in your browser.</p>{pages.slice(1).map(page => <Button key={page.address} variant="ghost" className="dos-browser-guide" onClick={() => navigate(page.address)}>{page.title}<Icon name="arrow-right" size={16} /></Button>)}</>}
    </article>
  </div>;
}

export function CalculatorApp() {
  const [expression, setExpression] = React.useState("");
  const [result, setResult] = React.useState("0");
  const [memory, setMemory] = React.useState(0);
  const [history, setHistory] = React.useState<string[]>([]);
  const solve = () => { try { const value = calculate(expression); setResult(String(value)); setHistory(current => [`${expression} = ${value}`, ...current].slice(0, 5)); setExpression(String(value)); } catch (error) { setResult(error instanceof Error ? error.message : "Error"); } };
  return <div className="dos-app dos-calculator">
    <Input plain aria-label="Calculation" inputMode="decimal" value={expression} placeholder="0" maxLength={100} onChange={event => setExpression(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); solve(); } }} />
    <output className="dos-calculator-result" aria-live="polite">{result}</output>
    <div className="dos-calculator-keys">{["MC", "MR", "M+", "C", "7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−", "0", ".", "=", "+"].map(key => <Button key={key} variant={key === "=" ? "primary" : "ghost"} aria-label={key === "C" ? "Clear calculation" : key === "MC" ? "Clear memory" : key === "MR" ? "Recall memory" : key === "M+" ? "Add to memory" : key} onClick={() => {
      if (key === "=") solve(); else if (key === "C") { setExpression(""); setResult("0"); } else if (key === "MC") setMemory(0); else if (key === "MR") setExpression(String(memory)); else if (key === "M+") { try { setMemory(value => value + calculate(expression)); } catch { setResult("Enter a calculation first."); } } else setExpression(value => (value + key).slice(0, 100));
    }}>{key}</Button>)}</div>
    {!!history.length && <div className="dos-calculator-history" role="group" aria-label="Calculation history">{history.map((line, index) => <p key={`${index}-${line}`}>{line}</p>)}</div>}
  </div>;
}
