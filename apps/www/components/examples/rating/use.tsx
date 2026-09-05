"use client";

import { Rating } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";

export function Use() {
  return <UseField name="rating"><h3 className="rs-use-type">A clear score</h3><div className="rs-use-body"><div className="rs-use-stack"><p className="rs-use-kicker">After the session</p><p className="rs-use-copy">Choose a score from one to five, or clear the answer.</p><Rating label="How useful was this?" name="usefulness" defaultValue={4} max={5} /></div></div></UseField>;
}
