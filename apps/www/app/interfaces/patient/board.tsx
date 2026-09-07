"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ActivityRings, AppointmentCard, Button, Card, CarePlan, HealthMetric, Icon, LabResults, MedicationSchedule, PatientBanner, Select, Textarea } from "@noorddev/vlak-react";
import type { IconName } from "@noorddev/vlak-react";

type Screen = "overview" | "readings" | "care";
type PatientRecord = { note: string; preference: string; taken: boolean; questions: boolean; list: boolean };
const initial: PatientRecord = { note: "I’d like to talk about my sleep routine and the questions from my last visit.", preference: "none", taken: false, questions: false, list: false };
const storageKey = "vlak-patient-demo-v1";
const navigation: { id: Screen; label: string; icon: IconName }[] = [{ id: "overview", label: "Overview", icon: "home" }, { id: "readings", label: "Readings", icon: "activity" }, { id: "care", label: "Care", icon: "clipboard" }];
const preferences = [{ value: "none", label: "No preference saved" }, { value: "practice", label: "At the practice" }, { value: "video", label: "Video conversation" }];
const reports = [
  { id: "haemoglobin", name: "Haemoglobin", value: 14.2, unit: "g/dL", minimum: 12, maximum: 16, rangeLabel: "Sample lab supplied range: 12–16 g/dL", timeLabel: "4 September 2026 · 09:10 UTC+01", note: "Fictional laboratory record." },
  { id: "sodium", name: "Sodium", value: 140, unit: "mmol/L", minimum: 135, maximum: 145, rangeLabel: "Sample lab supplied range: 135–145 mmol/L", timeLabel: "4 September 2026 · 09:10 UTC+01" },
  { id: "ferritin", name: "Ferritin", status: "pending" as const, statusLabel: "Result not supplied", timeLabel: "4 September 2026 · 09:10 UTC+01" },
];

function readRecord(raw: string): PatientRecord | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const record = value as Record<string, unknown>;
    if (typeof record.note !== "string" || record.note.length > 2000 || !preferences.some(option => option.value === record.preference)) return null;
    if (!["taken", "questions", "list"].every(key => typeof record[key] === "boolean")) return null;
    return record as PatientRecord;
  } catch { return null; }
}

export function PatientBoard() {
  const [record, setRecord] = useState<PatientRecord>(initial);
  const [screen, setScreen] = useState<Screen>("overview");
  const [detail, setDetail] = useState(false);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState("Opening local record");
  const [notice, setNotice] = useState("");
  const [noteDraft, setNoteDraft] = useState(initial.note);
  const [preferenceDraft, setPreferenceDraft] = useState(initial.preference);
  const [report, setReport] = useState("september");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const detailHeadingRef = useRef<HTMLHeadingElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<string | null>(null);
  const visitId = useId();
  const focusScreen = useRef(false);
  const closeFocus = useRef(false);
  const visitDraftStarted = useRef(false);
  const preferenceLabel = useId();
  const reportLabel = useId();
  useEffect(() => {
    try { const raw = localStorage.getItem(storageKey); const stored = raw && readRecord(raw); if (stored) setRecord(stored); }
    catch { /* The sample remains usable in this tab. */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(storageKey, JSON.stringify(record)); setSaved("Saved in this browser"); }
    catch { setSaved("Kept in this tab only"); }
  }, [record, ready]);
  useEffect(() => {
    if (detail) detailHeadingRef.current?.focus();
    else if (closeFocus.current) { if (returnFocus.current) document.getElementById(returnFocus.current)?.focus(); closeFocus.current = false; }
  }, [detail]);
  useEffect(() => {
    if (focusScreen.current) { headingRef.current?.focus(); scrollRef.current?.scrollTo({ top: 0 }); focusScreen.current = false; }
  }, [screen]);
  const navigate = (next: Screen) => { if (screen !== next) focusScreen.current = true; setScreen(next); setNotice(""); };
  const openVisit = (origin: HTMLElement) => {
    returnFocus.current = origin.id;
    if (!visitDraftStarted.current) { setNoteDraft(record.note); setPreferenceDraft(record.preference); visitDraftStarted.current = true; }
    setNotice(""); setDetail(true);
  };
  const closeVisit = () => { closeFocus.current = true; setDetail(false); };
  const preference = preferences.find(option => option.value === record.preference)?.label ?? "No preference saved";
  const visitCard = <AppointmentCard appointmentTitle="A conversation about you" dateLabel="Saturday, 12 September" timeLabel="10:30–11:00" timeZone="UTC+01" clinician="Dr. Sam Ellis · Fictional clinician" location="Northmere practice" status="Sample appointment">
    <Button id={`${visitId}-${screen}-appointment`} type="button" variant="ghost" onClick={event => openVisit(event.currentTarget)}><Icon name="edit" />Prepare for your visit</Button>
  </AppointmentCard>;

  return <section className="pt-app" aria-label="Patient care workspace" data-screen={screen} data-detail={detail}>
    <header className="pt-header"><div className="pt-brand"><span className="pt-brand-mark"><Icon name="activity" size={24} /></span><div><strong>Northmere care</strong><span>A little more connected</span></div></div><span className="pt-header-date">Monday, 7 September</span><span className="pt-avatar" role="img" aria-label="Alex Morgan">AM</span></header>
    <div className="pt-body">
      <aside className="pt-rail" aria-label="Patient navigation"><div className="pt-rail-label">Your space</div><nav aria-label="Patient sections">{navigation.map(item => <Button key={item.id} type="button" variant="ghost" aria-current={screen === item.id ? "page" : undefined} onClick={() => { if (detail) closeVisit(); navigate(item.id); }}><Icon name={item.icon} />{item.label}</Button>)}</nav><Card className="pt-rail-note"><Icon name="shield" /><strong>A fictional care record</strong><p>Changes stay local. No clinic, device, or health record is connected.</p></Card><div className="pt-rail-foot">Patient example<br /><span>P / 0241</span></div></aside>
      {!detail && <div className="pt-content" ref={scrollRef}>
        {screen === "overview" && <>
          <div className="pt-welcome"><div><span className="pt-eyebrow">Your Monday overview</span><h2 ref={headingRef} tabIndex={-1}>Good morning, Alex</h2><p>A little room for your health, and the rest of your day.</p></div><span className="pt-date-block" aria-hidden="true"><strong>07</strong><span>September</span></span></div>
          <div className="pt-overview-grid"><div className="pt-rings-region"><ActivityRings label="Your personal rhythm" goals={[{ id: "move", label: "Movement", current: 24, target: 40, unit: "min" }, { id: "outside", label: "Time outside", current: 18, target: 30, unit: "min" }, { id: "pause", label: "Mindful pauses", current: 2, target: 3, unit: "pauses" }]} description="Fictional activity records and personal targets." /></div><div className="pt-appointment-region"><span className="pt-eyebrow">Next in your calendar</span>{visitCard}</div></div>
          <div className="pt-section-head"><h3>Latest readings</h3><Button type="button" variant="ghost" onClick={() => navigate("readings")}>View readings<Icon name="arrow-right" /></Button></div>
          <div className="pt-metrics"><HealthMetric label="Resting heart rate" value={64} unit="bpm" timeLabel="7 Sep · 08:15 UTC+01" source="Sample wearable" /><HealthMetric label="Sleep recorded" value="7 h 35" unit="min" timeLabel="7 Sep · 07:00 UTC+01" source="Sample sleep log" /><HealthMetric label="Steps recorded" value="4,280" unit="steps" timeLabel="7 Sep · 11:30 UTC+01" source="Sample wearable" /></div>
          <div className="pt-profile-region"><PatientBanner patientName="Alex Morgan" identifiers={[{ id: "birth", label: "Date of birth", value: "16 April 1990" }, { id: "record", label: "Sample record", value: "P / 0241" }]} contextItems={[{ id: "team", label: "Care team", value: "Northmere practice · Fictional" }, { id: "allergy", label: "Allergy history", value: "Not supplied in this demo" }]} /></div>
        </>}
        {screen === "readings" && <>
          <div className="pt-welcome"><div><span className="pt-eyebrow">Your recorded information</span><h2 ref={headingRef} tabIndex={-1}>A closer look</h2><p>Sample observations, with the source and record status kept in view.</p></div></div>
          <div className="pt-metrics pt-reading-metrics"><HealthMetric label="Resting heart rate" value={64} unit="bpm" timeLabel="7 Sep · 08:15 UTC+01" source="Sample wearable" /><HealthMetric label="Blood pressure" value="118 / 76" unit="mmHg" timeLabel="4 Sep · 09:00 UTC+01" source="Sample practice record" /></div>
          <div className="pt-lab-head"><div><h3>Laboratory records</h3><p>Fictional results, not a medical assessment.</p></div><div className="pt-select-field"><span id={reportLabel}>Report</span><Select aria-labelledby={reportLabel} fullWidth value={report} options={[{ value: "september", label: "4 September 2026" }, { value: "august", label: "8 August 2026" }]} onValueChange={setReport} /></div></div>
          <LabResults label={`${report === "september" ? "September" : "August"} sample laboratory results`} results={report === "september" ? reports : [{ id: "haemoglobin-aug", name: "Haemoglobin", value: 13.8, unit: "g/dL", minimum: 12, maximum: 16, rangeLabel: "Sample lab supplied range: 12–16 g/dL", timeLabel: "8 August 2026 · 09:20 UTC+01", note: "Fictional laboratory record. Compare supplied records with your clinician." }]} />
          <Card className="pt-reading-note"><Icon name="clipboard" size={24} /><div><h3>Make space for your questions</h3><p>Keep a note beside your next appointment.</p></div><Button id={`${visitId}-readings-note`} type="button" variant="ghost" onClick={event => openVisit(event.currentTarget)}>Write a visit note<Icon name="arrow-right" /></Button></Card>
        </>}
        {screen === "care" && <>
          <div className="pt-welcome"><div><span className="pt-eyebrow">Before your next conversation</span><h2 ref={headingRef} tabIndex={-1}>Care, one step at a time</h2><p>A few personal preparations and your sample medication record.</p></div></div>
          <div className="pt-care-grid"><div><h3 className="pt-subheading">Your preparations</h3><CarePlan description="Personal tasks in this demo. Changes are recorded locally." tasks={[
            { id: "questions", title: "Write down your questions", owner: "You", dueLabel: "Before 12 September", status: record.questions ? "Recorded complete locally" : "Not yet recorded complete", completed: record.questions },
            { id: "list", title: "Prepare a current medicine list", owner: "You", dueLabel: "Before 12 September", status: record.list ? "Recorded complete locally" : "Not yet recorded complete", completed: record.list },
          ]} onCompletedChange={(id, completed) => { setRecord(current => ({ ...current, [id]: completed })); setNotice(`Preparation ${completed ? "recorded complete" : "marked incomplete"} locally.`); }} /></div><div className="pt-care-visit">{visitCard}<div className="pt-saved-note"><span className="pt-eyebrow">Your saved visit note</span><p>{record.note || "No note saved yet."}</p><span className="pt-preference">Local preference: {preference}</span><Button id={`${visitId}-care-note`} type="button" variant="ghost" onClick={event => openVisit(event.currentTarget)}>Edit visit note<Icon name="edit" /></Button></div></div></div>
          <div className="pt-medication"><h3 className="pt-subheading">Medication record</h3><MedicationSchedule dateLabel="Monday, 7 September · Sample schedule" timeZone="UTC+01" items={[{ id: "sample-dose", name: "Sample medication", dose: "1 tablet · Fictional prescription", timeLabel: "08:00", status: record.taken ? "Recorded as taken locally" : "No dose record supplied", instructions: "A demonstration entry; no medicine is prescribed by this example.", actions: [{ id: record.taken ? "clear" : "taken", label: record.taken ? "Clear local dose record" : "Record sample as taken" }] }]} onAction={(_, action) => { setRecord(current => ({ ...current, taken: action === "taken" })); setNotice(action === "taken" ? "Sample dose recorded as taken locally." : "Local dose record cleared."); }} /></div>
        </>}
      </div>}
      {detail && <form className="pt-detail" onSubmit={event => { event.preventDefault(); setRecord(current => ({ ...current, note: noteDraft.trim(), preference: preferenceDraft })); visitDraftStarted.current = false; closeVisit(); setNotice("Visit note and preference saved locally. Nothing was sent to the practice."); }}>
        <div className="pt-detail-head"><Button type="button" variant="ghost" onClick={closeVisit}><Icon name="arrow-left" />Back</Button><span>Visit preparation</span><span className="pt-detail-date">12 September</span></div>
        <div className="pt-detail-scroll"><span className="pt-eyebrow">A conversation about you</span><h2 ref={detailHeadingRef} tabIndex={-1}>What’s on your mind?</h2><p className="pt-detail-intro">Keep a few thoughts ready for Dr. Sam Ellis. Your note stays in this browser.</p>
          <p className="pt-draft-status">{noteDraft.trim() !== record.note || preferenceDraft !== record.preference ? "Unsaved draft · kept in this tab when you go back" : "Saved note · edit below and save your changes"}</p>
          <Textarea label="Your visit note" name="visitNote" value={noteDraft} maxLength={2000} onChange={event => setNoteDraft(event.currentTarget.value)} rows={6} feedback={`${noteDraft.length} / 2,000 characters · Use fictional information`} />
          <div className="pt-visit-summary"><Icon name="calendar" size={24} /><div><strong>Saturday, 12 September · 10:30</strong><span>Northmere practice · UTC+01</span></div><span>Sample appointment</span></div>
          <div className="pt-preference-field"><span id={preferenceLabel}>Preferred conversation format</span><Select aria-labelledby={preferenceLabel} name="visitPreference" fullWidth value={preferenceDraft} options={preferences} onValueChange={setPreferenceDraft} /><p>This saves a personal preference only. The sample appointment is unchanged.</p></div>
          <Card className="pt-detail-note"><Icon name="shield" /><p>Nothing is sent to a clinician. You can edit or clear this note whenever you return to the demo.</p></Card>
        </div>
        <div className="pt-detail-actions"><Button type="button" variant="ghost" disabled={noteDraft.length === 0} onClick={() => { setNoteDraft(""); setNotice("Note cleared in the editor. Save to keep this change."); }}>Clear note</Button><Button type="submit" disabled={!ready}>Save note<Icon name="check" /></Button></div>
      </form>}
    </div>
    {!detail && <nav className="pt-mobile-nav" aria-label="Patient sections on mobile">{navigation.map(item => <Button key={item.id} type="button" variant="ghost" aria-current={screen === item.id ? "page" : undefined} onClick={() => navigate(item.id)}><Icon name={item.icon} /><span>{item.label}</span></Button>)}</nav>}
    <footer className="pt-footer"><span><span className="pt-save-dot" />{saved}</span><span>Fictional records · No clinical connection</span></footer>
    <span className="pt-announcement" role="status">{notice}</span>
  </section>;
}
