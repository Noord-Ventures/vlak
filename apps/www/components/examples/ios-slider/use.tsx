"use client";
import * as React from "react";
import { IOSSlider, Icon } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";
export function Use() {
  const [volume, setVolume] = React.useState(40); const id = React.useId();
  return <UseField name="ios-slider"><h3 className="rs-use-type">Listening level</h3><div className="rs-use-stack"><label htmlFor={id} className="rs-use-kicker">Volume</label><div className="rs-use-row"><Icon name="volume" size={24} /><IOSSlider id={id} value={volume} onValueChange={setVolume} min={0} max={100} step={5} aria-valuetext={`${volume} percent`} /></div><output htmlFor={id} className="rs-use-copy">{volume}%</output></div></UseField>;
}
