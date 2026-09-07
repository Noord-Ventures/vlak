import type { ComponentProps, ReactNode } from "react";
import { Icon } from "@noorddev/vlak-react";
import "./workflow-crops.css";

function Frame({ icon, title, context, children, footer }: { icon: ComponentProps<typeof Icon>["name"]; title: string; context: string; children: ReactNode; footer: ReactNode }) {
  return <div className="if-crop-scene wf-crop"><header><Icon name={icon} size={16} /><strong>{title}</strong><span>{context}</span></header><div className="wf-crop-body">{children}</div><footer>{footer}</footer></div>;
}

export function ChatCrop() {
  return <Frame icon="message" title="Research notebook" context="3 conversations" footer={<><span>Ask a follow-up</span><Icon name="arrow-up" size={16} /></>}><div className="wf-crop-message"><span>Product thinking</span><strong>A better first five minutes</strong><p>Start with one useful outcome. Bring in a note and turn it into a question for the team.</p><div><Icon name="check" size={12} />Response ready</div></div></Frame>;
}
export function DashboardCrop() {
  return <Frame icon="layers" title="Studio Noord" context="This week" footer={<><span>Production overview</span><span>4 active jobs</span></>}><div className="wf-crop-metrics"><div><span>Sheets</span><strong>38<small>k</small></strong></div><div><span>On press</span><strong>04</strong></div><div><span>Due</span><strong>02</strong></div></div><div className="wf-crop-list"><div><span>014</span><strong>Exhibition guide</strong><span>Review</span></div><div><span>015</span><strong>Studio journal</strong><span>On press</span></div><div><span>016</span><strong>Poster series</strong><span>Finishing</span></div></div></Frame>;
}
export function SocialCrop() {
  return <Frame icon="image" title="Studio 03" context="Following" footer={<><span>Mara / Print study</span><span>4 comments</span></>}><div className="wf-crop-photo"><img src="/interfaces/threads/press-sheet-v2.jpg" alt="" /></div></Frame>;
}
export function FleetCrop() {
  return <Frame icon="map" title="Dogpatch" context="San Francisco" footer={<><span>Van 04</span><span>4 sample vehicles</span></>}><div className="wf-crop-map"><svg viewBox="0 0 340 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path className="wf-crop-water" d="M260 0H340V200H268V165H295V145H266V120H300V95H260Z"/><g className="wf-crop-streets"><path d="M0 35H260M0 95H260M0 150H265M48 0V200M110 0V200M172 0V200M234 0V200" /></g><path className="wf-crop-route" d="M110 170V95H234V35H260" /><circle cx="110" cy="95" r="5" /><circle cx="260" cy="35" r="4" /><text x="270" y="73">Bay</text><text x="120" y="142">22nd St</text></svg><div className="wf-crop-map-pin"><Icon name="van" size={24} /><strong>04</strong></div><span><i />Dogpatch route</span></div></Frame>;
}
export function FoodCrop() {
  return <Frame icon="bag" title="Langestraat 12" context="Demo delivery" footer={<><span>Local bag</span><strong>2 items · €31.40</strong></>}><div className="wf-crop-food"><img src="/interfaces/food/joes-kitchen-v2.png" alt="" /><div><span>Joe's Kitchen</span><strong>Something good,<br />nearby.</strong><small>Sample 25–35 min</small></div></div><div className="wf-crop-dish"><span>Grilled chicken</span><strong>€15.00</strong></div></Frame>;
}
export function TeamCrop() {
  return <Frame icon="hash" title="North studio" context="Production" footer={<><span>Message the channel</span><Icon name="arrow-up" size={16} /></>}><div className="wf-crop-team"><div><span>MR</span><div><strong>Mara <small>09:12</small></strong><p>The revised proof is ready for review.</p></div></div><div className="wf-crop-thread"><Icon name="message" size={16} /><span>3 replies · Inez and you</span><Icon name="chevron-right" size={16} /></div><div><span>IN</span><div><strong>Inez <small>09:18</small></strong><p>I’ll check the separations before we send it to print.</p></div></div></div></Frame>;
}
export function WallpaperCrop() {
  return <Frame icon="image" title="Field studies" context="Collection 01" footer={<><span>Primary field</span><strong>6,144 × 3,456</strong></>}><div className="wf-crop-wallpaper"><svg viewBox="0 0 340 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="340" height="200" fill="#e7e5dd" /><path d="M0 30H340M0 70H340M0 110H340M0 150H340M40 0V200M100 0V200M160 0V200M220 0V200M280 0V200" stroke="#b9b3a5" strokeWidth=".5"/><rect x="50" y="35" width="100" height="120" fill="#2142c7" /><circle cx="255" cy="55" r="24" fill="#2142c7" /><path d="M0 200L340 115V200Z" fill="#171717"/><path d="M0 135H340" stroke="#171717" strokeWidth="7"/></svg></div></Frame>;
}
export function MobileOSCrop() {
  return <Frame icon="smartphone" title="Everyday apps" context="iOS / Android" footer={<><span>Home</span><span>16 core apps</span></>}><div className="wf-crop-os"><div><strong>9:41</strong><span>Tuesday, 8 September</span></div><div className="wf-crop-apps">{([['message', 'Messages'], ['calendar', 'Calendar'], ['image', 'Photos'], ['settings', 'Settings'], ['music', 'Music'], ['map', 'Maps'], ['file', 'Files'], ['edit', 'Notes']] as const).map(([icon, label]) => <div key={label}><span><Icon name={icon} size={24} /></span><small>{label}</small></div>)}</div></div></Frame>;
}
export function TransitCrop() {
  return <Frame icon="map" title="Your next stop" context="Travel planner" footer={<><span>Plan</span><span>Today</span><span>Profile</span></>}><div className="wf-crop-transit"><span>Saturday, 12 September</span><strong>Amsterdam<br />to Rotterdam</strong><div><b>10:24</b><span>Sample intercity<small>Direct · 44 min</small></span><Icon name="arrow-right" size={16} /></div><p><Icon name="check" size={12} />Sample trip saved for today</p></div></Frame>;
}
