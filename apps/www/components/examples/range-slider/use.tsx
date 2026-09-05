"use client";

import { RangeSlider } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";

export function Use() {
  return <UseField name="range-slider"><h3 className="rs-use-type">A useful interval</h3><div className="rs-use-body"><div className="rs-use-stack"><p className="rs-use-kicker">Project search</p><p className="rs-use-copy">Set the lower and upper budget. Neither endpoint can cross the other.</p><RangeSlider label="Budget" name="budget" defaultValue={[120, 420]} min={0} max={800} step={20} formatValue={(value) => `€${value}`} /></div></div></UseField>;
}
