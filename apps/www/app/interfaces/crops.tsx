import type { ReactNode } from "react";
import { Icon } from "@noorddev/vlak-react";
import { sx } from "@/lib/sx";
import { type InterfaceSlug, interfaceBySlug } from "./catalog";
import { interfaces } from "./interfaces.stylex";
import { Mark } from "./mark";
import "./agents/crop.css";

function Lockup({ slug }: { slug: InterfaceSlug }) {
  const proto = interfaceBySlug(slug)!;
  return (
    <p className="if-crop-lockup">
      <Mark slug={slug} />
      <span>{proto.title}</span>
    </p>
  );
}

function LineCrop() {
  return (
    <div className="if-crop-scene if-crop-lijn">
      <Lockup slug="line" />
      <p className="if-crop-kicker">A closer reading</p>
      <p className="if-crop-line">
        Digital Bath:<br />
        beauty beside
        <br />
        implied danger.
      </p>
      <div className="if-crop-dock">
        <span>Write a message</span>
        <span className="if-crop-send">Send</span>
      </div>
    </div>
  );
}

function PressCrop() {
  return (
    <div className="if-crop-scene if-crop-pers">
      <Lockup slug="press" />
      <p className="if-crop-kicker">Sheets this week</p>
      <p className="if-crop-numeral">38</p>
      <p className="if-crop-spot" style={{ color: "#E30613" }}>
        4 on press
      </p>
      <svg className="if-crop-chart" viewBox="0 0 320 80" aria-hidden="true">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          points="0,54 53,42 106,48 159,18 212,24 265,58 320,64"
        />
      </svg>
    </div>
  );
}

function WallCrop() {
  return (
    <div className="if-crop-scene if-crop-muur">
      <img src="/interfaces/threads/press-sheet-v2.jpg" alt="" />
      <p className="if-crop-line">Mara shared a new print study</p>
    </div>
  );
}

function NightCrop() {
  return (
    <div className="if-crop-scene if-crop-nacht">
      <div className="if-crop-nacht-grid" />
      <Lockup slug="night" />
      <svg className="if-crop-route" viewBox="0 0 348 200" aria-hidden="true"><path d="M-20 160 H104 V72 H242 V28 H370"/><circle cx="104" cy="116" r="6"/><circle cx="242" cy="28" r="4"/></svg>
      <p className="if-crop-fleet-status"><b>Van 04</b><span>Market / 3rd · moving</span></p>
    </div>
  );
}

function EveningCrop() {
  return (
    <div className="if-crop-scene if-crop-avond">
      <img src="/interfaces/food/de-buren-v2.jpg" alt="" />
      <p className="if-crop-line">Roast chicken, tonight</p>
    </div>
  );
}

function RoomCrop() {
  return (
    <div className="if-crop-scene if-crop-kamer">
      <Lockup slug="room" />
      <p className="if-crop-kicker"># Production</p>
      <p className="if-crop-line">
        The revised proof is ready for review.
      </p>
      <p className="if-crop-reply">
        I’ll check the colour separations before we send it to print.
        <em>Inez · 09:18</em>
      </p>
    </div>
  );
}

function GraphicsCrop() {
  return (
    <div className="if-crop-scene if-crop-graphics">
      <i className="if-wallpaper-a" />
      <i className="if-wallpaper-b" />
      <i className="if-wallpaper-c" />
    </div>
  );
}

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
  return (
    <div className="if-crop-scene if-crop-render">
      <div className="if-crop-tools">{(["move", "refresh", "expand", "grid", "camera"] as const).map((name) => <i key={name}><Icon name={name} size={16} /></i>)}</div>
      <img src="/interfaces/concepts/vehicle-model-preview.jpg" alt="" />
      <span>Perspective · vehicle study</span>
    </div>
  );
}

function DriveCrop() {
  return (
    <div className="if-crop-scene if-crop-drive">
      <header><span>09:41</span><strong>Vehicle systems</strong><span>18°C · LTE</span></header>
      <div className="if-crop-ev-name">Vehicle 01 <span>Electric concept</span></div>
      <img src="/interfaces/concepts/vehicle-line-v5.png" alt="" />
      <div className="if-crop-ev-status"><div><span>Range</span><strong>386 <small>km</small></strong></div><div><span>Battery</span><strong>84<small>%</small></strong></div><div><span>Cabin</span><strong>20<small>°</small></strong></div></div>
    </div>
  );
}

function OrbitCrop() {
  return (
    <div className="if-crop-scene if-crop-orbit">
      <img src="/interfaces/concepts/europe-observation-v1.jpg" alt="" />
      <i className="if-crop-reticle" />
      <span>52.37° N · 4.90° E</span>
    </div>
  );
}

function FrontierCrop() {
  return (
    <div className="if-crop-scene if-crop-frontier">
      <span>Aster Labs</span>
      <b>Reasoning models for research and engineering.</b>
      <em>Aster 2 →</em>
    </div>
  );
}

function PlatformsCrop() {
  return (
    <div className="if-crop-scene if-crop-platforms">
      <div className="ios"><i /><span>9:41</span><b>Rotterdam</b><p>Intercity 1135<br /><em>On time</em></p><nav>Plan&nbsp;&nbsp; Today&nbsp;&nbsp; You</nav></div>
      <div className="android"><span>5G · 82%</span><header>‹&nbsp;&nbsp; Rotterdam&nbsp;&nbsp; ⋮</header><p>Intercity 1135<br /><em>On time</em></p><nav>Plan&nbsp;&nbsp; Today&nbsp;&nbsp; You</nav></div>
    </div>
  );
}

const CROPS: Record<InterfaceSlug, () => ReactNode> = {
  line: LineCrop,
  press: PressCrop,
  wall: WallCrop,
  night: NightCrop,
  evening: EveningCrop,
  room: RoomCrop,
  agents: AgentsCrop,
  graphics: GraphicsCrop,
  render: RenderCrop,
  drive: DriveCrop,
  orbit: OrbitCrop,
  frontier: FrontierCrop,
  platforms: PlatformsCrop,
};

export function InterfaceCrop({ slug }: { slug: InterfaceSlug }) {
  const Crop = CROPS[slug];
  return (
    <div {...sx("if-crop", interfaces.crop)} aria-hidden="true">
      <Crop />
    </div>
  );
}
