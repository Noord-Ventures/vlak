"use client";

import { ErrorSummary, Input } from "@noorddev/vlak-react";
import { useId } from "react";

export function Use() {
  const emailId = useId();
  return <div className="rs-use-stack"><ErrorSummary errors={[{ id: emailId, message: "Enter an email address" }]} /><Input id={emailId} label="Email" type="email" error="Enter an email address" /></div>;
}
