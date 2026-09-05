"use client";

import { NumberField } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";

export function Use() {
  return <UseField name="number-field"><h3 className="rs-use-type">Cabin comfort</h3><div className="rs-use-body"><div className="rs-use-stack"><p className="rs-use-kicker">Both zones</p><p className="rs-use-copy">Adjust in half-degree steps. Increase sits above decrease.</p><NumberField label="Temperature" name="temperature" defaultValue={20} min={16} max={28} step={0.5} unit="°C" controlsPlacement="stacked" /></div></div></UseField>;
}
