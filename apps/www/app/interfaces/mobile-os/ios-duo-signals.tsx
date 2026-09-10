/** Browser drawing of the Duo kit's 46pt status ring; no Apple artwork is bundled. */
export function IOSDuoSignals({ wifi, cellular, battery = 84 }: { wifi: boolean; cellular: boolean; battery?: number }) {
  const charge = Math.max(0, Math.min(100, battery));
  return <svg className="mo-duo-signals" width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden="true">
    <path className="mo-duo-battery-track" d="M9.5 34.8a18 18 0 1 1 27 0" pathLength="100" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M9.5 34.8a18 18 0 1 1 27 0" pathLength="100" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${charge} 100`} />
    {wifi && <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15.5 18.5a10.7 10.7 0 0 1 15 0M18.8 22a6 6 0 0 1 8.4 0" /><path d="M23 25.6h.01" strokeWidth="3.5" /></g>}
    <g fill="currentColor" opacity={cellular ? 1 : 0.25}>
      <rect x="11.5" y="36.5" width="4" height="4" rx="1.8" />
      <rect x="17.8" y="38.9" width="4" height="4" rx="1.8" />
      <rect x="24.5" y="38.9" width="4" height="4" rx="1.8" />
      <rect x="30.8" y="36.5" width="4" height="4" rx="1.8" />
    </g>
  </svg>;
}
