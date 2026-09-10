"use client";

import * as React from "react";
import { Icon } from "@noorddev/vlak-react";
import type { IconName } from "@noorddev/vlak-react";
import { PlatformSwitch } from "./platform-controls";
import "./ios-clock.css";

type ClockTab = "world" | "alarm" | "stopwatch" | "timer";
type Timer = { id: number; label: string; duration: number; remaining: number; deadline: number | null; complete: boolean };
type Alarm = { id: number; hour: number; minute: number; label: string; days: number[]; enabled: boolean; snooze: boolean };
type AlarmDraft = Omit<Alarm, "id" | "enabled"> & { id?: number };
const tabs: { id: ClockTab; label: string; icon: IconName }[] = [{ id: "world", label: "World Clock", icon: "globe" }, { id: "alarm", label: "Alarm", icon: "bell" }, { id: "stopwatch", label: "Stopwatch", icon: "clock" }, { id: "timer", label: "Timers", icon: "timer" }];
const cities = [{ name: "Amsterdam", zone: "Europe/Amsterdam" }, { name: "London", zone: "Europe/London" }, { name: "New York", zone: "America/New_York" }, { name: "Los Angeles", zone: "America/Los_Angeles" }, { name: "Tokyo", zone: "Asia/Tokyo" }, { name: "Sydney", zone: "Australia/Sydney" }, { name: "Singapore", zone: "Asia/Singapore" }, { name: "Paris", zone: "Europe/Paris" }];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const pad = (value: number) => String(value).padStart(2, "0");
function durationText(milliseconds: number, hundredths = false) {
  const seconds = Math.max(0, hundredths ? Math.floor(milliseconds / 1000) : Math.ceil(milliseconds / 1000));
  return `${seconds >= 3600 ? `${pad(Math.floor(seconds / 3600))}:` : ""}${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}${hundredths ? `.${pad(Math.floor(milliseconds / 10) % 100)}` : ""}`;
}
function TimeColumn({ label, value, maximum, onChange }: { label: string; value: number; maximum: number; onChange: (value: number) => void }) {
  const wheel = React.useRef<HTMLDivElement>(null), settle = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = React.useId();
  const current = React.useRef(value), change = React.useRef(onChange);
  current.current = value; change.current = onChange;
  const typeahead = React.useRef({ text: "", time: 0 });
  React.useLayoutEffect(() => { wheel.current?.scrollTo({ top: value * 44, behavior: "instant" }); }, [value]);
  React.useEffect(() => { const observer = new ResizeObserver(() => { if (wheel.current?.clientHeight) wheel.current.scrollTo({ top: current.current * 44, behavior: "instant" }); }); if (wheel.current) observer.observe(wheel.current); return () => observer.disconnect(); }, []);
  React.useEffect(() => () => { if (settle.current) clearTimeout(settle.current); }, []);
  function choose(next: number) { if (settle.current) clearTimeout(settle.current); change.current(Math.max(0, Math.min(maximum, next))); }
  return <div className="mo-ios-clock-column"><div ref={wheel} className="mo-ios-clock-wheel" role="listbox" aria-label={label} aria-orientation="vertical" aria-activedescendant={`${id}-${value}`} tabIndex={0}
    onScroll={() => { if (settle.current) clearTimeout(settle.current); settle.current = setTimeout(() => { const next = Math.max(0, Math.min(maximum, Math.round((wheel.current?.scrollTop ?? 0) / 44))); if (next !== current.current) change.current(next); }, 100); }}
    onKeyDown={event => {
      const steps: Record<string, number> = { ArrowUp: -1, ArrowDown: 1, PageUp: -5, PageDown: 5, Home: -maximum, End: maximum };
      if (event.key in steps) { event.preventDefault(); typeahead.current.text = ""; choose(value + steps[event.key]!); }
      else if (/^\d$/.test(event.key)) { event.preventDefault(); const timestamp = Date.now(); const text = (timestamp - typeahead.current.time < 700 ? typeahead.current.text : "") + event.key; typeahead.current = { text, time: timestamp }; const next = Number(text); choose(next > maximum ? Number(event.key) : next); }
    }}>
    {Array.from({ length: maximum + 1 }, (_, index) => <div key={index} id={`${id}-${index}`} role="option" aria-selected={index === value} tabIndex={-1} className="mo-ios-clock-wheel-option" onClick={() => { choose(index); wheel.current?.focus({ preventScroll: true }); }}>{pad(index)}</div>)}
  </div><span>{label.split(" ").at(-1)}</span></div>;
}

/** Clock anatomy follows Apple's iPhone guide: world clocks, alarm rows,
 * stopwatch laps, and independently pausable timers. Timing uses deadlines,
 * never counted animation frames. Keep this host mounted when another app opens.
 * https://support.apple.com/guide/iphone/iph8241d6b2a/ios */
export function IOSClock({ active, onAnnounce, onTimerComplete }: { active: boolean; onAnnounce: (message: string) => void; onTimerComplete?: (label: string) => void }) {
  const [tab, setTab] = React.useState<ClockTab>("timer");
  const [now, setNow] = React.useState(0);
  const [hours, setHours] = React.useState(0), [minutes, setMinutes] = React.useState(1), [seconds, setSeconds] = React.useState(0);
  const [timerLabel, setTimerLabel] = React.useState("");
  const [timers, setTimers] = React.useState<Timer[]>([]);
  const [recent, setRecent] = React.useState<number[]>([300000, 600000, 900000]);
  const [stopwatch, setStopwatch] = React.useState({ elapsed: 0, started: null as number | null });
  const [laps, setLaps] = React.useState<number[]>([]);
  const [alarms, setAlarms] = React.useState<Alarm[]>([{ id: 0, hour: 7, minute: 30, label: "Wake up", days: [1, 2, 3, 4, 5], enabled: false, snooze: true }]);
  const [alarmDraft, setAlarmDraft] = React.useState<AlarmDraft | null>(null);
  const [alarmQueue, setAlarmQueue] = React.useState<Alarm[]>([]);
  const ringing = alarmQueue[0] ?? null;
  const snoozed = React.useRef<{ alarm: Alarm; deadline: number }[]>([]);
  const alarmMinute = React.useRef("");
  const [world, setWorld] = React.useState(["Amsterdam", "New York", "Tokyo"]);
  const [cityPicker, setCityPicker] = React.useState(false), [citySearch, setCitySearch] = React.useState("");
  const sequence = React.useRef(0);
  const announce = React.useRef(onAnnounce);
  const complete = React.useRef(onTimerComplete);
  const heading = React.useRef<HTMLHeadingElement>(null);
  const scroll = React.useRef<HTMLDivElement>(null);
  const previousActive = React.useRef(false);
  const alarmFormId = React.useId();
  React.useEffect(() => { announce.current = onAnnounce; }, [onAnnounce]);
  React.useEffect(() => { complete.current = onTimerComplete; }, [onTimerComplete]);
  React.useEffect(() => {
    if (active && !previousActive.current) heading.current?.focus({ preventScroll: true });
    previousActive.current = active;
  }, [active]);
  const editingAlarm = alarmDraft !== null;
  React.useLayoutEffect(() => { scroll.current?.scrollTo({ top: 0, behavior: "instant" }); }, [tab, editingAlarm, cityPicker]);
  const ticking = timers.some(timer => timer.deadline !== null) || stopwatch.started !== null || alarms.some(alarm => alarm.enabled) || ringing !== null || snoozed.current.length > 0;
  React.useEffect(() => {
    setNow(Date.now());
    if (!active && !ticking) return;
    const interval = setInterval(() => setNow(Date.now()), active && tab === "stopwatch" && stopwatch.started !== null ? 40 : 200);
    return () => clearInterval(interval);
  }, [active, ticking, tab, stopwatch.started]);
  React.useEffect(() => {
    const expired = timers.filter(timer => timer.deadline !== null && timer.deadline <= now);
    if (expired.length) {
      setTimers(current => current.map(timer => expired.some(row => row.id === timer.id) ? { ...timer, deadline: null, remaining: 0, complete: true } : timer));
      announce.current(`Timer complete${expired[0]?.label ? `: ${expired[0].label}` : ""}`);
      for (const timer of expired) complete.current?.(timer.label);
    }
    if (!now) return;
    const pending = snoozed.current.filter(item => item.deadline <= now).map(item => item.alarm);
    snoozed.current = snoozed.current.filter(item => item.deadline > now);
    const date = new Date(now), minute = `${date.toDateString()} ${date.getHours()}:${date.getMinutes()}`;
    if (minute !== alarmMinute.current) {
      alarmMinute.current = minute;
      const due = alarms.filter(alarm => alarm.enabled && alarm.hour === date.getHours() && alarm.minute === date.getMinutes() && (!alarm.days.length || alarm.days.includes(date.getDay())));
      pending.push(...due);
      const oneShot = new Set(due.filter(alarm => !alarm.days.length).map(alarm => alarm.id));
      if (oneShot.size) setAlarms(current => current.map(alarm => oneShot.has(alarm.id) ? { ...alarm, enabled: false } : alarm));
    }
    if (pending.length) {
      setAlarmQueue(current => [...current, ...pending]);
      announce.current(`${pending.length === 1 ? "Alarm" : "Alarms"}: ${pending.map(alarm => alarm.label).join(", ")}`);
    }
  }, [now, timers, alarms]);
  function changeTab(next: ClockTab) { setTab(next); setAlarmDraft(null); setCityPicker(false); }
  function startTimer(duration: number, label = timerLabel.trim()) {
    if (duration <= 0) return;
    const timestamp = Date.now(); setNow(timestamp);
    setTimers(current => [...current, { id: ++sequence.current, label, duration, remaining: duration, deadline: timestamp + duration, complete: false }]);
    setRecent(current => [duration, ...current.filter(value => value !== duration)].slice(0, 3));
    announce.current(label ? `${label} timer started` : "Timer started");
  }
  function toggleTimer(timer: Timer) {
    const timestamp = Date.now(); setNow(timestamp);
    setTimers(current => current.map(row => row.id !== timer.id ? row : row.deadline === null ? { ...row, deadline: timestamp + row.remaining } : { ...row, remaining: Math.max(0, row.deadline - timestamp), deadline: null }));
  }
  const elapsed = stopwatch.elapsed + (stopwatch.started === null ? 0 : Math.max(0, now - stopwatch.started));
  function toggleStopwatch() {
    const timestamp = Date.now(); setNow(timestamp);
    setStopwatch(current => current.started === null ? { ...current, started: timestamp } : { elapsed: current.elapsed + timestamp - current.started, started: null });
  }
  function openAlarm(alarm?: Alarm) { setAlarmDraft(alarm ? { ...alarm, days: [...alarm.days] } : { hour: 7, minute: 30, label: "Alarm", days: [], snooze: true }); }
  function saveAlarm(event: React.FormEvent) {
    event.preventDefault(); if (!alarmDraft) return;
    const saved: Alarm = { ...alarmDraft, id: alarmDraft.id ?? ++sequence.current, label: alarmDraft.label.trim() || "Alarm", enabled: true };
    setAlarms(current => alarmDraft.id === undefined ? [...current, saved] : current.map(alarm => alarm.id === saved.id ? saved : alarm));
    setAlarmDraft(null); announce.current("Alarm saved locally"); heading.current?.focus({ preventScroll: true });
  }
  const title = alarmDraft ? alarmDraft.id === undefined ? "Add alarm" : "Edit alarm" : cityPicker ? "Choose a city" : tabs.find(row => row.id === tab)!.label;
  return <div className="mo-ios-clock" hidden={!active} data-clock-tab={tab} data-clock-editor={alarmDraft ? "alarm" : cityPicker ? "city" : undefined} onKeyDown={event => { if (event.key === "Escape" && (alarmDraft || cityPicker)) { event.preventDefault(); event.stopPropagation(); setAlarmDraft(null); setCityPicker(false); heading.current?.focus({ preventScroll: true }); } }}>
    <header className="mo-ios-clock-header"><h2 ref={heading} tabIndex={-1}>{title}</h2><div className="mo-ios-clock-header-actions">
      {alarmDraft ? <><button type="button" aria-label="Cancel alarm" onClick={() => { setAlarmDraft(null); heading.current?.focus({ preventScroll: true }); }}><Icon name="x" size={24} /></button><button type="submit" form={alarmFormId} aria-label="Save alarm"><Icon name="check" size={24} /></button></> : cityPicker ? <button type="button" aria-label="Cancel city search" onClick={() => setCityPicker(false)}><Icon name="x" size={24} /></button> : tab === "alarm" || tab === "world" ? <button type="button" aria-label={tab === "alarm" ? "New alarm" : "Add city"} onClick={() => tab === "alarm" ? openAlarm() : (setCitySearch(""), setCityPicker(true))}><Icon name="plus" size={24} /></button> : null}
    </div></header>
    <div className="mo-ios-clock-scroll" ref={scroll} tabIndex={0}>
      {ringing && <div className="mo-ios-clock-alert" role="status"><Icon name="bell" size={24} /><strong>{ringing.label}</strong><span>{pad(ringing.hour)}:{pad(ringing.minute)}</span><div>{ringing.snooze && <button type="button" onClick={() => { snoozed.current.push({ alarm: ringing, deadline: Date.now() + 540000 }); setAlarmQueue(current => current.slice(1)); }}>Snooze 9 minutes</button>}<button type="button" onClick={() => setAlarmQueue(current => current.slice(1))}>Dismiss alarm</button></div></div>}
      {alarmDraft ? <form id={alarmFormId} className="mo-ios-clock-alarm-form" onSubmit={saveAlarm}>
        <div className="mo-ios-clock-picker"><TimeColumn label="Alarm hours" value={alarmDraft.hour} maximum={23} onChange={hour => setAlarmDraft({ ...alarmDraft, hour })} /><TimeColumn label="Alarm minutes" value={alarmDraft.minute} maximum={59} onChange={minute => setAlarmDraft({ ...alarmDraft, minute })} /></div>
        <label className="mo-ios-clock-field"><span>Label</span><input aria-label="Alarm label" value={alarmDraft.label} maxLength={80} onChange={event => setAlarmDraft({ ...alarmDraft, label: event.target.value })} /></label>
        <fieldset className="mo-ios-clock-repeat"><legend>Repeat</legend>{days.map((day, index) => <label key={day}><span>{day}</span><input type="checkbox" checked={alarmDraft.days.includes(index)} onChange={event => setAlarmDraft({ ...alarmDraft, days: event.target.checked ? [...alarmDraft.days, index] : alarmDraft.days.filter(value => value !== index) })} /></label>)}</fieldset>
        <label className="mo-ios-clock-snooze"><span>Snooze</span><input type="checkbox" checked={alarmDraft.snooze} onChange={event => setAlarmDraft({ ...alarmDraft, snooze: event.target.checked })} /></label>
        {alarmDraft.id !== undefined && <button type="button" className="mo-ios-clock-delete" onClick={() => { setAlarms(current => current.filter(alarm => alarm.id !== alarmDraft.id)); setAlarmDraft(null); announce.current("Alarm deleted"); heading.current?.focus({ preventScroll: true }); }}>Delete alarm</button>}
        <p className="mo-ios-clock-footnote">Alerts appear while this tab is open.</p>
      </form> : tab === "timer" ? <>
        <form className="mo-ios-clock-timer-form" onSubmit={event => { event.preventDefault(); startTimer((hours * 3600 + minutes * 60 + seconds) * 1000); }}>
          <div className="mo-ios-clock-picker"><TimeColumn label="Timer hours" value={hours} maximum={23} onChange={setHours} /><TimeColumn label="Timer minutes" value={minutes} maximum={59} onChange={setMinutes} /><TimeColumn label="Timer seconds" value={seconds} maximum={59} onChange={setSeconds} /></div>
          <label className="mo-ios-clock-field"><span>Label</span><input aria-label="Timer label" placeholder="Timer" value={timerLabel} maxLength={80} onChange={event => setTimerLabel(event.target.value)} /></label>
          <div className="mo-ios-clock-round-actions"><button type="button" aria-label="Reset timer duration" onClick={() => { setHours(0); setMinutes(0); setSeconds(0); setTimerLabel(""); }}>Reset</button><button className="mo-ios-clock-primary" type="submit" aria-label="Start timer" disabled={hours + minutes + seconds === 0}>Start</button></div>
        </form>
        {timers.length > 0 && <section aria-label="Active timers" className="mo-ios-clock-timers">{timers.map(timer => { const remaining = timer.deadline === null ? timer.remaining : Math.max(0, timer.deadline - now); return <article key={timer.id} className="mo-ios-clock-timer" data-timer-state={timer.complete ? "complete" : timer.deadline === null ? "paused" : "running"}>
          <div className="mo-ios-clock-ring" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" /><circle cx="32" cy="32" r="27" pathLength="100" strokeDasharray={`${remaining / timer.duration * 100} 100`} /></svg></div>
          <div><span>{timer.complete ? "Timer complete" : timer.label || "Timer"}</span><div role="timer" aria-label="Time remaining" className="mo-ios-clock-countdown">{durationText(remaining)}</div></div>
          <div className="mo-ios-clock-timer-actions">{!timer.complete && <button type="button" aria-label={timer.deadline === null ? "Resume timer" : "Pause timer"} onClick={() => toggleTimer(timer)}><Icon name={timer.deadline === null ? "play" : "pause"} size={24} /></button>}<button type="button" aria-label={timer.complete ? "Dismiss timer" : "Cancel timer"} onClick={() => setTimers(current => current.filter(row => row.id !== timer.id))}><Icon name="x" size={24} /></button></div>
        </article>; })}</section>}
        <section className="mo-ios-clock-recents" aria-label="Recent timers"><h3>Recents</h3>{recent.map(duration => <button type="button" key={duration} aria-label={`Start ${durationText(duration)} timer`} onClick={() => startTimer(duration, "")}><span>{durationText(duration)}</span><Icon name="play" size={24} /></button>)}</section>
      </> : tab === "stopwatch" ? <>
        <div className="mo-ios-clock-stopwatch" role="timer" aria-label="Stopwatch elapsed">{durationText(elapsed, true)}</div>
        <div className="mo-ios-clock-round-actions"><button type="button" disabled={stopwatch.started === null && elapsed === 0} onClick={() => stopwatch.started !== null ? setLaps(current => [...current, stopwatch.elapsed + Date.now() - stopwatch.started!]) : (setStopwatch({ elapsed: 0, started: null }), setLaps([]))}>{stopwatch.started !== null ? "Lap" : "Reset"}</button><button type="button" className="mo-ios-clock-primary" aria-label={stopwatch.started === null ? "Start stopwatch" : "Stop"} onClick={toggleStopwatch}>{stopwatch.started === null ? "Start" : "Stop"}</button></div>
        <ol className="mo-ios-clock-laps" aria-label="Recorded laps">{laps.map((lap, index) => ({ elapsed: lap - (laps[index - 1] ?? 0), number: index + 1 })).reverse().map(lap => <li key={lap.number}><span>Lap {lap.number}</span><span>{durationText(lap.elapsed, true)}</span></li>)}</ol>
      </> : tab === "alarm" ? <><div className="mo-ios-clock-alarm-list">{[...alarms].sort((a, b) => a.hour * 60 + a.minute - b.hour * 60 - b.minute).map(alarm => <div key={alarm.id} className="mo-ios-clock-alarm" data-enabled={alarm.enabled}><button type="button" aria-label={`Edit ${alarm.label} alarm`} onClick={() => openAlarm(alarm)}><strong>{pad(alarm.hour)}:{pad(alarm.minute)}</strong><span>{alarm.label}{alarm.days.length ? `, ${alarm.days.length === 7 ? "Every day" : [...alarm.days].sort().map(day => days[day]!.slice(0, 3)).join(", ")}` : ""}</span></button><PlatformSwitch aria-label={`${alarm.label} alarm enabled`} checked={alarm.enabled} onCheckedChange={enabled => setAlarms(current => current.map(row => row.id === alarm.id ? { ...row, enabled } : row))} /></div>)}</div><p className="mo-ios-clock-footnote">Alerts appear while this tab is open.</p></> : cityPicker ? <>
        <input type="search" className="mo-ios-clock-city-search" aria-label="Search cities" placeholder="Search" value={citySearch} onChange={event => setCitySearch(event.target.value)} />
        <div className="mo-ios-clock-cities">{cities.filter(city => !world.includes(city.name) && city.name.toLowerCase().includes(citySearch.toLowerCase())).map(city => <button type="button" key={city.name} onClick={() => { setWorld(current => [...current, city.name]); setCityPicker(false); announce.current(`${city.name} added`); }}>{city.name}<Icon name="plus" size={24} /></button>)}{!cities.some(city => !world.includes(city.name) && city.name.toLowerCase().includes(citySearch.toLowerCase())) && <p>No matching cities</p>}</div>
      </> : <div className="mo-ios-clock-world">{world.map(name => { const city = cities.find(row => row.name === name)!; const timestamp = now || Date.UTC(2026, 8, 8, 7, 41); const date = new Date(timestamp); return <article key={name}><div><span>{new Intl.DateTimeFormat("en-GB", { timeZone: city.zone, weekday: "long" }).format(date)}</span><h3>{name}</h3></div><time>{new Intl.DateTimeFormat("en-GB", { timeZone: city.zone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(date)}</time><button type="button" aria-label={`Remove ${name}`} onClick={() => setWorld(current => current.filter(value => value !== name))}><Icon name="minus" size={24} /></button></article>; })}</div>}
    </div>
    {!alarmDraft && !cityPicker && <nav className="mo-ios-clock-tabs" aria-label="Clock views">{tabs.map(row => <button type="button" key={row.id} aria-label={row.label} aria-pressed={tab === row.id} onClick={() => changeTab(row.id)}><Icon name={row.icon} size={24} /><span>{row.label}</span></button>)}</nav>}
  </div>;
}
