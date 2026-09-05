"use client";
import { useState } from "react";
import { CanvasControls } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseCopy } from "../use-frame";
export function Use() {
  const [zoom, setZoom] = useState(1);
  return <UseField name="canvas-controls"><UseType>The whole picture</UseType><UseBody><UseStack><UseCopy>Canvas scale · {Math.round(zoom * 100)}%</UseCopy><CanvasControls zoom={zoom} onZoomChange={setZoom} onFit={() => setZoom(0.75)} /></UseStack></UseBody></UseField>;
}
