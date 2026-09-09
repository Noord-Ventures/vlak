"use client";
import { useState } from "react";
import { Button, Response, ResponseBranch, Select } from "@noorddev/vlak-react";
import { HighlightedCode } from "@noorddev/vlak-react/components/highlighted-code";
import { ResponseMarkdown } from "@noorddev/vlak-react/components/response-markdown";
import "katex/dist/katex.min.css";

export function MarkdownPreview() { return <ResponseMarkdown>{"The brief needs **one owner per decision**.\n\n- [x] Read the scope\n- [ ] Assign the review owner\n\n```typescript\nconst review = { owner: 'Legal', status: 'ready' };\n```\n\nCompletion: $$2/3$$."}</ResponseMarkdown>; }
export function HighlightedCodePreview() { const [language, setLanguage] = useState("typescript"); return <div style={{ width: "100%", minWidth: 0 }}><Select aria-label="Code language" value={language} onValueChange={setLanguage} options={[{ value: "typescript", label: "TypeScript" }, { value: "json", label: "JSON" }, { value: "text", label: "Plain text" }]} /><HighlightedCode code={language === "json" ? '{\n  "owner": "Legal",\n  "status": "ready"\n}' : "const review = { owner: 'Legal', status: 'ready' };"} language={language} lineNumbers filename={language === "json" ? "review.json" : "review.ts"} /></div>; }
export function ResponseBranchPreview() { const [branches, setBranches] = useState([{ id: "first", content: <Response>Two decisions need an owner.</Response> }, { id: "second", content: <Response>Name an owner for the launch date and review checklist.</Response> }]); return <div style={{ display: "grid", gap: 16 }}><ResponseBranch branches={branches} /><Button variant="subtle" onClick={() => setBranches(current => [...current, { id: String(current.length), content: <Response>Keep each owner beside the decision they are responsible for.</Response> }])}>Add an alternative</Button></div>; }
