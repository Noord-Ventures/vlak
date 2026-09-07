"use client";

import { useState } from "react";
import { ChannelStrip } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker, UseCopy } from "../use-frame";

export function Use() {
  const [channel, setChannel] = useState({ gain: -3, pan: 0, muted: false, solo: false });
  return <UseField name="channel-strip"><UseType>Shape one channel</UseType><UseBody><UseStack><UseKicker>Dialogue mix</UseKicker><ChannelStrip label="Interview" value={channel} onValueChange={setChannel} /><UseCopy>Controls update the local channel state in this example.</UseCopy></UseStack></UseBody></UseField>;
}
