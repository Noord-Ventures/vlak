"use client";

import * as React from "react";
import { Button, Icon } from "@noorddev/vlak-react";

/** Native capture arrangement; every control acts on the local sample scene. */
export function IOSCamera({ photoSrc, onCapture, onLibrary }: { photoSrc: string; onCapture: () => void; onLibrary: () => void }) {
  const [zoom, setZoom] = React.useState(1);
  const [grid, setGrid] = React.useState(false);
  const [capture, setCapture] = React.useState(0);
  return <div className="mo-ios-camera-app">
    <div className="mo-ios-camera-viewfinder">
      <img src={photoSrc} alt="Sample camera scene of studio posters" style={{ transform: `scale(${zoom})` }} />
      {grid && <div className="mo-camera-grid" aria-hidden="true" />}
      {capture > 0 && <span className="mo-ios-camera-flash" key={capture} aria-hidden="true" />}
      <span className="mo-ios-camera-sample">Sample camera</span>
      <div className="mo-ios-camera-lenses" role="group" aria-label="Camera zoom">
        {[1, 2].map(value => <Button variant="ghost" key={value} aria-label={`${value}× zoom`} aria-pressed={zoom === value} onClick={() => setZoom(value)}>{value}<span>×</span></Button>)}
      </div>
    </div>
    <div className="mo-ios-camera-capture">
      <span className="mo-ios-camera-mode">Photo</span>
      <div className="mo-ios-camera-controls">
        <Button variant="ghost" aria-label="Open Photos" className="mo-ios-camera-library" onClick={onLibrary}><img src={photoSrc} alt="" /></Button>
        <Button variant="ghost" aria-label="Capture sample photo" className="mo-ios-camera-shutter" onClick={() => { onCapture(); setCapture(value => value + 1); }}><span aria-hidden="true" /></Button>
        <Button variant="ghost" aria-label="Camera grid" aria-pressed={grid} className="mo-ios-camera-grid-toggle" onClick={() => setGrid(value => !value)}><Icon name="grid" size={24} style={{ width: 24, height: 24 }} /></Button>
      </div>
      <p className="mo-caption">Captures this scene to your local photo library.</p>
    </div>
  </div>;
}
