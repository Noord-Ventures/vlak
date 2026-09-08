"use client";

import * as React from "react";

/** A fixed logical display scales as one drawing, rather than reflowing into a short card. */
export function DeviceFrame({ platform, children }: { platform: "ios" | "android"; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);
  const width = platform === "ios" ? 411 : 430;
  const height = platform === "ios" ? 870 : 933;
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const resize = () => setScale(Math.min(1, node.getBoundingClientRect().width / width));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(node);
    return () => observer.disconnect();
  }, [width]);
  return <div className="mo-device-fit" ref={ref} style={{ maxWidth: width, aspectRatio: `${width} / ${height}` }}>
    <div className="mo-handset" style={{ width, height, transform: `scale(${scale})` }}>
      <div className="mo-hardware" aria-hidden="true"><i className="mo-side-key mo-side-key-power" /><i className="mo-side-key mo-side-key-volume" />{platform === "ios" && <><i className="mo-side-key mo-side-key-action" /><i className="mo-side-key mo-side-key-volume-down" /></>}<i className="mo-antenna mo-antenna-top" /><i className="mo-antenna mo-antenna-bottom" /><i className="mo-earpiece" /></div>
      {children}
    </div>
  </div>;
}

export function StatusSignals({ platform, wifi, cellular }: { platform: "ios" | "android"; wifi: boolean; cellular: boolean }) {
  return <span className="mo-status-signals" aria-hidden="true">
    {platform === "ios" ? <svg width="19" height="12" viewBox="0 0 19 12"><g fill="currentColor" opacity={cellular ? 1 : .3}><rect y="8" width="3" height="4" rx=".7" /><rect x="5" y="5.5" width="3" height="6.5" rx=".7" /><rect x="10" y="3" width="3" height="9" rx=".7" /><rect x="15" width="3" height="12" rx=".7" /></g></svg> : null}
    {wifi && <svg width="17" height="13" viewBox="0 0 17 13"><g fill="currentColor"><path d="M.2 3.5a12 12 0 0 1 16.6 0L15.2 5a9.8 9.8 0 0 0-13.4 0Z" /><path d="M3.1 6.4a7.7 7.7 0 0 1 10.8 0L12.3 8a5.5 5.5 0 0 0-7.6 0Z" /><path d="M6 9.3a3.6 3.6 0 0 1 5 0L8.5 12Z" /></g></svg>}
    {platform === "android" && <svg width="13" height="13" viewBox="0 0 13 13"><path d="M1 12 12 1v11Z" fill="currentColor" opacity={cellular ? 1 : .3} /></svg>}
    <span className="mo-battery"><span /></span>
  </span>;
}
