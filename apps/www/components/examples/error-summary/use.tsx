"use client";

import { ErrorSummary, Form, Input } from "@noorddev/vlak-react";
import { useId } from "react";

export function Use() {
  const emailId = useId();
  return (
    <Form onSubmit={(event) => event.preventDefault()}>
      <ErrorSummary title="Check your details" errors={[{ id: emailId, message: "Enter an email address" }]} />
      <Input id={emailId} label="Email" type="email" error="Enter an email address" />
    </Form>
  );
}
