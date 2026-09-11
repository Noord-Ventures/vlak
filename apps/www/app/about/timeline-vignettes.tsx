import { DesktopVignette, ScreenVignette, TouchVignette } from "./timeline-device-vignettes";

type VignetteProps = { kind: "grid" | "screen" | "publishing" | "desktop" | "touch" | "agents" };

/** A twenty-field typographic grid with margins, gutters, and baseline rhythm. */
function GridVignette() {
  const columns = [45, 69, 93, 117];
  const rows = [21, 35, 49, 63, 77];
  return <>
    <rect x="33" y="7" width="117" height="98" />
    <g className="lineage-drawing-guide">
      <path d="M29 7h-6M33 3V1M154 7h6M150 3V1M29 105h-6M33 109v2M154 105h6M150 109v2" />
      <path d="M39 17h105M39 91h105M41 15v80M142 15v80M21 21v66m-3-66h6m-6 66h6" />
      {rows.map(y => <path key={y} d={`M45 ${y + 5}h93`} />)}
    </g>
    <g className="lineage-drawing-detail">
      {columns.flatMap(x => rows.map(y => <rect key={`${x}-${y}`} x={x} y={y} width="21" height="10" />))}
      <path d="M45 13h21m3 0h21m3 0h21m3 0h21M45 11v4m21-4v4m3-4v4m21-4v4m3-4v4m21-4v4m3-4v4m21-4v4M45 97h13M129 97h9" />
    </g>
    <path d="M45 21h45v24H45zM93 21h45v10H93zM93 35h21v24H93zM117 35h21v24h-21zM45 63h21v24H45zM69 63h21v24H69zM93 63h45v24H93z" />
  </>;
}

/** A typesetting artboard and a vector curve, distinct from an operating-system window. */
function PublishingVignette() {
  return <>
    <g className="lineage-drawing-guide">
      <path d="M46 7h98M43 12v91M49 4v6M139 4v6M40 12h6M40 103h6M46 107h98" />
      <path d="M59 5v4M69 5v4M79 5v4M89 5v4M99 5v4M109 5v4M119 5v4M129 5v4M41 22h4M41 32h4M41 42h4M41 52h4M41 62h4M41 72h4M41 82h4M41 92h4" />
    </g>
    <rect className="lineage-drawing-paper" x="49" y="12" width="90" height="91" />
    <path className="lineage-drawing-guide" d="M57 19h74M57 95h74M57 19v76M131 19v76M92 19v76M96 19v76" />
    <path d="m60 42 7-17 7 17m-11-6h9M86 32c-10-4-13 13-3 10l3-2m0-8v10" />
    <g className="lineage-drawing-detail">
      <path d="M99 27h26M99 32h21M99 37h25M58 51h31M58 55h31M58 59h26M58 67h31M58 71h31M58 75h22M58 83h31M58 87h25M58 95h14M119 95h12" />
    </g>
    <rect className="lineage-drawing-paper" x="14" y="19" width="20" height="80" rx="3" />
    <g className="lineage-drawing-detail">
      <path d="M20 24v10l3-3 3 5 2-1-3-5h5z" />
      <path d="M20 42h8M20 42v2M28 42v2M24 42v9M21 51h6" />
      <rect x="20" y="58" width="8" height="8" />
      <path d="m24 72-4 7 4 4 4-4zM24 76v7" />
      <path d="m20 93 8-5" />
      <circle cx="20" cy="93" r="1" /><circle cx="28" cy="88" r="1" />
    </g>
    <rect className="lineage-drawing-paper" x="100" y="51" width="69" height="36" />
    <g className="lineage-drawing-guide">
      <path d="M99 50h4v4h-4zM166 50h4v4h-4zM99 84h4v4h-4zM166 84h4v4h-4zM109 78l13-22M145 56l14 15" />
      <circle cx="122" cy="56" r="1.5" /><circle cx="145" cy="56" r="1.5" />
    </g>
    <path d="M109 78c13-22 36-22 50-7" />
    <path className="lineage-drawing-paper" d="M107 76h4v4h-4zM157 69h4v4h-4z" />
  </>;
}

function AgentsVignette() {
  return <>
    <g className="lineage-drawing-guide">
      <path d="M56 9h56M56 105h56M136 82h39" />
      <path strokeDasharray="1 4" d="M47 19v29M123 66v28" />
    </g>
    <path d="M33 57h14V30h13M47 57v27h13M108 30h15v54h-15M123 57h15" />
    <path className="lineage-drawing-paper" d="M9 38h17l8 8v29H9z" />
    <path d="M26 38v8h8" />
    <path className="lineage-drawing-detail" d="M15 52h13M15 58h13M15 64h9M15 70h11" />
    <rect className="lineage-drawing-paper" x="60" y="14" width="48" height="33" rx="2" />
    <rect className="lineage-drawing-paper" x="60" y="67" width="48" height="33" rx="2" />
    <path d="M60 25h48M60 78h48" />
    <g className="lineage-drawing-detail">
      <circle cx="67" cy="20" r="2" /><circle cx="67" cy="73" r="2" />
      <path d="M73 20h13M73 73h18M98 20h4M98 73h4M66 31h5v5h-5zM66 39h5M77 31h24M77 35h18M77 41h21" />
      <path d="m65 85 2 2 4-4M77 84h24M77 88h16M65 95l2 2 4-4M77 94h24" />
    </g>
    <rect className="lineage-drawing-paper" x="138" y="38" width="35" height="39" rx="2" />
    <path d="M138 49h35M144 44h14" />
    <g className="lineage-drawing-detail">
      <path d="m144 57 2 2 4-4M154 57h13M144 65h23M144 70h17M65 105h7m3 0h7m3 0h7M139 84h7m3 0h7m3 0h7" />
    </g>
    <g className="lineage-drawing-paper">
      <circle cx="47" cy="57" r="2.5" /><circle cx="123" cy="57" r="2.5" />
      <circle cx="60" cy="30" r="1.5" /><circle cx="108" cy="30" r="1.5" />
      <circle cx="60" cy="84" r="1.5" /><circle cx="108" cy="84" r="1.5" />
      <circle cx="138" cy="57" r="1.5" />
    </g>
  </>;
}

/** Decorative, original drawings. Milestone text carries the historical content. */
export function TimelineVignette({ kind }: VignetteProps) {
  const content = kind === "grid" ? <GridVignette />
    : kind === "screen" ? <ScreenVignette />
      : kind === "publishing" ? <PublishingVignette />
        : kind === "desktop" ? <DesktopVignette />
          : kind === "touch" ? <TouchVignette />
            : <AgentsVignette />;
  return <svg className="lineage-drawing" viewBox="0 0 184 112" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{content}</svg>;
}
