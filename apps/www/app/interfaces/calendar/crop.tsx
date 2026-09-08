import { Icon } from "@noorddev/vlak-react";
import "./crop.css";

const scheduled = new Set([8, 10, 14, 18, 22]);

export function CalendarCrop() {
  return <div className="cal-crop">
    <header><Icon name="calendar" size={16} /><strong>September 2026</strong><span>Month</span></header>
    <div className="cal-crop-weekdays">{["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(day => <span key={day}>{day}</span>)}</div>
    <div className="cal-crop-month">{Array.from({ length: 35 }, (_, index) => index).map(index => {
      const day = index === 0 ? 31 : index > 30 ? index - 30 : index;
      return <div key={`day-${index}`} data-outside={index === 0 || index > 30} data-selected={index === 8}><span>{day}</span>{scheduled.has(index) && <i />}</div>;
    })}</div>
    <div className="cal-crop-agenda"><span>Tuesday 8</span><div><time>10:00</time><strong>Studio review</strong><span>Work</span></div><div><time>14:00</time><strong>Focused work</strong><span>Personal</span></div></div>
  </div>;
}
