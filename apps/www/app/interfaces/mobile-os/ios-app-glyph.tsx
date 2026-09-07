import { Icon } from "@noorddev/vlak-react";
import type { IconName } from "@noorddev/vlak-react";

/** Keep the familiar launcher faces; shared app symbols use Vlak's hairline family. */
export function IOSAppGlyph({ id, icon }: { id: string; icon: IconName }) {
  if (id === "calendar") return <span className="mo-ios-calendar-icon" aria-hidden="true"><span>Tue</span><strong>8</strong></span>;
  if (id === "notes") return <span className="mo-ios-notes-icon" aria-hidden="true"><b /><b /><b /></span>;
  if (id === "clock") return <svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="25" fill="none" stroke="currentColor" strokeWidth="1.25" />{Array.from({ length: 12 }, (_, i) => <path key={i} d="M30 7v4" stroke="currentColor" strokeWidth="1.25" transform={`rotate(${i * 30} 30 30)`} />)}<path d="M30 15v15l-10 7" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="30" cy="30" r="1.5" fill="currentColor" /></svg>;
  if (id === "photos") return <svg viewBox="0 0 60 60" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx="30" cy="18" rx="7.5" ry="12" fill="none" stroke="currentColor" strokeWidth="1.25" opacity=".65" transform={`rotate(${i * 45} 30 30)`} />)}<circle cx="30" cy="30" r="4" fill="var(--bg)" stroke="currentColor" strokeWidth="1.25" /></svg>;
  if (id === "browser") return <svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="24" fill="none" stroke="currentColor" strokeWidth="1.25" />{Array.from({ length: 12 }, (_, i) => <path key={i} d="M30 9v3" stroke="currentColor" strokeWidth="1.25" transform={`rotate(${i * 30} 30 30)`} />)}<path d="m42 15-8 19-16 11 8-19Z" fill="none" stroke="currentColor" strokeWidth="1.25" /><path d="m42 15-8 19-8-8Z" fill="currentColor" /></svg>;
  if (id === "phone") return <svg viewBox="0 0 60 60" aria-hidden="true"><path d="m17 9 8 12c1 2 0 3-2 5l-3 2c3 6 6 9 12 12l3-4c1-2 3-2 5-1l11 7c2 1 2 3 0 5l-4 5c-2 2-6 2-10 1C22 48 11 37 7 23c-1-4-1-7 1-9l5-5c1-1 3-1 4 0Z" fill="none" stroke="currentColor" strokeWidth="1.25" /></svg>;
  return <Icon name={icon} size={24} style={{ width: 32, height: 32 }} />;
}
