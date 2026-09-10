import "@noorddev/vlak-react/css";
import { Button, Field, FieldLabel, Input, Select, Switch } from "@noorddev/vlak-react";
import { createRoot } from "react-dom/client";
import "./style.css";

function App() {
  return (
    <main>
      <form onSubmit={(event) => event.preventDefault()}>
        <header><p>Account</p><h1>Working preferences</h1></header>
        <Field><FieldLabel htmlFor="name">Name</FieldLabel><Input plain id="name" defaultValue="Ada Lovelace" /></Field>
        <Field><FieldLabel id="timezone-label">Timezone</FieldLabel><Select aria-labelledby="timezone-label" defaultValue="europe-amsterdam" options={[{ value: "europe-amsterdam", label: "Europe / Amsterdam" }, { value: "america-new-york", label: "America / New York" }]} /></Field>
        <Switch aria-label="Weekly summary" defaultChecked />
        <Button type="submit">Save preferences</Button>
      </form>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
