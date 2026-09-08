import type { ReactNode } from "react";
import type { IconName } from "@noorddev/vlak-react";

const cutout = "var(--mo-android-glyph-cutout, var(--mo-android-container-high))";

/** Original filled drawings for the themed Android launcher, not Google app artwork. */
export function AndroidAppGlyph({ id }: { id: string; icon?: IconName }) {
  let drawing: ReactNode;
  switch (id) {
    case "phone":
      drawing = <path d="M7.3 2.9c.9-.4 1.9 0 2.3.8l3.2 6.4c.4.8.2 1.6-.4 2.2l-2.8 2.5a23.8 23.8 0 0 0 7.6 7.6l2.5-2.8c.6-.6 1.4-.8 2.2-.4l6.4 3.2c.8.4 1.2 1.4.8 2.3-1 2.8-3.2 4.7-5.7 4.3C12.8 27.6 4.4 19.2 3 8.6c-.4-2.5 1.5-4.7 4.3-5.7Z" />;
      break;
    case "messages":
      drawing = <><path d="M7 4h18a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H11l-8 5V8a4 4 0 0 1 4-4Z" /><path d="M9 10h14v2H9zm0 5h14v2H9zm0 5h9v2H9z" fill={cutout} /></>;
      break;
    case "mail":
      drawing = <><rect x="2" y="5" width="28" height="22" rx="3" /><path d="m4 8 12 9L28 8" fill="none" stroke={cutout} strokeWidth="2.3" strokeLinejoin="round" /></>;
      break;
    case "calendar":
      drawing = <><rect x="3" y="4" width="26" height="26" rx="3" /><path d="M3 11h26" stroke={cutout} strokeWidth="2" /><path d="M10 2v5m12-5v5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /><text x="16" y="26" fill={cutout} fontFamily="Roboto, Arial, sans-serif" fontSize="16" fontWeight="500" textAnchor="middle">8</text></>;
      break;
    case "clock":
      drawing = <><circle cx="16" cy="16" r="14" /><path d="M16 7v10l6 4" fill="none" stroke={cutout} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></>;
      break;
    case "notes":
      drawing = <><path d="M6 2h14l8 8v17a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Z" /><path d="M20 2v8h8M9 16h13M9 21h13M9 26h8" fill="none" stroke={cutout} strokeWidth="2" strokeLinejoin="round" /></>;
      break;
    case "photos":
      drawing = <><path d="M3 8h2v19h20v2H5a2 2 0 0 1-2-2Z" opacity=".55" /><rect x="7" y="3" width="23" height="22" rx="2" /><circle cx="23.5" cy="9.5" r="2.5" fill={cutout} /><path d="m10 21 6-8 4 5 3-4 4 7Z" fill={cutout} /></>;
      break;
    case "camera":
      drawing = <><path d="M5 7h5l2-4h8l2 4h5a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3Z" /><circle cx="16" cy="18" r="7" fill={cutout} /><circle cx="16" cy="18" r="4.5" /><circle cx="25.5" cy="11.5" r="1.5" fill={cutout} /></>;
      break;
    case "files":
      drawing = <><path d="M3 5h10l3 4h13v16a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V8a3 3 0 0 1 1-3Z" opacity=".5" /><path d="M2 12h28v13a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3Z" /></>;
      break;
    case "calculator":
      drawing = <><rect x="5" y="1" width="22" height="30" rx="3" /><rect x="9" y="5" width="14" height="6" rx="1" fill={cutout} /><path d="M9 16h5m-2.5-2.5v5m6-2.5h5M9 23l5 5m0-5-5 5m9-4h5m-5 3h5" fill="none" stroke={cutout} strokeWidth="1.8" /></>;
      break;
    case "weather":
      drawing = <><g opacity=".55"><circle cx="11" cy="11" r="6" />{[0, 45, 90, 135, 180, 225, 270, 315].map(angle => <rect key={angle} x="10" y="0" width="2" height="3" rx="1" transform={`rotate(${angle} 11 11)`} />)}</g><path d="M10 29a7 7 0 0 1-1-13.9A9 9 0 0 1 26 14a7.5 7.5 0 0 1-1.5 15Z" /></>;
      break;
    case "maps":
      drawing = <><path d="m2 7 9-4v24l-9 4Zm10-4 9 4v24l-9-4Zm10 4 8-4v24l-8 4Z" opacity=".45" /><path d="M25 9c0 6-9 16-9 16S7 15 7 9a9 9 0 0 1 18 0Z" /><circle cx="16" cy="9" r="3.5" fill={cutout} /></>;
      break;
    case "music":
      drawing = <><path d="M13 6 29 2v20.5c0 3-2.5 5.5-6 5.5-3 0-5-1.5-5-4s2.7-4.5 6-4.5h2V9l-10 2.5v14C16 29 13 31 9.5 31 6.4 31 4 29.3 4 26.7c0-2.8 2.8-5 6.5-5H13Z" /></>;
      break;
    case "browser":
      drawing = <><circle cx="16" cy="16" r="14" /><g fill="none" stroke={cutout} strokeWidth="1.8"><ellipse cx="16" cy="16" rx="6" ry="13" /><path d="M3 11h26M3 21h26" /></g></>;
      break;
    case "contacts":
      drawing = <><rect x="4" y="2" width="23" height="28" rx="3" /><path d="M28 7h3v5h-3zm0 8h3v5h-3zm0 8h3v5h-3z" opacity=".55" /><circle cx="15.5" cy="11" r="4" fill={cutout} /><path d="M8 25v-2a7.5 7.5 0 0 1 15 0v2Z" fill={cutout} /></>;
      break;
    case "settings":
      drawing = <><g>{Array.from({ length: 8 }, (_, index) => <rect key={index} x="13" y="1" width="6" height="8" rx="1" transform={`rotate(${index * 45} 16 16)`} />)}<circle cx="16" cy="16" r="11.5" /></g><circle cx="16" cy="16" r="5" fill={cutout} /></>;
      break;
    default:
      drawing = <>{[4, 18].flatMap(x => [4, 18].map(y => <rect key={`${x}-${y}`} x={x} y={y} width="10" height="10" rx="2" />))}</>;
  }
  return <svg className="mo-android-app-glyph" viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true" focusable="false">{drawing}</svg>;
}
