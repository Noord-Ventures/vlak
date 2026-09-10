"use client";

import { Button, Field, FieldLabel, Input, Textarea } from "@noorddev/vlak-react";

export default function Page() {
  return (
    <main>
      <form onSubmit={(event) => event.preventDefault()}>
        <header><p>Project</p><h1>Define the work</h1></header>
        <Field><FieldLabel htmlFor="title">Title</FieldLabel><Input plain id="title" defaultValue="New interface" /></Field>
        <Field><FieldLabel htmlFor="question">Open question</FieldLabel><Textarea id="question" defaultValue="What must still work when the data is incomplete?" /></Field>
        <Button type="submit">Save brief</Button>
      </form>
    </main>
  );
}
