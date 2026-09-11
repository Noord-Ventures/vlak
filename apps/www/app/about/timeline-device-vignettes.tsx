/** Macintosh 128K: compact case, curved CRT, disk slot, separate keyboard and mouse. */
export function ScreenVignette() {
  return <>
    <g className="lineage-drawing-guide">
      <path d="M28 108h139M49 9h5M121 9h5" />
    </g>
    <path className="lineage-drawing-paper" d="m54 17 7-8h54l6 8v65a3 3 0 0 1-3 3H57a3 3 0 0 1-3-3z" />
    <path d="M54 17h67M75 9v4h25V9M57 81h61M62 24h51v40H62z" />
    <path d="M69 27h37q5 0 5 6v22q0 6-5 6H69q-5 0-5-6V33q0-6 5-6Z" />
    <path d="M88 72h24v2H88zM106 71v4M63 75h4" />
    <g className="lineage-drawing-detail">
      <path d="M65 34h45M70 30h5M79 30h12M94 30h6M70 39h29v15H70zM70 43h29M73 41h2M80 41h14M74 47h4v4h-4zM82 47h4v4h-4zM102 39h4v5h-4zM102 53h4v4h-4z" />
      <path d="M61 12h10M103 12h12M56 20v58M119 20v58M63 68h17M58 85v2h59v-2" />
      <path d="M122 78c17-7 28-4 28 6" />
    </g>
    <path className="lineage-drawing-paper" d="M41 87.5h81a3 3 0 0 1 2.8 1.9l3.6 16.8H34.6l3.6-16.8a3 3 0 0 1 2.8-1.9Z" />
    <path className="lineage-drawing-detail" d="M34.6 106.2v.3q0 1 2 1h89.8q2 0 2-1v-.3M38 89h87" />
    <g className="lineage-drawing-detail">
      {[42.5, 50.5, 58.5, 66.5, 74.5, 82.5, 90.5, 98.5, 106.5, 114.5].map(x => <rect key={`top-${x}`} x={x} y="89.5" width="5.5" height="2.5" rx=".5" />)}
      <rect x="40" y="94.2" width="7.5" height="2.5" rx=".5" />
      {[50, 58, 66, 74, 82, 90, 98, 106].map(x => <rect key={`upper-${x}`} x={x} y="94.2" width="5.5" height="2.5" rx=".5" />)}
      <rect x="114" y="94.2" width="7.5" height="2.5" rx=".5" />
      <rect x="39" y="98.9" width="9" height="2.5" rx=".5" />
      {[50.5, 58.5, 66.5, 74.5, 82.5, 90.5, 98.5, 106.5].map(x => <rect key={`home-${x}`} x={x} y="98.9" width="5.5" height="2.5" rx=".5" />)}
      <rect x="114.5" y="98.9" width="9" height="2.5" rx=".5" />
      <rect x="38.5" y="103.6" width="8" height="2.1" rx=".5" />
      <rect x="49" y="103.6" width="6" height="2.1" rx=".5" />
      <rect x="57.5" y="103.6" width="6" height="2.1" rx=".5" />
      <rect x="66" y="103.6" width="32" height="2.1" rx=".5" />
      <rect x="100.5" y="103.6" width="6" height="2.1" rx=".5" />
      <rect x="109" y="103.6" width="6" height="2.1" rx=".5" />
      <rect x="117.5" y="103.6" width="8" height="2.1" rx=".5" />
    </g>
    <path className="lineage-drawing-paper" d="M146 84h8q3 0 4 4l4 13q1 4-3 4h-17q-4 0-3-4l3-13q1-4 4-4Z" />
    <path d="M146 88h8q1 0 1 1l1 4h-12l1-4q0-1 1-1Z" />
    <path className="lineage-drawing-detail" d="M142 102h17" />
  </>;
}

export function DesktopVignette() {
  return <>
    <g className="lineage-drawing-guide">
      <path d="M12 13h124M12 10v8M136 10v8M55 100h119" />
    </g>
    <rect className="lineage-drawing-paper" x="17" y="18" width="117" height="65" rx="2" />
    <path d="M17 29h117M17 75h117M24 22h4v4h-4zM36 23h36M95 23h15M124 22h4v4h-4z" />
    <g className="lineage-drawing-detail">
      <path d="M25 36h8v10h-8zM39 37h32M39 42h24M25 52h8v10h-8zM39 53h26M39 58h31M25 69h19M48 69h15" />
      <path d="M80 35h45v31H80zM85 40h23M85 45h32M85 50h26M85 55h30M85 60h19M120 35v31M120 40h5v11h-5" />
    </g>
    <rect className="lineage-drawing-paper" x="58" y="40" width="112" height="56" rx="2" />
    <path d="M58 50h112M58 59h112M58 87h112M65 44h4v3h-4zM78 45h36M158 44h5v3h-5z" />
    <g className="lineage-drawing-detail">
      <path d="M65 55h11M82 55h14M104 55h9M138 55h9M153 55h10M94 59v28M160 59v28" />
      <path d="M65 64h4v4h-4zM74 66h13M65 74h4v4h-4zM74 76h10M101 64h8v10h-8zM116 66h32M116 71h23M116 79h29M162 64h5v10h-5M64 92h23M151 92h12" />
    </g>
    <g className="lineage-drawing-detail">
      <path d="M13 104h158M20 101h10M39 101h17M66 101h17M145 101h17" />
    </g>
  </>;
}

export function TouchVignette() {
  return <>
    <g className="lineage-drawing-guide">
      <path d="M9 5h61M9 108h61M76 27h101M76 108h101" />
    </g>
    <rect className="lineage-drawing-paper" x="79" y="32" width="96" height="72" rx="6" />
    <rect x="85" y="38" width="80" height="60" rx="1" />
    <path d="M85 49h80" />
    <circle cx="170" cy="68" r="2" />
    <g className="lineage-drawing-detail">
      <path d="M92 44h16M138 44h19M92 58h26v19H92zM127 58h30v19h-30zM92 84h26M127 84h30M92 90h19M127 90h23" />
    </g>
    <rect className="lineage-drawing-paper" x="15" y="7" width="52" height="97" rx="8" />
    <rect x="21" y="22" width="40" height="64" rx="1" />
    <path d="M34 14h14M21 33h40" />
    <circle cx="41" cy="95" r="4" />
    <g className="lineage-drawing-detail">
      <path d="M26 28h10M48 28h8M27 41h28M27 46h20M27 55h28v18H27zM27 79h21" />
      <path d="M73 21c20-18 52-17 70-3m-8 0h8v-8" />
    </g>
    <g className="lineage-drawing-guide">
      <circle cx="53" cy="67" r="6" />
      <path d="M47 67h12M53 61v12" />
    </g>
  </>;
}
