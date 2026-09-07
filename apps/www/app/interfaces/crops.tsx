import type { ReactNode } from "react";
import { Icon } from "@noorddev/vlak-react";
import { sx } from "@/lib/sx";
import { type InterfaceSlug, interfaceBySlug } from "./catalog";
import { interfaces } from "./interfaces.stylex";
import { DocumentationCrop } from "./documentation/crop";
import { MusicPlayerCrop } from "./music-player/crop";
import { ChatCrop, DashboardCrop, SocialCrop, FleetCrop, FoodCrop, TeamCrop, WallpaperCrop, MobileOSCrop, TransitCrop } from "./workflow-crops";
import "./agents/crop.css";
import "./concepts/render-crop.css";
import { MicrobiologyCrop, GenomeCrop, ProteinCrop, RoboticsCrop, CircuitryCrop, IdentityCrop, PatientCrop, MusicCrop } from "./specialist-crops";

function AgentsCrop() {
  return (
    <div className="if-crop-scene if-crop-agents">
      <header><span><Icon name="layers" size={16} /> Website release</span><span>5 agents</span></header>
      <div className="if-crop-agents-summary"><span><i />2 running</span><span>1 needs review</span></div>
      <div className="if-crop-agents-work">
        <div className="if-crop-agents-queue">
          <div><Icon name="activity" size={16} /><span><b>Account settings</b><small>Frontend · working</small></span></div>
          <div data-selected="true"><Icon name="user-check" size={16} /><span><b>Keyboard audit</b><small>Needs review</small></span></div>
          <div><Icon name="activity" size={16} /><span><b>Mobile layouts</b><small>Responsive · working</small></span></div>
        </div>
        <div className="if-crop-agents-detail">
          <span>Accessibility agent</span><b>Ready for<br />your review.</b>
          <div className="if-crop-agents-trace"><span><Icon name="check" size={12} />18 checks passed</span><span><Icon name="check" size={12} />2 files prepared</span><span><Icon name="user-check" size={12} />Awaiting approval</span></div>
          <div className="if-crop-agents-approval"><Icon name="check" size={12} />Approve review</div>
        </div>
      </div>
    </div>
  );
}

function RenderCrop() {
  return <div className="if-crop-scene if-crop-render">
    <header className="if-crop-console-head"><Icon name="layers" size={16} /><div><strong>Vehicle study 01</strong><span>Surface inspection</span></div><span>Fine lines</span></header>
    <div className="if-crop-model-view rw-crop-model"><img className="rw-crop-light" src="/interfaces/concepts/vehicle-line-preview-light-v1.png" alt="" /><img className="rw-crop-dark" src="/interfaces/concepts/vehicle-line-preview-dark-v1.png" alt="" /><div className="if-crop-model-tools">{(["refresh", "grid", "camera"] as const).map(name => <i key={name}><Icon name={name} size={16} /></i>)}</div></div>
    <footer className="if-crop-console-foot"><span>Perspective view</span><span>204,453 triangles</span></footer>
  </div>;
}

function DriveCrop() {
  return <div className="if-crop-scene if-crop-drive">
    <header className="if-crop-console-head"><Icon name="sliders" size={16} /><div><strong>Vehicle 01</strong><span>Parked / connected</span></div><Icon name="lock" size={16} /></header>
    <div className="if-crop-vehicle-art rw-crop-model"><img className="rw-crop-light" src="/interfaces/concepts/vehicle-line-preview-light-v1.png" alt="" /><img className="rw-crop-dark" src="/interfaces/concepts/vehicle-line-preview-dark-v1.png" alt="" /></div>
    <div className="if-crop-ev-status"><div><span>Range · 84%</span><strong>386 <small>km</small></strong></div><div><span>Cabin</span><strong>20<small>°</small></strong></div><div><span>Media</span><strong>Loathe</strong></div></div>
  </div>;
}

function OrbitCrop() {
  return <div className="if-crop-scene if-crop-orbit">
    <header className="if-crop-console-head"><Icon name="crosshair" size={16} /><div><strong>Asteria-3</strong><span>North Sea pass</span></div><span>Local</span></header>
    <div className="if-crop-observation" style={{ background: "var(--control-fill)", color: "var(--text)" }}>
      <svg viewBox="120 70 420 430" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
        <g fill="var(--bg)" stroke="var(--text-secondary)" strokeWidth="1">
          <path d="M397 0L386 25 372 48 357 66 365 85 353 102 343 107 335 128 344 139 336 150 342 171 353 189 371 202 390 194 407 175 417 151 438 139 445 119 458 107 472 89 481 62 495 33 512 0Z" />
          <path d="M640 176L583 173 555 186 532 195 509 195 491 204 481 225 467 229 456 244 435 249 421 268 409 273 394 267 380 275 366 281 353 299 337 307 315 307 298 316 281 319 264 310 253 318 265 333 285 340 297 356 291 377 307 390 321 399 333 417 330 431 308 438 286 434 268 439 247 431 230 445 214 442 206 460 203 480 219 493 221 507 242 516 273 522 299 509 321 509 333 494 345 482 354 461 372 447 389 447 406 454 419 471 430 480 438 477 431 466 421 454 414 439 410 424 422 410 438 416 450 433 463 450 481 469 496 471 502 487 514 497 520 486 514 469 527 455 537 450 546 462 558 476 576 483 594 504 617 518 640 520Z" />
          <path d="M233 125L248 122 244 139 256 147 250 166 261 171 259 187 268 196 263 213 274 226 282 230 288 246 280 259 292 269 297 284 287 296 263 294 248 301 229 303 217 298 230 285 222 276 229 265 223 252 233 246 226 229 229 215 218 207 228 194 219 177 228 169 218 157 231 149Z" />
          <path d="M195 192L211 190 220 202 211 213 220 224 212 240 198 247 187 242 182 251 168 248 162 238 175 230 168 218 181 215 179 203Z" />
        </g>
        <path d="M128 0V560M192 0V560M256 0V560M320 0V560M384 0V560M448 0V560M512 0V560M576 0V560M0 112H640M0 168H640M0 224H640M0 280H640M0 336H640M0 392H640M0 448H640M0 504H640" fill="none" stroke="var(--divider)" strokeWidth=".6" />
        <path d="M198 580Q308 413 368 273T518 -20M218 580Q328 413 388 273T538 -20" fill="none" stroke="currentColor" strokeWidth=".6" opacity=".25" />
        <path d="M208 580Q318 413 378 273T528 -20" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 5" />
        <g transform="translate(378 273)" fill="none" stroke="currentColor"><path d="M-11 0H-6M6 0H11M0 8V15" /><circle r="3" fill="var(--bg)" /></g>
        <g fill="var(--text-secondary)" fontSize="12"><text x="301" y="214">North Sea</text><text x="321" y="379">France</text></g>
      </svg>
      <span>52.37° N · 4.90° E</span>
    </div>
    <footer className="if-crop-console-foot"><span>Acquisition window</span><strong>11:42–11:49</strong></footer>
  </div>;
}

function FrontierCrop() {
  return (
    <div className="if-crop-scene if-crop-athena" style={{ position: "absolute", inset: 0, padding: 20, background: "var(--bg)", color: "var(--text)", overflow: "hidden" }}>
      <div style={{ position: "absolute", insetInlineEnd: -10, insetBlock: "24px 14px", width: "57%", background: "currentColor", maskImage: "url(/interfaces/concepts/athena-still.svg)", maskSize: "auto 120%", maskPosition: "center", maskRepeat: "no-repeat", opacity: 1 }} />
      <span style={{ position: "relative", fontSize: 12 }}>Athena Labs</span>
      <b style={{ position: "relative", display: "block", width: "57%", marginTop: 28, fontSize: "clamp(21px,6.5cqi,28px)", lineHeight: 1.08, letterSpacing: "-.045em", fontWeight: 500 }}>Reasoning models for research and engineering.</b>
      <em style={{ position: "absolute", insetInlineStart: 20, insetBlockEnd: 20, fontSize: 12, fontStyle: "normal" }}>Athena 2 →</em>
    </div>
  );
}

const CROPS: Record<InterfaceSlug, () => ReactNode> = {
  line: ChatCrop,
  press: DashboardCrop,
  wall: SocialCrop,
  night: FleetCrop,
  evening: FoodCrop,
  room: TeamCrop,
  agents: AgentsCrop,
  graphics: WallpaperCrop,
  render: RenderCrop,
  drive: DriveCrop,
  orbit: OrbitCrop,
  frontier: FrontierCrop,
  platforms: TransitCrop,
  "mobile-os": MobileOSCrop,
  microbiology: MicrobiologyCrop,
  genome: GenomeCrop,
  protein: ProteinCrop,
  robotics: RoboticsCrop,
  circuitry: CircuitryCrop,
  identity: IdentityCrop,
  patient: PatientCrop,
  music: MusicCrop,
  documentation: DocumentationCrop,
  "music-player": MusicPlayerCrop,
};

export function InterfaceCrop({ slug }: { slug: InterfaceSlug }) {
  const Crop = CROPS[slug];
  return (
    <div {...sx("if-crop", interfaces.crop)} aria-hidden="true">
      <Crop />
    </div>
  );
}
