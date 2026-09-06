"use client";

import { useState } from "react";
import { CheckIn } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker, UseCopy } from "../use-frame";

export function Use() {
  const [answer, setAnswer] = useState<string | null>("steady");
  return <UseField name="check-in"><UseType>A moment to check in</UseType><UseBody><UseStack><UseKicker>Before your session</UseKicker><CheckIn label="How is your energy?" description="Choose the answer that fits right now." name="energy" value={answer} onValueChange={setAnswer} options={[{ value: "low", label: "Low" }, { value: "steady", label: "Steady" }, { value: "high", label: "High" }]} /><UseCopy>{answer == null ? "No answer selected" : "You can change or clear your answer."}</UseCopy></UseStack></UseBody></UseField>;
}
