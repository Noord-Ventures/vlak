"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ApplicationStatus, Button, Card, Checkbox, EvidenceChecklist, Icon, IdentityDocument, Input, Select } from "@noorddev/vlak-react";

type Stage = 0 | 1 | 2 | 3;
type Draft = {
  name: string;
  birth: string;
  email: string;
  address: string;
  document: string;
  portrait: boolean;
  residence: boolean;
  applicantDone: boolean;
  receipt: boolean;
};
const initial: Draft = { name: "Alex Morgan", birth: "1990-04-16", email: "alex@example.test", address: "24 Linden Lane, Northmere", document: "resident", portrait: false, residence: false, applicantDone: false, receipt: false };
const storageKey = "vlak-identity-demo-v1";
const steps = ["Your details", "Supporting evidence", "Review application"];
const documents = [{ value: "resident", label: "Resident identity card" }, { value: "renewal", label: "Identity card renewal" }];

function readDraft(raw: string): Draft | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const item = value as Record<string, unknown>;
    if (!["name", "birth", "email", "address", "document"].every(key => typeof item[key] === "string" && (item[key] as string).length <= 240)) return null;
    if (!["portrait", "residence", "applicantDone", "receipt"].every(key => typeof item[key] === "boolean")) return null;
    if (!documents.some(option => option.value === item.document)) return null;
    return item as Draft;
  } catch { return null; }
}

export function IdentityBoard() {
  const [draft, setDraft] = useState<Draft>(initial);
  const [stage, setStage] = useState<Stage>(0);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState("Opening local draft");
  const [notice, setNotice] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const focusNext = useRef(false);
  const formId = useId();
  const selectLabelId = useId();
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const stored = raw && readDraft(raw);
      if (stored) { setDraft(stored); setStage(stored.receipt ? 3 : 0); }
    } catch { /* The draft still works for this tab when storage is unavailable. */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(storageKey, JSON.stringify(draft)); setSaved("Saved in this browser"); }
    catch { setSaved("Kept in this tab only"); }
  }, [draft, ready]);
  useEffect(() => {
    if (focusNext.current) { headingRef.current?.focus(); scrollRef.current?.scrollTo({ top: 0 }); focusNext.current = false; }
  }, [stage]);
  const move = (next: Stage) => { focusNext.current = true; setStage(next); setNotice(""); };
  const edit = (key: "name" | "birth" | "email" | "address" | "document", value: string) => setDraft(current => ({ ...current, [key]: value, applicantDone: false }));
  const attached = Number(draft.portrait) + Number(draft.residence);
  const canVisit = (index: number) => !draft.receipt && (index === 0 || (draft.applicantDone && (index === 1 || attached === 2)));
  const documentTitle = documents.find(option => option.value === draft.document)?.label ?? "Resident identity card";
  const title = stage === 3 ? "Your local receipt is ready" : ["Let’s start with you", "A little supporting evidence", "Everything in one place"][stage];
  const reset = () => { setDraft({ ...initial }); setConfirmed(false); move(0); setNotice("A new sample draft is ready."); };

  return <section className="id-app" aria-label="Resident application workspace" data-stage={stage}>
    <header className="id-header">
      <div className="id-service"><span className="id-mark"><Icon name="building" size={24} /></span><div><strong>Northmere</strong><span>Resident services · Fictional municipality</span></div></div>
      <span className="id-local"><Icon name="shield" /> Local demo</span>
    </header>
    <div className="id-body">
      <aside className="id-rail" aria-label="Application steps">
        <div className="id-rail-intro"><span className="id-eyebrow">Document services</span><h2>A familiar face.<br />A fresh start.</h2><p>Your next identity card starts with a few details.</p></div>
        <ol className="id-steps">{steps.map((step, index) => <li key={step}><Button variant="ghost" type="button" aria-current={stage === index ? "step" : undefined} disabled={!canVisit(index)} onClick={() => move(index as Stage)}><span className="id-step-number">{stage > index ? <Icon name="check" /> : `0${index + 1}`}</span><span>{step}</span></Button></li>)}</ol>
        <Card className="id-help"><Icon name="shield" size={24} /><strong>Your draft stays here</strong><p>Use fictional information. This example never sends an application, uploads a file, or verifies an identity.</p></Card>
        <div className="id-rail-reference"><span>Sample application</span><strong>NM / 0241</strong></div>
      </aside>
      <form id={formId} className="id-workspace" onSubmit={event => {
        event.preventDefault();
        if (stage === 0) { setDraft(current => ({ ...current, applicantDone: true })); move(1); }
        else if (stage === 1 && attached === 2) move(2);
        else if (stage === 2 && confirmed && attached === 2 && draft.applicantDone) { setDraft(current => ({ ...current, receipt: true })); move(3); setNotice("Local receipt created. Nothing was submitted to a government service."); }
      }}>
        <div className="id-scroll" ref={scrollRef}>
          <div className="id-screen-title"><span className="id-eyebrow">{stage === 3 ? "Demo complete" : `Step ${stage + 1} of 3 · ${steps[stage]}`}</span><h2 ref={headingRef} tabIndex={-1}>{title}</h2><p>{stage === 0 ? "We’ve filled in a fictional applicant so you can try the process." : stage === 1 ? "Attach the two sample records below. No files leave your device." : stage === 2 ? "Check your details and the sample records before creating a receipt." : "This records the steps you completed here. It is not a government application or identity document."}</p></div>
          {stage === 0 && <div className="id-fields">
            <div className="id-field-wide"><Input label="Full name" name="applicantName" pattern=".*\S.*" required maxLength={120} value={draft.name} onChange={event => edit("name", event.currentTarget.value)} autoComplete="off" /></div>
            <Input label="Date of birth" name="dateOfBirth" type="date" required value={draft.birth} onChange={event => edit("birth", event.currentTarget.value)} autoComplete="off" />
            <div className="id-field"><span id={selectLabelId}>Document type</span><Select aria-labelledby={selectLabelId} name="documentType" fullWidth value={draft.document} options={documents} onValueChange={value => edit("document", value)} /></div>
            <div className="id-field-wide"><Input label="Email address" name="email" type="email" required maxLength={160} value={draft.email} onChange={event => edit("email", event.currentTarget.value)} autoComplete="off" hint="Used only in this local sample receipt." /></div>
            <div className="id-field-wide"><Input label="Residential address" name="address" pattern=".*\S.*" required maxLength={200} value={draft.address} onChange={event => edit("address", event.currentTarget.value)} autoComplete="off" /></div>
            <div className="id-inline-note id-field-wide"><Icon name="file" /><p>You can return to these details before creating your receipt.</p></div>
          </div>}
          {stage === 1 && <><div className="id-evidence-meter"><strong>{attached}<span> / 2</span></strong><p>Sample records attached<br /><span>Attachment is not verification</span></p></div><EvidenceChecklist label="Supporting records" summary="Both records are required to complete this demo." items={[
            { id: "portrait", label: "Portrait photograph", requirement: "Required for this demo", description: "A fictional portrait record with a plain background.", status: draft.portrait ? "Sample attached · Not verified" : "Not attached", fileName: draft.portrait ? "alex-morgan-portrait.sample" : "No sample attached", actions: [{ id: draft.portrait ? "remove" : "attach", label: draft.portrait ? "Remove sample" : "Attach sample portrait" }] },
            { id: "residence", label: "Proof of address", requirement: "Required for this demo", description: "A fictional address record for 24 Linden Lane, Northmere.", status: draft.residence ? "Sample attached · Not verified" : "Not attached", fileName: draft.residence ? "northmere-address.sample" : "No sample attached", actions: [{ id: draft.residence ? "remove" : "attach", label: draft.residence ? "Remove sample" : "Attach sample address" }] },
          ]} onAction={(id, action) => { setDraft(current => ({ ...current, [id]: action === "attach" })); setNotice(`${id === "portrait" ? "Portrait" : "Address"} sample ${action === "attach" ? "attached" : "removed"}.`); }} /></>}
          {stage === 2 && <div className="id-review">
            <div className="id-document"><div className="id-document-top"><Icon name="building" size={24} /><span>Northmere · Specimen</span><span className="id-monogram" aria-hidden="true">{draft.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("") || "A"}</span></div><IdentityDocument documentTitle={documentTitle} holderName={draft.name} maskedIdentifier="•••• 0241" issuer="Northmere demo municipality" issuedLabel="Not issued" expiresLabel="Not applicable" status="Specimen only" statusDetail="Not valid for identification." /></div>
            <dl className="id-review-data"><div><dt>Email</dt><dd>{draft.email}</dd></div><div><dt>Date of birth</dt><dd>{draft.birth}</dd></div><div><dt>Residential address</dt><dd>{draft.address}</dd></div><div><dt>Supporting evidence</dt><dd>2 sample records attached, neither verified</dd></div></dl>
            <Button variant="ghost" type="button" onClick={() => move(0)}><Icon name="edit" /> Edit applicant details</Button>
            <div className="id-confirm"><Checkbox required checked={confirmed} onCheckedChange={setConfirmed} label="I understand this creates a local demo receipt." /></div>
          </div>}
          {stage === 3 && <div className="id-receipt"><div className="id-receipt-mark"><Icon name="check" size={24} /></div><ApplicationStatus applicationTitle="Local application receipt" reference="Local / 0241" status="Saved locally" statusDetail={`${draft.name} · ${documentTitle}`} updatedLabel="Created in this browser" milestones={[
            { id: "applicant", label: "Applicant details", status: "Recorded locally", dateLabel: "This demo" },
            { id: "evidence", label: "Supporting evidence", status: "2 fictional samples", dateLabel: "Not verified" },
            { id: "receipt", label: "Local receipt", status: "Created", dateLabel: "This browser", current: true },
          ]} nextStep="No further action is scheduled. No government submission was made." /><div className="id-inline-note"><Icon name="shield" /><p>{saved}. You can return to this receipt by reopening the demo.</p></div></div>}
        </div>
        <div className="id-actions">
          {stage > 0 && stage < 3 ? <Button type="button" variant="ghost" onClick={() => move((stage - 1) as Stage)}><Icon name="arrow-left" /> Back</Button> : <span className="id-action-context">{stage === 3 ? "Nothing was submitted" : "About 3 minutes"}</span>}
          {stage < 3 ? <Button type="submit" disabled={!ready || (stage === 1 && attached !== 2)}>{stage === 0 ? "Continue to evidence" : stage === 1 ? "Review application" : "Create local receipt"}<Icon name={stage === 2 ? "check" : "arrow-right"} /></Button> : <Button type="button" onClick={reset}>Start a new sample<Icon name="plus" /></Button>}
        </div>
      </form>
    </div>
    <footer className="id-footer"><span><span className="id-save-dot" />{saved}</span><span>Fictional records · No government connection</span></footer>
    <span className="id-announcement" role="status">{notice}</span>
  </section>;
}
